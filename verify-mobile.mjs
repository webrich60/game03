import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.min.js';
import {viewportBox,controlLayout,parkOverviewPose,mapPoint,drawMinimap} from './dist/presentation.js';
import {GameAudio,synthesizeMeow} from './dist/audio.js';

test('visible viewport dimensions include address-bar height changes and zoom offsets',()=>{
 assert.deepEqual(viewportBox({width:360,height:610,offsetLeft:0,offsetTop:0}),{width:360,height:610,left:0,top:0});
 assert.deepEqual(viewportBox({width:180,height:330,offsetLeft:40,offsetTop:120}),{width:180,height:330,left:40,top:120});
 assert.deepEqual(viewportBox(undefined,320,568),{width:320,height:568,left:0,top:0});
});
test('portrait, short landscape and zoomed control docks fit with usable action targets',()=>{
 for(const [width,height] of [[320,568],[360,640],[390,700],[412,800],[768,1024],[740,360],[320,480],[180,340],[220,400]]){
  const c=controlLayout(width,height);assert.ok(c.action>=44);assert.ok(c.look>=44);assert.ok(c.move>=52);
  assert.ok(c.leftWidth+c.move+36<=width,'controls exceed '+width);
  const leftHeight=c.mode==='horizontal'?Math.max(c.look,c.action):c.mode==='stacked'?c.look+6+c.action*2+6:c.look+8+c.action;
  assert.ok(c.dockHeight>=leftHeight+12);
 }
});
test('overview projects all playable corners inside portrait and rotated landscape views',()=>{
 for(const aspect of [.35,.55,.8,1,1.7,2.7])for(const yaw of [0,.4,Math.PI/2,2.5,Math.PI]){
  const pose=parkOverviewPose(aspect,yaw),camera=new T.PerspectiveCamera(48,aspect,.1,150);
  camera.position.set(pose.position.x,pose.position.y,pose.position.z);camera.lookAt(pose.target.x,pose.target.y,pose.target.z);camera.updateMatrixWorld(true);
  for(const x of [-12,12])for(const z of [-12,12])for(const y of [0,2]){
   const p=new T.Vector3(x,y,z).project(camera);assert.ok(Math.abs(p.x)<.87&&Math.abs(p.y)<.87,JSON.stringify({aspect,yaw,x,y,z,p}));
  }
 }
});
test('minimap covers the full arena and excludes caught mice and collected bonuses',()=>{
 assert.deepEqual(mapPoint(-12,-12),{x:9,y:9});assert.deepEqual(mapPoint(12,12),{x:167,y:167});
 assert.deepEqual(mapPoint(0,0),{x:88,y:88});
 const arcs=[],rects=[],rotations=[],ctx={clearRect(){},fillRect(...r){rects.push(r);},strokeRect(){},beginPath(){},arc(...r){arcs.push(r);},fill(){},save(){},restore(){},translate(){},rotate(r){rotations.push(r);},moveTo(){},lineTo(){},closePath(){},stroke(){}};
 drawMinimap(ctx,{arenaObstacles:[{x:-5,z:-3,w:2,d:1}],mice:[{x:-12,z:-12,active:true,gold:false},{x:12,z:12,active:true,gold:true},{x:0,z:0,active:false}],bonuses:[{x:3,z:4,active:true},{x:4,z:4,active:false}],player:{x:1,z:2,angle:Math.PI}});
 assert.equal(arcs.length,2);assert.equal(rects.length,4);assert.equal(rotations[0],-Math.PI);
});

function fakeContext(){
 const starts=[],stops=[],buffers=[],gains=[],nodes=[];
 let resolveResume;
 const context={state:'suspended',currentTime:42,destination:{},resumeCalls:0,resume(){this.resumeCalls++;return new Promise(resolve=>{resolveResume=()=>{this.state='running';resolve();};});},
 createBuffer(channels,length,rate){const data=new Float32Array(length),b={numberOfChannels:channels,length,sampleRate:rate,getChannelData(){return data;}};buffers.push(b);return b;},
 createGain(){const g={gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};gains.push(g);return g;},
 createBufferSource(){const s={connect(){},disconnect(){s.disconnected=true;},start(time){starts.push(time);},stop(){stops.push(s);}};nodes.push(s);return s;},
 createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){},start(time){starts.push(time);},stop(){}};}
 };
 return {context,starts,stops,buffers,gains,nodes,resume:()=>resolveResume()};
}
test('nyaaan waveform is finite, audible, unclipped and has soft endpoints',()=>{
 const samples=synthesizeMeow();assert.equal(samples.length,18081);
 let peak=0,squared=0,changes=0;for(let i=0;i<samples.length;i++){assert.ok(Number.isFinite(samples[i]));peak=Math.max(peak,Math.abs(samples[i]));squared+=samples[i]**2;if(i&&samples[i]*samples[i-1]<0)changes++;}
 assert.ok(peak>.8&&peak<.83);assert.ok(Math.sqrt(squared/samples.length)>.1);assert.ok(changes>500);
 assert.ok(Math.abs(samples[0])<.001);assert.ok(Math.abs(samples.at(-1))<.002);
});
test('touch-triggered audio resumes first, then starts a voiced meow at the current time',async()=>{
 const f=fakeContext();let created=0;const a=new GameAudio({createContext:()=>{created++;return f.context;}});
 const playing=a.play('meow');assert.equal(created,1);assert.equal(f.context.resumeCalls,1);assert.equal(f.starts.length,0);
 f.resume();assert.equal(await playing,true);assert.deepEqual(f.starts,[42]);assert.equal(f.buffers[0].sampleRate,22050);assert.ok(f.gains[0].gain.value>.1);
 await a.play('meow');assert.equal(f.buffers.length,1);assert.equal(f.starts.length,2);
 f.nodes[0].onended();assert.equal(f.nodes[0].disconnected,true);
});
test('mute prevents creation, stops a playing voice and cancels an in-flight resume',async()=>{
 const f=fakeContext(),a=new GameAudio({createContext:()=>f.context});
 a.setMuted(true);assert.equal(await a.play('meow'),false);assert.equal(a.context,null);
 a.setMuted(false);const pending=a.play('meow');a.setMuted(true);f.resume();assert.equal(await pending,false);assert.equal(f.starts.length,0);
 a.setMuted(false);assert.equal(await a.play('meow'),true);a.setMuted(true);assert.equal(f.stops.length,1);assert.equal(a.active.size,0);
});
