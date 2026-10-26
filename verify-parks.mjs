import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.min.js';
import {PARK_THEMES,createParkScene,updateParkScene,disposeParkScene} from './dist/park-scenes.js';
import {HuntWorld} from './dist/world.js';
import {HuntGame,ARENA} from './dist/engine.js';
function view(){
 const w=Object.create(HuntWorld.prototype);
 Object.assign(w,{scene:new T.Scene(),ambient:new T.HemisphereLight(),sun:new T.DirectionalLight(),arena:new T.Group(),actors:new T.Group(),preview:new T.Group(),camera:new T.PerspectiveCamera(48,1.5,.1,150),target:new T.Vector3(),yaw:.25,pitch:.88,zoom:1,overview:false,inspect:false,snap:true,cats:new Map(),mouseModels:new Map(),bonusModels:new Map(),effects:[],wave:new T.Group(),waveLife:0,marker:new T.Group(),aura:new T.Group(),renderer:{render(){}}});
 w.scene.background=new T.Color();w.scene.fog=new T.Fog(0,45,95);w.wave.material={opacity:0};return w;
}
test('five parks have different actual scenery and keep the playable collision footprint',()=>{
 const signatures=[];
 for(let level=1;level<=5;level++){
  const r=createParkScene(level);assert.deepEqual(r.userData.obstacleBounds,ARENA.obstacles);
  let meshes=0,instances=0;const colors=new Set();r.traverse(o=>{if(o.isMesh){meshes++;instances+=o.isInstancedMesh?o.count:1;colors.add(o.material.color.getHex());assert.ok(Number.isFinite(o.position.x+o.position.y+o.position.z));}});
  assert.ok(meshes<90,'static scenery should batch into fewer than 90 draw calls: '+meshes);assert.ok(instances>250);
  signatures.push([r.name,...colors].join(':'));disposeParkScene(r);
 }
 assert.equal(new Set(signatures).size,5);
 assert.equal(new Set(PARK_THEMES.map(p=>p.landmark)).size,5);
});
test('real stage-clear progression switches the park, lighting and old resources automatically',()=>{
 const w=view(),g=new HuntGame(()=>.23);g.start();let previous,disposed=false;
 for(let level=1;level<=5;level++){
  g.mice=[];g.bonuses=[];w.draw(g,level,.04);
  assert.equal(w.parkLevel,level);assert.equal(w.arena.userData.themeId,PARK_THEMES[level-1].id);
  assert.equal(w.scene.background.getHex(),PARK_THEMES[level-1].sky);
  assert.equal(w.sun.color.getHex(),PARK_THEMES[level-1].sun);
  if(previous){assert.notEqual(w.arena,previous);assert.equal(disposed,true);assert.equal(previous.children.length,0);}
  previous=w.arena;disposed=false;previous.userData.materials[0].addEventListener('dispose',()=>disposed=true);
  for(let n=0;n<g.stage.target;n++)g.catchMouse({active:true,gold:false});
  if(level<5){assert.equal(g.mode,'stageclear');assert.equal(g.nextStage(),true);}
 }
 assert.equal(g.mode,'won');assert.equal(g.totalCaught,80);disposeParkScene(w.arena);
});
test('park comparison pauses play and restores the original park and camera without changing progress',()=>{
 const w=view(),g=new HuntGame(()=>.23);g.start();g.mice=[];g.bonuses=[];g.score=123;g.caught=2;
 w.draw(g,0,.04);const before={score:g.score,caught:g.caught,time:g.remaining,player:{...g.player},yaw:w.yaw,pitch:w.pitch,zoom:w.zoom};
 g.mode='tour';w.setTour(2);w.draw(g,1,.04);w.yaw=1.2;w.setTour(5);w.draw(g,2,.04);g.update(.04,{x:1,y:0});
 assert.equal(w.parkLevel,5);assert.equal(g.score,123);assert.equal(g.remaining,before.time);assert.equal(g.caught,2);assert.deepEqual(g.player,before.player);assert.equal(w.actors.visible,false);
 w.setTour(0);g.mode='playing';w.draw(g,3,.04);assert.equal(w.parkLevel,1);assert.equal(w.yaw,before.yaw);assert.equal(w.pitch,before.pitch);assert.equal(w.zoom,before.zoom);assert.equal(w.actors.visible,true);disposeParkScene(w.arena);
});
test('the windmill really rotates and the night scene contains luminous lanterns',()=>{
 const c=createParkScene(3),rotor=c.userData.animated.find(a=>a.kind==='windmill').object;updateParkScene(c,2);assert.equal(rotor.rotation.z,.9);updateParkScene(c,4);assert.equal(rotor.rotation.z,1.8);
 const n=createParkScene(5);assert.ok(n.userData.materials.some(m=>m.emissiveIntensity>0&&m.emissive.getHex()>0));assert.ok(PARK_THEMES[4].ambientPower>2);disposeParkScene(c);disposeParkScene(n);
});
test('repeated park swaps release owned materials and instancing buffers while shared geometry remains reusable',()=>{
 for(let i=0;i<10;i++){
  const r=createParkScene(i%5+1),materials=r.userData.materials;let released=0;materials.forEach(m=>m.addEventListener('dispose',()=>released++));disposeParkScene(r);
  assert.equal(released,materials.length);assert.equal(r.children.length,0);
 }
 const r=createParkScene(1);let meshes=0;r.traverse(o=>{if(o.isMesh){meshes++;assert.ok(o.geometry.attributes.position.count>0);}});assert.ok(meshes>0);disposeParkScene(r);
});
