import * as T from './vendor/three.module.min.js';
import {ARENA} from './engine.js';

// Scenery stays outside the playable boundary; raised objects use the existing
// collision footprints. Ground paths are paint-thin and never block a mouse.
export const PARK_THEMES=[
 {id:'meadow',name:'のんびり ねずみ広場',ground:0xa9d182,path:0xf0ddb3,sky:0xd7eee1,soil:0xb3a07e,leaf:0x7daf67,accent:0xcadf9d,sun:0xffedca,ambient:0xfff2d6,ambientGround:0x8da57b,sunPower:2.3,ambientPower:1.9,landmark:'pond',obstacle:'wooden-crates'},
 {id:'blossom',name:'ちょこまか お花畑',ground:0xc7dbad,path:0xf6dce0,sky:0xf3e3ed,soil:0xc4a296,leaf:0xefacbd,accent:0xf7d382,sun:0xfff0e8,ambient:0xfff1f2,ambientGround:0xb5a3a5,sunPower:2.1,ambientPower:1.95,landmark:'flower-arches',obstacle:'flower-beds'},
 {id:'cheese',name:'すばしっこい チーズ公園',ground:0xe6d59a,path:0xf9ecbf,sky:0xe5eff2,soil:0xc7a06d,leaf:0x9bbf85,accent:0xf2b93e,sun:0xfff0c2,ambient:0xfff4dc,ambientGround:0xa5a18b,sunPower:2.5,ambientPower:1.8,landmark:'cheese-windmill',obstacle:'cheese-blocks'},
 {id:'sunset',name:'びゅんびゅん 夕焼け広場',ground:0xce9a68,path:0xe9c293,sky:0xeeb09d,soil:0x9b7967,leaf:0xcb6f45,accent:0xf6bf6c,sun:0xffa66b,ambient:0xffdfb9,ambientGround:0x987579,sunPower:2.2,ambientPower:1.8,landmark:'autumn-camp',obstacle:'log-piles'},
 {id:'festival',name:'ねずみの大運動会！',ground:0x617c99,path:0x99a4c3,sky:0x263c5d,soil:0x596983,leaf:0x567b88,accent:0xffcf73,sun:0xb8d8ff,ambient:0xd4e8ff,ambientGround:0x68738c,sunPower:1.65,ambientPower:2.15,landmark:'moonlit-stadium',obstacle:'award-podiums'}
];
const geo={
 box:new T.BoxGeometry(1,1,1),ball:new T.SphereGeometry(1,12,8),
 cylinder:new T.CylinderGeometry(1,1,1,16),cone:new T.ConeGeometry(1,1,12),
 ring:new T.TorusGeometry(1,.045,5,40),disc:new T.CylinderGeometry(1,1,1,40),
 flag:new T.ConeGeometry(1,1,3)
};
const sharedGeometry=new Set(Object.values(geo));

function batchStatic(root){
 root.updateMatrixWorld(true);const sets=new Map();
 root.traverse(o=>{
  if(!o.isMesh||o.material.transparent)return;
  for(let p=o;p&&p!==root;p=p.parent)if(p.userData.dynamic)return;
  const k=o.geometry.uuid+o.material.uuid;if(!sets.has(k))sets.set(k,[]);sets.get(k).push(o);
 });
 for(const list of sets.values()){
  if(list.length<3)continue;
  const inst=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);
  list.forEach((o,i)=>inst.setMatrixAt(i,o.matrixWorld));inst.castShadow=true;inst.receiveShadow=true;
  list.forEach(o=>o.parent.remove(o));root.add(inst);
 }
}

export function createParkScene(level=1){
 const index=Math.max(0,Math.min(4,level-1)),theme=PARK_THEMES[index],root=new T.Group(),materials=new Map(),animated=[];
 root.name='park-'+theme.id;root.userData={level:index+1,themeId:theme.id,landmark:theme.landmark,obstacleStyle:theme.obstacle,obstacleBounds:ARENA.obstacles.map(q=>({...q})),animated};
 function material(c,emissive=false){
  const key=c+':'+emissive;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color:c,roughness:.88,emissive:emissive?c:0,emissiveIntensity:emissive?.5:0}));return materials.get(key);
 }
 function shape(parent,g,c,x,y,z,sx,sy,sz,glow=false){
  const o=new T.Mesh(g,material(c,glow));o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=y>.04;o.receiveShadow=true;parent.add(o);return o;
 }
 const box=(c,x,y,z,w,h,d,p=root)=>shape(p,geo.box,c,x,y,z,w,h,d);
 const ball=(c,x,y,z,a,b,d,p=root,glow=false)=>shape(p,geo.ball,c,x,y,z,a,b,d,glow);
 const cyl=(c,x,y,z,r,h,p=root)=>shape(p,geo.cylinder,c,x,y,z,r,h,r);
 const disc=(c,x,z,r,y=.027,p=root)=>shape(p,geo.disc,c,x,y,z,r,.012,r);
 function flower(x,z,c,size=1,parent=root){
  const h=.28*size;cyl(0x77975d,x,h/2,z,.026*size,h,parent);
  for(let j=0;j<5;j++)ball(c,x+Math.sin(j*1.257)*.12*size,h,z+Math.cos(j*1.257)*.12*size,.11*size,.055*size,.11*size,parent);
  ball(0xf6d579,x,h+.015,z,.075*size,.065*size,.075*size,parent);
 }
 function tree(x,z,kind='round',size=1){
  cyl(theme.id==='blossom'?0xb28d88:0x997450,x,.95*size,z,.18*size,1.9*size);
  if(kind==='pine'){
   for(let k=0;k<3;k++)shape(root,geo.cone,theme.leaf,x,(1.6+k*.57)*size,z,(1.25-k*.18)*size,1.65*size,(1.25-k*.18)*size);
  }else{
   for(let k=0;k<5;k++)ball(k%2?theme.leaf:theme.accent,x+Math.sin(k*2.4)*.6*size,(2.15+(k%2)*.5)*size,z+Math.cos(k*2.4)*.55*size,.95*size,.9*size,.95*size);
  }
 }
 function bench(x,z,rotation=0){
  const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;root.add(g);
  for(const a of [-.7,.7]){box(0x7f836d,a,.28,0,.11,.56,.55,g);box(0x7f836d,a,.8,-.28,.10,1.1,.09,g);}
  box(0xc4986a,0,.58,0,1.9,.12,.65,g);box(0xc4986a,0,.96,-.30,1.9,.47,.10,g);
 }
 function fence(x,z,rotation=0,night=false){
  const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;root.add(g);
  for(const a of [-.8,.8]){box(night?0x798ca7:0xe6d1a8,a,.58,0,.12,1.16,.12,g);if(night)ball(0xffd898,a,1.2,0,.11,.11,.11,g,true);}
  for(const h of [.38,.85])box(night?0x798ca7:0xe6d1a8,0,h,0,1.75,.09,.09,g);
 }
 function pond(x,z,autumn=false){
  const g=new T.Group();g.position.set(x,0,z);root.add(g);
  const rim=shape(g,geo.disc,0xb9bba5,0,.02,0,3.2,.13,2.0);
  shape(g,geo.disc,autumn?0x849eac:0x86c8c1,0,.10,0,2.95,.09,1.75);
  for(let k=0;k<12;k++){const a=k/12*Math.PI*2;ball(0xb9b8a0,Math.sin(a)*3.0,.20,Math.cos(a)*1.8,.32,.20,.25,g);}
  for(const [a,b] of [[-1,.4],[1,-.4]]){disc(0x91b386,a,b,.36,.17,g);flower(a,b,0xf1bfd2,.6,g);}
  box(0x957559,0,.34,0,1.1,.15,3.9,g);for(const a of [-.52,.52])box(0xb19373,a,.72,0,.06,.06,3.9,g);
  for(let k=0;k<5;k++)box(0xd0b18a,0,.43,-1.5+k*.75,1.12,.04,.06,g);
  return rim;
 }
 function arch(x,z,color,flowered=false){
  const g=new T.Group();g.position.set(x,0,z);root.add(g);
  for(const a of [-1.55,1.55])cyl(0xe7d3b1,a,1.65,0,.13,3.3,g);
  const top=shape(g,geo.ring,color,0,3.1,0,1.55,.8,1);top.rotation.y=0;
  if(flowered){for(let k=0;k<9;k++){const a=k/8*Math.PI;ball(k%2?0xffe4b6:0xee9eb6,Math.cos(a)*1.55,3.1+Math.sin(a)*.8,0,.28,.25,.23,g);}}
  else{
   box(color,0,3.05,0,3.3,.40,.22,g);
   for(let k=0;k<7;k++){const f=shape(g,geo.flag,[0xe8b6b0,0xf5d179,0xa4c8bd][k%3],-1.3+k*.43,2.77,0,.18,.28,.035);f.rotation.z=Math.PI;}
  }
 }
 function lamp(x,z){
  cyl(0x697a91,x,1.3,z,.065,2.6);
  ball(0xffda93,x,2.65,z,.24,.29,.24,root,true);
  disc(0x9b9c94,x,z,.8,.023);
 }
 // A low floating island makes the playable boundary legible in every theme.
 box(theme.sky,0,-.8,0,180,.1,180);
 box(theme.soil,0,-.39,0,24.8,.72,24.8);
 box(theme.ground,0,-.045,0,24,.11,24);
 if(index===0){
  box(theme.path,0,.022,0,2.1,.012,23.5);box(theme.path,0,.023,2,23.5,.012,1.9);
  for(let k=0;k<28;k++){const x=-10.5+(k%7)*3.4,z=-10+Math.floor(k/7)*6.5;disc(0xb4d58e,x,z,.5);}
  pond(-15,-6);bench(-13.1,4,Math.PI/2);bench(13.1,-2,-Math.PI/2);
  arch(0,-12.8,0x92ba85);
 }else if(index===1){
  disc(theme.path,0,0,8.1);disc(theme.ground,0,0,6.1,.036);
  box(theme.path,0,.038,0,1.8,.01,23.5);
  for(let k=0;k<60;k++){const a=k*2.399,r=3+(k%9)*.85;disc(k%2?0xf1d4d5:0xf8e8ca,Math.sin(a)*r,Math.cos(a)*r,.095,.043);}
  arch(0,-12.8,0xe7adc0,true);arch(12.8,0,0xe7adc0,true);arch(-12.8,0,0xe7adc0,true);
  for(const x of [-14,14])for(const z of [-8,6]){cyl(0xffe9d1,x,.32,z,.5,.65);flower(x,z,0xf4afc6,3.6);}
  bench(-13.2,9,Math.PI/2);bench(13.2,-9,-Math.PI/2);
 }else if(index===2){
  for(let x=-10;x<=10;x+=2)for(let z=-10;z<=10;z+=2)if((x+z)%4===0)box(theme.path,x,.022,z,1.94,.012,1.94);
  disc(0xf5bd54,0,0,3.3,.033);disc(0xf9d87d,0,0,2.95,.043);
  for(let k=0;k<7;k++)disc(0xd9a746,Math.sin(k*2.4)*2.1,Math.cos(k*2.4)*2.1,.32,.055);
  const mill=new T.Group();mill.position.set(0,0,-14);root.add(mill);
  cyl(0xf2c259,0,1.9,0,1.25,3.8,mill);shape(mill,geo.cone,0xd1964e,0,4.25,0,1.6,1.4,1.6);
  for(const a of [-.7,.7])ball(0xbe8e40,a,2.1,1.15,.25,.27,.04,mill);
  const rotor=new T.Group();rotor.position.set(0,3.4,1.35);rotor.userData.dynamic=true;mill.add(rotor);
  for(let k=0;k<4;k++){const arm=new T.Group();arm.rotation.z=k*Math.PI/2;rotor.add(arm);box(0xffeac0,0,1.05,0,.42,2.1,.1,arm);box(0xba9356,0,1.05,.08,.06,2.25,.05,arm);}
  ball(0xc88e49,0,0,.15,.25,.25,.16,rotor);animated.push({kind:'windmill',object:rotor});
  for(const x of [-14,14])for(const z of [-6,7]){const cheese=box(0xf6ca5e,x,.8,z,1.9,1.6,1.8);cheese.rotation.y=.3;for(let k=0;k<3;k++)ball(0xc89a42,x-.6+k*.55,.7+(k%2)*.45,z+.92,.17,.17,.025);}
  bench(-13,1,Math.PI/2);bench(13,1,-Math.PI/2);
 }else if(index===3){
  for(let k=0;k<34;k++){const z=-11+k*.67,x=Math.sin(k*.28)*3.5;const stone=disc(theme.path,x,z,.8);stone.scale.z=.6;}
  for(let k=0;k<80;k++){const a=k*2.399,r=3.5+(k%11)*.7;const leaf=box([0xd77e45,0xf0bd6b,0xbc7150][k%3],Math.sin(a)*r,.025,Math.cos(a)*r,.18,.012,.31);leaf.rotation.y=a;}
  pond(15,-4,true);bench(-13.3,1,Math.PI/2);
  const camp=new T.Group();camp.position.set(-3,0,-14);root.add(camp);
  const tent=shape(camp,geo.flag,0xd4ad78,0,1.4,0,3,2.8,2.2);tent.rotation.y=Math.PI/2;
  shape(camp,geo.flag,0x745e63,.04,1.3,1.15,1.5,2.35,.025).rotation.z=Math.PI;
  for(const x of [-5,3,11])lamp(x,-13);
  const sun=ball(0xffd18a,-13,5.2,-17,2.2,2.2,.5,root,true);sun.castShadow=false;
 }else{
  // Painted lanes and centre markings: no wall crosses the running area.
  for(let k=0;k<3;k++){
   const r=10-k*.65;
   for(const z of [-r,r])box(k%2?0xd6badb:0xa6b8d5,0,.023+k*.001,z,r*2,.012,.12);
   for(const x of [-r,r])box(k%2?0xd6badb:0xa6b8d5,x,.023+k*.001,0,.12,.012,r*2);
  }
  const centre=shape(root,geo.ring,0xe4cda0,0,.04,0,3,3,.5);centre.rotation.x=-Math.PI/2;
  for(let k=0;k<5;k++)box(0xe5d7b5,-1.6+k*.8,.025,6.2,.4,.012,1.2);
  arch(0,-12.8,0x9ca6d2);
  for(const x of [-13,13])for(const z of [-9,0,9])lamp(x,z);
  const moon=ball(0xf9edd1,-8,5.2,-17,1.65,1.65,.4,root,true);moon.castShadow=false;
  for(let k=0;k<36;k++){const a=k*2.399;ball(0xffecc5,Math.sin(a)*23,5+(k%7)*1.5,-17-(k%3)*3,.055,.055,.055,root,true);}
  for(const x of [-14,14]){box(0x8e9ab9,x,.3,0,2.2,.6,8);box(0xa4aed0,x,.8,-.7,2.2,.4,6);box(0xc1b8d5,x,1.2,-1.4,2.2,.4,4);}
 }
 // Themes replace the same collision boxes with visibly different objects.
 for(const q of ARENA.obstacles){
  const x=q.x+q.w/2,z=q.z+q.d/2;
  if(index===0){
   box(0xb68f60,x,q.h/2,z,q.w,q.h,q.d);box(0xe5c18c,x,q.h+.025,z,q.w,.05,q.d);
   for(let k=0;k<3;k++)box(0x98764f,q.x+.25+k*(q.w-.5)/2,q.h/2,q.z+q.d+.006,.05,q.h*.8,.018);
  }else if(index===1){
   box(0xd8b3a7,x,q.h/2,z,q.w,q.h,q.d);box(0x7e9766,x,q.h+.006,z,q.w-.1,.012,q.d-.1);
   for(let a=0;a<4;a++)for(let b=0;b<2;b++){const fx=q.x+.25+a*(q.w-.5)/3,fz=q.z+.24+b*(q.d-.48);const g=new T.Group();g.position.y=q.h;root.add(g);flower(fx,fz,[0xf5b3cb,0xf8d67f,0xd0b6e5][a%3],1,g);}
  }else if(index===2){
   box(0xf2c458,x,q.h/2,z,q.w,q.h,q.d);
   for(let k=0;k<3;k++){ball(0xc8983d,q.x+.25+k*(q.w-.5)/2,q.h*.48+(k%2)*.13,q.z+q.d+.008,.12,.10,.012);disc(0xd7a748,q.x+.3+k*(q.w-.6)/2,z,.12,q.h+.008);}
  }else if(index===3){
   box(0x886d52,x,q.h*.07,z,q.w,q.h*.14,q.d);
   for(let k=0;k<3;k++){const radius=Math.min(q.w/6,q.h*.46),cx=q.x+q.w/6+k*q.w/3;const log=shape(root,geo.cylinder,0xaf875c,cx,q.h*.54,z,radius,q.d,radius);log.rotation.x=Math.PI/2;const end=shape(root,geo.cylinder,0xdfbd87,cx,q.h*.54,q.z+q.d+.014,radius*.78,.025,radius*.78);end.rotation.x=Math.PI/2;}
  }else{
   const color=[0xbeb5d9,0xe0bc70,0x9eacc9,0xd29cb7,0xa6c7c2][ARENA.obstacles.indexOf(q)];
   box(color,x,q.h/2,z,q.w,q.h,q.d);box(0xffe3a1,x,q.h+.018,z,q.w,.035,q.d);
   for(let k=0;k<3;k++)box(0xf4e8c9,q.x+.25+k*(q.w-.5)/2,q.h*.5,q.z+q.d+.01,.12,q.h*.4,.02);
  }
 }
 for(let k=0;k<14;k++){
  const z=-11+k*1.7;fence(-12.45,z,Math.PI/2,index===4);fence(12.45,z,Math.PI/2,index===4);
  if(Math.abs(z)>2){fence(z,-12.45,0,index===4);fence(z,12.45,0,index===4);}
 }
 for(const x of [-14,14])for(const z of [-11,11])tree(x,z,index===4?'pine':'round',index===1?1.2:1);
 for(let k=0;k<48;k++){
  const a=k/48*Math.PI*2,r=11.4,x=Math.sin(a)*r,z=Math.cos(a)*r;
  if(Math.abs(x)<2&&z>10)continue;
  if(index===1)flower(x,z,[0xf2acc4,0xf6d78f,0xd4b6dc][k%3],1.6);
  else if(index===4){if(k%3===0)ball(0xffd894,x,.12,z,.10,.10,.10,root,true);}
  else if(index===3){ball(k%2?0xd8934c:0xc87149,x,.12,z,.24,.13,.2);}
  else{ball(theme.leaf,x,.18,z,.28,.22,.25);if(k%2===0)flower(x,z,0xf1dba0);}
 }
 root.userData.materials=[...materials.values()];batchStatic(root);return root;
}
export function updateParkScene(root,time){
 for(const a of root.userData.animated||[])if(a.kind==='windmill')a.object.rotation.z=time*.45;
}
export function disposeParkScene(root){
 const geometries=new Set();root.traverse(o=>{if(o.geometry&&!sharedGeometry.has(o.geometry))geometries.add(o.geometry);if(o.isInstancedMesh)o.dispose();});
 geometries.forEach(g=>g.dispose());for(const m of root.userData.materials||[])m.dispose();root.clear();
}
