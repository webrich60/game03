import * as T from './vendor/three.module.min.js';
import {findCat} from './cats.js';
const palette={monaka:{fur:0x9d8c7c,stripe:0x514b47,eye:0xa9b970,scarf:0x9bd7bd},ohagi:{fur:0x292932,stripe:0x23232a,eye:0x91b594,scarf:0xeaa4ab},daifuku:{fur:0xc5c2c5,stripe:0x777781,eye:0x84b9aa,scarf:0xe7c26f},castella:{fur:0x9d8e7e,stripe:0x56504b,caramel:0xd3b18f,eye:0xa9ad78,scarf:0xb9a9dc}};
const mat=(color,opts={})=>new T.MeshStandardMaterial({color,roughness:.83,...opts});
const white=mat(0xfff5e7),pink=mat(0xe5a1a8),black=mat(0x282932),shine=mat(0xffffff,{roughness:.15});
const sphere=new T.SphereGeometry(1,24,18);
function ell(parent,material,x,y,z,sx,sy,sz){const m=new T.Mesh(sphere,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function tube(parent,points,r,material){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const m=new T.Mesh(new T.TubeGeometry(curve,28,r,8,false),material);m.castShadow=true;parent.add(m);return m;}
function ear(parent,x,y,z,material,clipped=false){const g=new T.Group();g.position.set(x,y,z);g.rotation.z=x<0?.20:-.20;g.name=x>0?'left-ear':'right-ear';g.userData={anatomicalSide:x>0?'left':'right',clipped};parent.add(g);if(clipped){const outline=[[-.23,0],[.23,0],[.075,.30],[.035,.36],[-.012,.28],[-.055,.36],[-.105,.28]],poly=outline.map(p=>new T.Vector2(...p)),faces=T.ShapeUtils.triangulateShape(poly,[]).map(f=>{const [a,b,c]=f,pa=outline[a],pb=outline[b],pc=outline[c];return (pb[0]-pa[0])*(pc[1]-pa[1])-(pb[1]-pa[1])*(pc[0]-pa[0])<0?[a,c,b]:f;}),depth=y=>.13*(1-y/.5),front=outline.map(([x,y])=>[x,y,depth(y)]),back=outline.map(([x,y])=>[x,y,-depth(y)]),verts=[];for(const f of faces){verts.push(...f.flatMap(i=>front[i]),...f.slice().reverse().flatMap(i=>back[i]));}for(let i=0;i<outline.length;i++){const j=(i+1)%outline.length;verts.push(...front[i],...back[i],...back[j],...front[i],...back[j],...front[j]);}const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute(verts,3));geom.computeVertexNormals();const outer=new T.Mesh(geom,material);outer.castShadow=true;g.add(outer);const inner=outline.map(([x,y])=>{const py=y*.75+.05;return [x*.65,py,depth(py)+.006];}),innerGeo=new T.BufferGeometry();innerGeo.setAttribute('position',new T.Float32BufferAttribute(faces.flatMap(f=>f.flatMap(i=>inner[i])),3));innerGeo.computeVertexNormals();g.add(new T.Mesh(innerGeo,new T.MeshStandardMaterial({color:0xe5a1a8,roughness:.9,side:T.DoubleSide})));return g;}const aa=[-.23,0,.13],bb=[.23,0,.13],cc=[.23,0,-.13],dd=[-.23,0,-.13],tip=[-.025,.46,0];const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute([aa,tip,bb,bb,tip,cc,cc,tip,dd,dd,tip,aa,aa,bb,cc,aa,cc,dd].flat(),3));geom.computeVertexNormals();const m=new T.Mesh(geom,material);m.castShadow=true;g.add(m);const inner=new T.BufferGeometry();inner.setAttribute('position',new T.Float32BufferAttribute([-.16,.06,.132,-.024,.36,.033,.16,.06,.132],3));inner.computeVertexNormals();g.add(new T.Mesh(inner,new T.MeshStandardMaterial({color:0xe5a1a8,roughness:.9,side:T.DoubleSide})));return g;}
function coloredFur(id,part){const p=palette[id],geom=new T.SphereGeometry(1,36,28),pos=geom.attributes.position,cols=[],base=new T.Color(p.fur),stripe=new T.Color(p.stripe),cream=new T.Color(0xfff6e9),caramel=new T.Color(p.caramel||p.fur);for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),c=base.clone();if(part==='head'){const whiteFace=(z>.18&&(y<(id==='castella'?.10:.17)||Math.abs(x)<(id==='castella'?.11:.18+(1-y)*.09)))||y<-.53;if(whiteFace)c.copy(cream);else{if(id!=='ohagi'){if(Math.sin(Math.atan2(x,z)*15+y*5)>.52&&y>.05)c.lerp(stripe,.7);if(y>.32&&Math.abs(x)<.11)c.lerp(stripe,.8);}if(id==='castella'&&z>-.2&&Math.sin(x*8+y*6+z*4)>.15)c.lerp(caramel,.64);}}else{if(y<-.17||z>.68)c.copy(cream);else{if(id!=='ohagi'&&Math.cos(z*17+x*3)>.5)c.lerp(stripe,.63);if(id==='castella'&&Math.sin(z*8+x*6+y*4)>.2)c.lerp(caramel,.65);}if(id==='daifuku')c.lerp(cream,.27);}cols.push(c.r,c.g,c.b);}geom.setAttribute('color',new T.Float32BufferAttribute(cols,3));return new T.Mesh(geom,new T.MeshStandardMaterial({vertexColors:true,roughness:.93}));}
export function createCat(id='monaka'){
 id=findCat(id).id;const p=palette[id],root=new T.Group();root.name=id;root.userData.catId=id;
 const fur=mat(p.fur),stripe=mat(p.stripe),scarf=mat(p.scarf),iris=mat(p.eye,{roughness:.25,metalness:.05});
 const body=coloredFur(id,'body');body.position.set(0,.68,-.08);body.scale.set(id==='daifuku'?.48:.41,.49,.66);body.castShadow=true;body.receiveShadow=true;root.add(body);
 ell(root,white,0,.68,.38,.35,.39,.19);
 const legs=[];for(const x of [-.28,.28])for(const z of [-.44,.35]){const leg=new T.Group();leg.position.set(x,.48,z);root.add(leg);ell(leg,z<0?fur:white,0,-.14,0,.15,.27,.16);ell(leg,white,0,-.35,.065,.17,.13,.22);legs.push(leg);}
 const head=new T.Group();head.position.set(0,1.05,.40);root.add(head);const skull=coloredFur(id,'head');skull.scale.set(.55,.48,.45);skull.castShadow=true;head.add(skull);
 const ears=[ear(head,-.35,.30,-.075,fur),ear(head,.35,.30,-.075,fur,id==='castella')];
 ell(head,white,-.18,-.20,.33,.28,.20,.18);ell(head,white,.18,-.20,.33,.28,.20,.18);
 // The eyes are physical glossy meshes, so they remain rounded in side views.
 for(const x of [-.235,.235]){const e=ell(head,iris,x,.055,.401,.135,.166,.08);e.rotation.z=x<0?-.11:.11;ell(head,black,x,.055,.469,.055,.125,.022);ell(head,shine,x-.035,.115,.489,.035,.037,.012);ell(head,shine,x+.034,.002,.489,.015,.016,.009);}
 let jaw=null,fang=null;
 const nose=ell(head,id==='ohagi'?black:pink,0,-.16,.522,.072,.046,.04);nose.rotation.z=Math.PI;
 tube(head,[[0,-.20,.53],[0,-.25,.53],[-.075,-.27,.51]],.009,black);tube(head,[[0,-.25,.53],[.075,-.27,.51]],.009,black);
 if(id==='castella'){jaw=ell(head,white,0,-.285,.40,.19,.08,.12);jaw.name='gentle-nibble-jaw';fang=new T.Mesh(new T.ConeGeometry(.022,.05,5),white);fang.position.set(.065,-.255,.535);fang.rotation.z=Math.PI;fang.visible=false;head.add(fang);}
 if(id==='ohagi'){ell(head,black,-.065,-.22,.516,.083,.046,.027);const spot=ell(head,black,.105,-.12,.492,.055,.093,.028);spot.rotation.z=.25;}
 for(const side of [-1,1])for(let i=0;i<3;i++){tube(head,[[side*.29,-.17-i*.035,.43],[side*.50,-.15-i*.045,.47],[side*.75,-.12-i*.06,.44]],.006,mat(0xe6e0d5));}
 // A scarf wraps all the way around the neck; its knot is visible in profile.
 const ring=new T.Mesh(new T.TorusGeometry(.32,.055,9,36),scarf);ring.rotation.x=Math.PI/2;ring.position.set(0,.86,.35);root.add(ring);
 ell(root,scarf,.28,.83,.53,.10,.09,.09);const tie=new T.Mesh(new T.ConeGeometry(.12,.34,3),scarf);tie.position.set(.32,.65,.55);tie.rotation.z=.35;root.add(tie);
 const tail=new T.Group();tail.position.set(0,.72,-.57);root.add(tail);const tailRadius=id==='daifuku'?.17:id==='castella'?.105:.095,tailPoints=id==='castella'?[[0,0,0],[.12,.17,-.35],[.26,.50,-.54]]:[[0,0,0],[.12,.17,-.35],[.26,.57,-.63],[.15,.94,-.63],[-.07,1.05,-.51]],tailEnd=tailPoints.at(-1);const tailMesh=tube(tail,tailPoints,tailRadius,fur);ell(tail,fur,...tailEnd,tailRadius,tailRadius,tailRadius);
 if(id!=='ohagi'){const uv=tailMesh.geometry.attributes.uv,col=[];for(let i=0;i<uv.count;i++){const color=new T.Color(Math.sin(uv.getX(i)*Math.PI*(id==='castella'?6:11))>.45?p.stripe:p.fur);col.push(color.r,color.g,color.b);}tailMesh.geometry.setAttribute('color',new T.Float32BufferAttribute(col,3));tailMesh.material=new T.MeshStandardMaterial({vertexColors:true,roughness:.9});}
 if(id==='daifuku'){
  for(const side of [-1,1])for(let i=0;i<5;i++){const tuft=ell(head,i<3?white:fur,side*(.40+i*.015),-.25+i*.083,.02,.18,.10,.19);tuft.rotation.z=side*(.5-i*.20);}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const tuft=ell(root,white,Math.cos(a)*.32,.73+Math.sin(a)*.15,.37,.16,.19,.16);tuft.rotation.z=a;}
  for(let i=0;i<8;i++)ell(root,i%2?white:fur,Math.sin(i*2.4)*.35,.62+Math.cos(i*2.4)*.22,-.38,.22,.24,.25);
 }
 root.userData={...root.userData,legs,head,tail,body,ears,jaw,fang,scarfTie:tie,tailLength:tailMesh.geometry.parameters.path.getLength()};return root;
}
export function animateCat(root,time,moving=false,hidden=false,state={}){
 const pose={lift:0,pitch:0,roll:0,yaw:0};root.visible=!hidden;if(hidden)return pose;
 const {legs,head,tail,body,jaw,fang,ears,scarfTie,catId:id}=root.userData;
 const frequency=id==='monaka'?14:id==='ohagi'?11:id==='castella'?12:8,step=Math.sin(time*frequency);
 for(let i=0;i<legs.length;i++){
  const front=i===1||i===3,phase=id==='monaka'?(front?0:Math.PI):(i===0||i===3?0:Math.PI);
  legs[i].rotation.set(moving?Math.sin(time*frequency+phase)*(id==='ohagi'?.65:id==='monaka'?.95:.7):0,0,0);
 }
 pose.lift=moving?Math.abs(step)*(id==='monaka'?.20:id==='castella'?.10:.025):Math.sin(time*2)*.01;
 head.rotation.set(id==='ohagi'?-.04:0,Math.sin(time*(id==='monaka'?3.8:1.5))*(id==='monaka'?.18:.025),Math.sin(time*(id==='daifuku'?2.5:1.3))*(id==='ohagi'?.01:id==='monaka'?.055:id==='castella'?.035:.12));
 tail.rotation.z=Math.sin(time*(id==='monaka'?6:2.7))*(id==='ohagi'?.035:id==='monaka'?.55:.19);
 tail.rotation.y=Math.sin(time*2)*(id==='ohagi'?.045:id==='monaka'?.45:.20);
 if(id==='ohagi'&&moving){pose.pitch=-.06;legs[1].rotation.z=-.13;legs[3].rotation.z=.13;}
 if(id==='daifuku'){pose.roll=Math.sin(time*(moving?8:1.8))*(moving?.20:.035);head.rotation.z-=pose.roll*.7;}
 if(id==='castella'&&moving){pose.yaw=Math.sin(time*6)*.09;ears[1].rotation.z=-.20+Math.sin(time*8)*.12;}
 else ears[1].rotation.z=-.20;
 if(jaw){jaw.position.y=-.285;jaw.rotation.x=0;}if(fang)fang.visible=false;
 scarfTie.position.set(.32,.65,.55);scarfTie.rotation.z=.35;
 // Quiet idle habits repeat without speech, blocking input or changing collisions.
 if(!(state.remaining>0)&&!moving&&time%8>6){
  const r=findCat(id).preview;state={motion:r.motion,duration:2,remaining:8-time%8};
 }
 const active=state.remaining>0,progress=active?Math.max(0,Math.min(1,1-state.remaining/(state.duration||1))):0,pulse=Math.sin(progress*Math.PI);
 if(active){
  if(state.motion==='celebrate'){
   pose.lift+=pulse*.34+Math.abs(Math.sin(progress*Math.PI*2))*.28;
   pose.yaw+=Math.sin(progress*Math.PI*2)*.4;pose.roll+=Math.sin(progress*Math.PI*4)*.13;
   legs[1].rotation.x=-pulse*1.9;legs[3].rotation.x=-pulse*1.9;
   legs[1].rotation.z=-pulse*.55;legs[3].rotation.z=pulse*.55;
   tail.rotation.z+=Math.sin(time*17)*pulse*.5;
  }else if(state.motion==='bow'){
   const salute=Math.sin(Math.min(1,progress*2)*Math.PI)*pulse;
   legs[3].rotation.x=-1.9*salute;legs[3].rotation.z=.8*salute;
   head.rotation.x+=pulse*.65;pose.pitch+=pulse*.14;pose.yaw+=pulse*.28;
   tail.rotation.y=0;tail.rotation.z=0;
  }else if(state.motion==='surprised'){
   pose.roll+=Math.sin(progress*Math.PI*3)*.42;pose.lift+=pulse*.18;pose.yaw+=pulse*.4;
   legs[1].rotation.x=-pulse*(1+Math.sin(progress*Math.PI*8)*.6);
   legs[3].rotation.x=-pulse*(1-Math.sin(progress*Math.PI*8)*.6);
   legs[1].rotation.z=-pulse*.75;legs[3].rotation.z=pulse*.75;
   head.rotation.x-=pulse*.20;head.rotation.z-=pose.roll*.65;
  }else if(state.motion==='stumble'){
   pose.roll=progress*Math.PI*2;
   pose.lift+=.90*(1-Math.cos(pose.roll));
   pose.pitch-=pulse*.12;head.rotation.z-=pulse*.30;
   for(let i=0;i<legs.length;i++){legs[i].rotation.x=-pulse*1.1;legs[i].rotation.z=(i<2?-1:1)*pulse*.5;}
  }else if(state.motion==='nibble'){
   const chew=Math.max(0,Math.sin(progress*Math.PI*8));
   pose.yaw+=pulse*.75;pose.roll-=pulse*.12;
   pose.lift+=Math.max(0,Math.sin(Math.min(1,progress*3)*Math.PI))*.25;
   head.rotation.x+=pulse*.32;head.rotation.y+=pulse*.42;head.rotation.z-=pulse*.22;
   legs[3].rotation.x=-pulse*1.65;legs[3].rotation.z=pulse*.35;
   scarfTie.position.y+=pulse*.24;scarfTie.position.z+=pulse*.04;scarfTie.rotation.z-=pulse*.65;
   if(jaw){jaw.position.y-=chew*.075;jaw.rotation.x=chew*.32;}if(fang)fang.visible=pulse>.25&&chew>.1;
   tail.rotation.y+=Math.sin(time*10)*pulse*.3;
  }else if(state.motion==='gentle'){
   head.rotation.z+=pulse*.2;head.rotation.x+=pulse*.12;legs[3].rotation.x=-pulse*.8;pose.yaw+=pulse*.3;
  }else if(state.motion==='focus'){
   head.rotation.x=-.13;head.rotation.z=0;pose.pitch=-.14;
  }
 }
 root.position.y=pose.lift;root.rotation.x=pose.pitch;root.rotation.z=pose.roll;
 body.scale.y=.49*(1+Math.sin(time*2)*.012);return pose;
}
export function disposeModel(root){const geometries=new Set(),materials=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});for(const g of geometries)if(g!==sphere)g.dispose();/* Shared fur/eye materials and sphere geometry live for the page lifetime. */}
