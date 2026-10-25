import * as T from './vendor/three.module.min.js';
import {findCat} from './cats.js';
const palette={monaka:{fur:0x9d8c7c,stripe:0x514b47,eye:0xa9b970,scarf:0x9bd7bd},ohagi:{fur:0x292932,stripe:0x23232a,eye:0x91b594,scarf:0xeaa4ab},daifuku:{fur:0xc5c2c5,stripe:0x777781,eye:0x84b9aa,scarf:0xe7c26f}};
const mat=(color,opts={})=>new T.MeshStandardMaterial({color,roughness:.83,...opts});
const white=mat(0xfff5e7),pink=mat(0xe5a1a8),black=mat(0x282932),shine=mat(0xffffff,{roughness:.15});
const sphere=new T.SphereGeometry(1,24,18);
function ell(parent,material,x,y,z,sx,sy,sz){const m=new T.Mesh(sphere,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function tube(parent,points,r,material){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const m=new T.Mesh(new T.TubeGeometry(curve,28,r,8,false),material);m.castShadow=true;parent.add(m);return m;}
function ear(parent,x,y,z,material){const g=new T.Group();g.position.set(x,y,z);g.rotation.z=x<0?.20:-.20;parent.add(g);const a=[-.23,0,.13],b=[.23,0,.13],c=[.23,0,-.13],d=[-.23,0,-.13],tip=[-.025,.46,0];const geom=new T.BufferGeometry();geom.setAttribute('position',new T.Float32BufferAttribute([a,tip,b,b,tip,c,c,tip,d,d,tip,a,a,b,c,a,c,d].flat(),3));geom.computeVertexNormals();const m=new T.Mesh(geom,material);m.castShadow=true;g.add(m);const inner=new T.BufferGeometry();inner.setAttribute('position',new T.Float32BufferAttribute([-.16,.06,.132,-.024,.36,.033,.16,.06,.132],3));inner.computeVertexNormals();g.add(new T.Mesh(inner,new T.MeshStandardMaterial({color:0xe5a1a8,roughness:.9,side:T.DoubleSide})));}
function coloredFur(id,part){const p=palette[id];const geom=new T.SphereGeometry(1,36,28),pos=geom.attributes.position,cols=[];const base=new T.Color(p.fur),stripe=new T.Color(p.stripe),cream=new T.Color(0xfff6e9);for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);let c=base.clone();if(part==='head'){const whiteFace=(z>.18&&(y<.17||Math.abs(x)<.18+(1-y)*.09))||y<-.53;if(whiteFace)c.copy(cream);else if(id!=='ohagi'){const striped=Math.sin(Math.atan2(x,z)*15+y*5)>.52;if(striped&&y>.05)c.lerp(stripe,.7);if(y>.32&&Math.abs(x)<.11)c.lerp(stripe,.8);}}else{if(y<-.17||z>.68)c.copy(cream);else if(id!=='ohagi'&&Math.cos(z*17+x*3)>.5)c.lerp(stripe,.63);if(id==='daifuku')c.lerp(cream,.27);}cols.push(c.r,c.g,c.b);}geom.setAttribute('color',new T.Float32BufferAttribute(cols,3));return new T.Mesh(geom,new T.MeshStandardMaterial({vertexColors:true,roughness:.93}));}
export function createCat(id='monaka'){
 id=findCat(id).id;const p=palette[id],root=new T.Group();root.name=id;root.userData.catId=id;
 const fur=mat(p.fur),stripe=mat(p.stripe),scarf=mat(p.scarf),iris=mat(p.eye,{roughness:.25,metalness:.05});
 const body=coloredFur(id,'body');body.position.set(0,.68,-.08);body.scale.set(id==='daifuku'?.48:.41,.49,.66);body.castShadow=true;body.receiveShadow=true;root.add(body);
 ell(root,white,0,.68,.38,.35,.39,.19);
 const legs=[];for(const x of [-.28,.28])for(const z of [-.44,.35]){const leg=new T.Group();leg.position.set(x,.48,z);root.add(leg);ell(leg,z<0?fur:white,0,-.14,0,.15,.27,.16);ell(leg,white,0,-.35,.065,.17,.13,.22);legs.push(leg);}
 const head=new T.Group();head.position.set(0,1.05,.40);root.add(head);const skull=coloredFur(id,'head');skull.scale.set(.55,.48,.45);skull.castShadow=true;head.add(skull);
 ear(head,-.35,.30,-.075,fur);ear(head,.35,.30,-.075,fur);
 ell(head,white,-.18,-.20,.33,.28,.20,.18);ell(head,white,.18,-.20,.33,.28,.20,.18);
 // The eyes are physical glossy meshes, so they remain rounded in side views.
 for(const x of [-.235,.235]){const e=ell(head,iris,x,.055,.401,.135,.166,.08);e.rotation.z=x<0?-.11:.11;ell(head,black,x,.055,.469,.055,.125,.022);ell(head,shine,x-.035,.115,.489,.035,.037,.012);ell(head,shine,x+.034,.002,.489,.015,.016,.009);}
 const nose=ell(head,id==='ohagi'?black:pink,0,-.16,.522,.072,.046,.04);nose.rotation.z=Math.PI;
 tube(head,[[0,-.20,.53],[0,-.25,.53],[-.075,-.27,.51]],.009,black);tube(head,[[0,-.25,.53],[.075,-.27,.51]],.009,black);
 if(id==='ohagi'){ell(head,black,-.065,-.22,.516,.083,.046,.027);const spot=ell(head,black,.105,-.12,.492,.055,.093,.028);spot.rotation.z=.25;}
 for(const side of [-1,1])for(let i=0;i<3;i++){tube(head,[[side*.29,-.17-i*.035,.43],[side*.50,-.15-i*.045,.47],[side*.75,-.12-i*.06,.44]],.006,mat(0xe6e0d5));}
 // A scarf wraps all the way around the neck; its knot is visible in profile.
 const ring=new T.Mesh(new T.TorusGeometry(.32,.055,9,36),scarf);ring.rotation.x=Math.PI/2;ring.position.set(0,.86,.35);root.add(ring);
 ell(root,scarf,.28,.83,.53,.10,.09,.09);const tie=new T.Mesh(new T.ConeGeometry(.12,.34,3),scarf);tie.position.set(.32,.65,.55);tie.rotation.z=.35;root.add(tie);
 const tail=new T.Group();tail.position.set(0,.72,-.57);root.add(tail);const tailRadius=id==='daifuku'?.17:.095;const tailMesh=tube(tail,[[0,0,0],[.12,.17,-.35],[.26,.57,-.63],[.15,.94,-.63],[-.07,1.05,-.51]],tailRadius,fur);ell(tail,fur,-.07,1.05,-.51,tailRadius,tailRadius,tailRadius);
 if(id!=='ohagi'){const uv=tailMesh.geometry.attributes.uv,col=[];for(let i=0;i<uv.count;i++){const color=new T.Color(Math.sin(uv.getX(i)*Math.PI*11)>.45?p.stripe:p.fur);col.push(color.r,color.g,color.b);}tailMesh.geometry.setAttribute('color',new T.Float32BufferAttribute(col,3));tailMesh.material=new T.MeshStandardMaterial({vertexColors:true,roughness:.9});}
 if(id==='daifuku'){
  for(const side of [-1,1])for(let i=0;i<5;i++){const tuft=ell(head,i<3?white:fur,side*(.40+i*.015),-.25+i*.083,.02,.18,.10,.19);tuft.rotation.z=side*(.5-i*.20);}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const tuft=ell(root,white,Math.cos(a)*.32,.73+Math.sin(a)*.15,.37,.16,.19,.16);tuft.rotation.z=a;}
  for(let i=0;i<8;i++)ell(root,i%2?white:fur,Math.sin(i*2.4)*.35,.62+Math.cos(i*2.4)*.22,-.38,.22,.24,.25);
 }
 root.userData={...root.userData,legs,head,tail,body};return root;
}
export function animateCat(root,time,moving=false,hidden=false){root.visible=!hidden;if(hidden)return;const {legs,head,tail,body}=root.userData;for(let i=0;i<legs.length;i++)legs[i].rotation.x=moving?Math.sin(time*11+(i===0||i===3?0:Math.PI))*.5:0;root.position.y=moving?Math.abs(Math.sin(time*11))*.045:Math.sin(time*2)*.013;head.rotation.z=moving?Math.sin(time*5)*.035:Math.sin(time*1.3)*.025;tail.rotation.z=Math.sin(time*2.7)*.13;tail.rotation.y=Math.sin(time*2)*.16;body.scale.y=(root.userData.catId==='daifuku'?.49:.49)*(1+Math.sin(time*2)*.012);}
export function disposeModel(root){const geometries=new Set(),materials=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});for(const g of geometries)if(g!==sphere)g.dispose();/* Shared fur/eye materials and sphere geometry live for the page lifetime. */}
