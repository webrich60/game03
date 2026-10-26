import {test} from 'node:test';
import assert from 'node:assert/strict';
import {VirtualStick,ActionButton} from './dist/controllers.js';
import {HuntGame} from './dist/engine.js';
import {createCat,animateCat} from './dist/cat-model.js';
const element=()=>({events:{},disabled:false,captured:new Set(),style:{setProperty(){}},classList:{add(){},remove(){}},addEventListener(n,f){this.events[n]=f;},setPointerCapture(id){this.captured.add(id);},hasPointerCapture(id){return this.captured.has(id);},releasePointerCapture(id){this.captured.delete(id);},getBoundingClientRect(){return{left:0,top:0,width:100,height:100};}});
const event=(id,x=80,y=50)=>({pointerId:id,isPrimary:id===1,button:0,clientX:x,clientY:y,detail:1,preventDefault(){},stopPropagation(){}});
test('a non-primary action finger fires immediately while the movement finger stays down',()=>{
 const g=new HuntGame(()=>.23);g.start();g.mice.forEach(m=>m.active=false);g.bonuses=[];
 const move=element(),meow=element(),jump=element(),stick=new VirtualStick(move),voice=new ActionButton(meow,()=>g.meow()),leap=new ActionButton(jump,()=>g.pounce());
 move.events.pointerdown(event(1));assert.equal(stick.x,1);
 meow.events.pointerdown(event(2));assert.equal(g.meowCooldown,6);assert.equal(stick.x,1);
 meow.events.pointerup(event(2));assert.equal(stick.x,1);assert.equal(voice.pointer,null);
 const before=g.player.x;g.update(.04,{x:stick.x,y:stick.y});assert.ok(g.player.x>before);
 jump.events.pointerdown(event(3));assert.equal(g.player.grounded,false);assert.equal(stick.x,1);
 jump.events.pointercancel(event(3));assert.equal(leap.pointer,null);assert.equal(stick.x,1);
 move.events.pointerup(event(1));assert.equal(stick.x,0);
});
test('pointer actions do not double-fire through compatibility clicks; keyboard clicks remain usable',()=>{
 const e=element();let calls=0,enabled=true;const action=new ActionButton(e,()=>calls++,()=>enabled);
 e.events.pointerdown(event(2));assert.equal(calls,1);e.events.click(event(2));assert.equal(calls,1);
 e.events.pointerup(event(2));e.events.click({...event(0),detail:0});assert.equal(calls,2);
 e.disabled=true;e.events.pointerdown(event(3));assert.equal(calls,2);
 e.disabled=false;enabled=false;e.events.click({...event(0),detail:0});assert.equal(calls,2);action.reset();
});
test('two simultaneous action pointers never release a held camera or movement stick',()=>{
 const a=element(),b=element(),c=element(),d=element(),move=new VirtualStick(a),look=new VirtualStick(b),jump=new ActionButton(c,()=>{}),meow=new ActionButton(d,()=>{});
 a.events.pointerdown(event(1));b.events.pointerdown(event(2,50,20));c.events.pointerdown(event(3));d.events.pointerdown(event(4));
 assert.equal(move.x,1);assert.equal(look.y,-1);jump.reset();meow.reset();assert.equal(move.x,1);assert.equal(look.y,-1);
 b.events.pointercancel(event(2));assert.equal(move.x,1);
});
test('four running silhouettes differ in limb motion, bounce and waddle',()=>{
 const sample=id=>{const c=createCat(id),p=animateCat(c,.17,true);return {c,p};};
 const m=sample('monaka'),o=sample('ohagi'),d=sample('daifuku'),c=sample('castella');
 assert.ok(m.p.lift>o.p.lift+.08);assert.equal(m.c.userData.legs[1].rotation.x,m.c.userData.legs[3].rotation.x);
 assert.ok(Math.abs(o.c.userData.legs[1].rotation.x)> .3);assert.ok(Math.abs(o.p.roll)<.01);
 assert.ok(Math.abs(d.p.roll)>.15);assert.ok(Math.abs(c.p.yaw)>.05);
});
test('capture gestures are visible through raised forelegs, a salute, flailing paws and a lifted scarf',()=>{
 const m=createCat('monaka');animateCat(m,0,false,false,{motion:'celebrate',duration:1,remaining:.5});assert.ok(m.userData.legs[1].rotation.x<-1.8);
 const o=createCat('ohagi');animateCat(o,0,false,false,{motion:'bow',duration:1,remaining:.75});assert.ok(o.userData.legs[3].rotation.x<-.9);assert.ok(o.userData.head.rotation.x>.3);
 const d=createCat('daifuku'),p=animateCat(d,0,false,false,{motion:'surprised',duration:1,remaining:.65});assert.ok(Math.abs(p.roll)>.05);assert.ok(d.userData.legs[1].rotation.z<-.5);
 const c=createCat('castella');animateCat(c,0,false,false,{motion:'nibble',duration:1,remaining:.5});assert.ok(c.userData.scarfTie.position.y>.85);assert.ok(c.userData.legs[3].rotation.x<-1.6);
 animateCat(c,0);assert.equal(c.userData.scarfTie.position.y,.65);assert.equal(c.userData.legs[3].rotation.x,0);
});
test('a full Daifuku roll is cosmetic and meow visibly triggers each cat signature',()=>{
 const c=createCat('daifuku'),p=animateCat(c,0,false,false,{motion:'stumble',duration:1,remaining:.5});assert.ok(Math.abs(p.roll-Math.PI)<1e-9);assert.ok(p.lift>1.7);
 const motions=[];for(const id of ['monaka','ohagi','daifuku','castella']){const g=new HuntGame(()=>.23);g.selectCat(id);g.start();g.meow();motions.push(g.flairMotion);}
 assert.deepEqual(motions,['celebrate','bow','surprised','nibble']);
});
