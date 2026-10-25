import {test} from 'node:test';
import assert from 'node:assert/strict';
import {VirtualStick,stickVector,movementVector,cameraDelta} from './dist/controllers.js';
import {MuseumGame} from './dist/engine.js';
import {MuseumWorld} from './dist/world3d.js';

function pad(){
 const listeners=new Map(),captures=new Set(),styles=new Map(),classes=new Set();
 const element={
  addEventListener(name,fn){listeners.set(name,fn);},
  getBoundingClientRect(){return {left:0,top:0,width:100,height:100};},
  setPointerCapture(id){captures.add(id);},hasPointerCapture(id){return captures.has(id);},releasePointerCapture(id){captures.delete(id);},
  style:{setProperty(k,v){styles.set(k,v);}},classList:{add(x){classes.add(x);},remove(x){classes.delete(x);}}
 };
 return {element,styles,send(name,pointerId,x=50,y=50,button=0){listeners.get(name)?.({pointerId,clientX:x,clientY:y,button,preventDefault(){}});}};
}

test('stick has a resting dead zone, proportional speed, and a circular maximum',()=>{
 assert.deepEqual(stickVector(0,0,30),{x:0,y:0});assert.deepEqual(stickVector(2,-2,30),{x:0,y:0});
 const slow=stickVector(15,0,30);assert.ok(slow.x>0&&slow.x<.5);
 const diagonal=stickVector(500,500,30);assert.ok(Math.abs(Math.hypot(diagonal.x,diagonal.y)-1)<1e-12);
});

test('left and right fingers stay independent, including release and cancellation',()=>{
 const a=pad(),b=pad(),left=new VirtualStick(a.element),right=new VirtualStick(b.element);
 a.send('pointerdown',11,80,50);b.send('pointerdown',22,50,20);assert.equal(left.x,1);assert.equal(right.y,-1);
 a.send('pointerup',22);assert.equal(left.x,1);b.send('pointerup',22);assert.equal(right.y,0);assert.equal(left.x,1);
 a.send('pointercancel',11);assert.equal(left.x,0);assert.equal(left.pointer,null);assert.equal(a.styles.get('--stick-x'),'0px');
});

test('mouse drag, out-of-bounds dragging and lost capture never leave a stuck stick',()=>{
 const p=pad(),stick=new VirtualStick(p.element);
 p.send('pointerdown',1,50,50,2);assert.equal(stick.pointer,null);
 p.send('pointerdown',1,50,50);p.send('pointermove',1,-500,50);assert.equal(stick.x,-1);
 p.send('pointerdown',2,80,50);assert.equal(stick.pointer,1);assert.equal(stick.x,-1);
 p.send('lostpointercapture',1);assert.equal(stick.x,0);assert.equal(stick.y,0);assert.equal(stick.pointer,null);
});

test('pausing or resetting a held pointer stops both axes',()=>{
 const p=pad();let enabled=true;const stick=new VirtualStick(p.element,()=>enabled);
 p.send('pointerdown',1,80,50);enabled=false;p.send('pointermove',1,80,20);assert.equal(stick.x,0);assert.equal(stick.pointer,null);
 p.send('pointerdown',2,80,50);assert.equal(stick.pointer,null);enabled=true;p.send('pointerdown',3,80,50);stick.reset();assert.equal(stick.x,0);
});

test('camera-relative movement and analog speed work without diagonal speed boosts',()=>{
 const v=movementVector(0,0,{x:0,y:-1},Math.PI/2);assert.ok(Math.abs(v.x+1)<1e-12);assert.ok(Math.abs(v.y)<1e-12);
 assert.ok(Math.hypot(...Object.values(movementVector(1,1,{x:1,y:1})))<=1.000001);
 const g=new MuseumGame();g.start();g.guards=[];g.player.x=110;g.player.y=160;
 for(let i=0;i<10;i++)g.update(.05,{x:.25,y:0});assert.ok(Math.abs(g.player.x-132.5)<.001);
});

test('right-stick rotation is frame-rate independent and stops when released',()=>{
 let a=0,b=0;for(let i=0;i<30;i++)a+=cameraDelta({x:1,y:0},1/30).yaw;for(let i=0;i<60;i++)b+=cameraDelta({x:1,y:0},1/60).yaw;
 assert.ok(Math.abs(a-b)<1e-12);assert.deepEqual(cameraDelta({x:0,y:0},.05),{yaw:0,pitch:0});
});

test('right-stick vertical movement cannot flip the camera or move it under the floor',()=>{
 const camera={inspect:false,yaw:0,pitch:.77};
 MuseumWorld.prototype.rotate.call(camera,1,100);assert.equal(camera.yaw,1);assert.equal(camera.pitch,1.15);
 MuseumWorld.prototype.rotate.call(camera,0,-100);assert.equal(camera.pitch,.36);
});
