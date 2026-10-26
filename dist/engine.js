import {cats,findCat} from './cats.js';
export const ARENA={minX:-12,maxX:12,minZ:-12,maxZ:12,obstacles:[{x:-5.8,z:-3.8,w:2.2,d:1.5,h:.55},{x:3.6,z:1.5,w:2.0,d:1.4,h:.55},{x:-2.1,z:-8.4,w:1.5,d:1.5,h:.8},{x:6.2,z:-6.9,w:1.5,d:2.0,h:.6},{x:-8.4,z:4.0,w:1.5,d:2.1,h:.6}]};
export const LEVELS=[
 {name:'のんびり ねずみ広場',target:8,count:12,speed:1.7,seconds:90,color:0xb8d898},
 {name:'ちょこまか お花畑',target:12,count:16,speed:2.2,seconds:100,color:0xc9d996},
 {name:'すばしっこい チーズ公園',target:16,count:20,speed:2.7,seconds:110,color:0xa7d2b6},
 {name:'びゅんびゅん 夕焼け広場',target:20,count:24,speed:3.2,seconds:120,color:0xe0c390},
 {name:'ねずみの大運動会！',target:24,count:28,speed:3.7,seconds:130,color:0xb4b7d5}
];
export const BONUS={
 cheese:{name:'チーズごほうび',icon:'🧀',color:0xf4c454,text:'+30pt！',points:30},
 star:{name:'おたからスター',icon:'★',color:0xffc757,text:'+100pt！',points:100},
 clock:{name:'ボーナスタイム',icon:'⏱',color:0x8ecbd5,text:'残り時間 +10秒！'},
 feather:{name:'スピードアップ',icon:'⚡',color:0xeaa6bc,text:'8秒間、猫がスピードアップ！'},
 snow:{name:'ねずみスロー',icon:'❄',color:0xb9e6f2,text:'5秒間、ねずみがゆっくり！'},
 double:{name:'得点2倍',icon:'×2',color:0xb9a7eb,text:'8秒間、もらえる得点が2倍！'}
};
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function solid(x,z,r=.28,height=0){return x<ARENA.minX+r||x>ARENA.maxX-r||z<ARENA.minZ+r||z>ARENA.maxZ-r||ARENA.obstacles.some(q=>height<q.h-.08&&Math.hypot(x-clamp(x,q.x,q.x+q.w),z-clamp(z,q.z,q.z+q.d))<r);}
function segmentDistance(q,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((q.x-a.x)*dx+(q.z-a.z)*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(q.x-a.x-t*dx,q.z-a.z-t*dz);}
export class HuntGame{
 constructor(random=Math.random){this.random=random;this.selectedCat='monaka';this.reset();this.mode='intro';}
 get stage(){return LEVELS[this.level-1];}
 get character(){return findCat(this.selectedCat);}
 selectCat(id){const next=findCat(id).id;if(next===this.selectedCat)return;this.selectedCat=next;this.flairTimer=0;this.flairMotion='';this.pendingStumble=false;this.quipCooldown=0;this.reactionCounts={};}
 personality(trigger,force=false){const c=this.character,r=c.reactions[trigger]||{};if(r.motion&&!(this.flairMotion==='stumble'&&this.flairTimer>0&&trigger!=='stumble')){this.flairMotion=r.motion;this.flairDuration=r.duration;this.flairTimer=r.duration;}if(this.quipCooldown>0&&!force)return;const lines=r.lines||[c.quote],count=this.reactionCounts[trigger]||0;this.reactionCounts[trigger]=count+1;this.quipCooldown=8;this.emit('personality',c.name+'「'+lines[count%lines.length]+'」');}
 emit(type,text,points=0){this.events.push({type,text,points});}
 reset(){this.level=1;this.score=0;this.time=0;this.totalCaught=0;this.events=[];this.beginLevel();}
 start(){this.reset();this.personality('start',true);}
 beginLevel(){this.mode='playing';this.caught=0;this.remaining=this.stage.seconds;this.stageStartScore=this.score;this.stageStartCaught=this.totalCaught;this.stageBonus=0;this.player={x:0,z:6.2,y:0,vy:0,angle:Math.PI,moving:false,grounded:true};this.pounceTimer=0;this.pounceCooldown=0;this.pounceDirection={x:0,y:-1};this.pounceCounts=Object.fromEntries(cats.map(c=>[c.id,0]));this.pendingStumble=false;this.flairTimer=0;this.flairDuration=1;this.flairMotion='';this.quipCooldown=0;this.reactionCounts={};this.meowCooldown=0;this.combo=0;this.comboTimer=0;this.boost=0;this.slow=0;this.double=0;this.bonuses=[];this.bonusCounter=0;this.bonusTimer=12;this.mice=Array.from({length:this.stage.count},(_,id)=>({id,...this.spawnPoint(3),gold:id%8===7,active:true,respawn:0,angle:this.random()*Math.PI*2,wander:this.random()*3,slow:0}));Object.assign(this.mice[0],{x:-1.1,z:3.9,angle:Math.PI});Object.assign(this.mice[1],{x:1.8,z:4.2,angle:Math.PI});this.spawnBonus('cheese',{x:-3.2,z:6});this.spawnBonus('clock',{x:3,z:6});}
 spawnPoint(away=0){for(let i=0;i<300;i++){const p={x:-10.6+this.random()*21.2,z:-10.6+this.random()*21.2};if(!solid(p.x,p.z,.45)&&distance(p,this.player)>=away)return p;}return {x:0,z:-1};}
 get nearestMouse(){return this.mice.filter(m=>m.active).sort((a,b)=>distance(a,this.player)-distance(b,this.player))[0];}
 nextStage(){if(this.mode!=='stageclear'||this.level>=LEVELS.length)return false;this.level++;this.beginLevel();this.emit('stage','STAGE '+this.level+'！ ねずみの速さがアップ！');return true;}
 retryStage(){if(this.mode!=='gameover')return false;this.score=this.stageStartScore;this.totalCaught=this.stageStartCaught;this.beginLevel();return true;}
 pounce(){if(this.mode!=='playing'||this.pounceCooldown>0||!this.player.grounded)return false;const p=this.player,target=this.nearestMouse,c=this.character,spec=c.pounce;let angle=p.angle;if((spec.aimMoving||!p.moving)&&target&&distance(target,p)<4.2)angle=Math.atan2(target.x-p.x,target.z-p.z);p.angle=angle;p.vy=5.2;p.grounded=false;this.pounceDirection={x:Math.sin(angle),y:Math.cos(angle)};this.pounceTimer=spec.duration;this.pounceCooldown=spec.cooldown;this.pounceCounts[c.id]++;if(c.id==='daifuku'&&this.pounceCounts[c.id]%3===0)this.pendingStumble=true;this.personality('pounce');this.emit('jump','ぴょーん！');return true;}
 meow(){if(this.mode!=='playing'||this.meowCooldown>0)return false;this.meowCooldown=6;const spec=this.character.meow||{radius:5,duration:2.4};let n=0;for(const m of this.mice)if(m.active&&distance(m,this.player)<spec.radius){m.slow=spec.duration;n++;}this.personality('meow');this.emit('meow',n?'にゃあ！ 近くのねずみ '+n+'匹がゆっくり！':'にゃあ！ ねずみの近くで使うと、ゆっくりになるよ。');return true;}
 addPoints(n,label){const amount=n*(this.double>0?2:1);this.score+=amount;this.emit('points',label+' +'+amount+'pt',amount);return amount;}
 catchMouse(m){if(this.mode!=='playing'||!m.active)return false;m.active=false;m.respawn=.95;this.caught++;this.totalCaught++;this.combo=this.comboTimer>0?Math.min(5,this.combo+1):1;this.comboTimer=7;const n=this.addPoints((m.gold?50:10)*this.combo,m.gold?'金のねずみ！':'つかまえた！');this.emit('catch',this.combo>1?'連続キャッチ！ COMBO ×'+this.combo:'1匹つかまえた！',n);this.personality('catch');if(this.caught%3===0)this.spawnBonus();if(this.caught>=this.stage.target){this.stageBonus=Math.ceil(this.remaining)*2;this.score+=this.stageBonus;this.mode=this.level===LEVELS.length?'won':'stageclear';this.emit(this.mode==='won'?'win':'clear','STAGE '+this.level+' CLEAR！ 時間ボーナス +'+this.stageBonus+'pt');}return true;}
 spawnBonus(kind,point){if(this.bonuses.filter(b=>b.active).length>=5)return;const cycle=['star','feather','snow','double','clock','cheese'];kind=kind||cycle[this.bonusCounter++%cycle.length];this.bonuses.push({id:this.bonusCounter+'-'+this.time+'-'+this.bonuses.length,kind,...(point||this.spawnPoint(1.5)),active:true,life:22});}
 collectBonus(b){if(!b.active||this.mode!=='playing')return false;b.active=false;const info=BONUS[b.kind];if(info.points)this.addPoints(info.points,info.name);if(b.kind==='clock')this.remaining=Math.min(180,this.remaining+10);if(b.kind==='feather')this.boost=8;if(b.kind==='snow')this.slow=5;if(b.kind==='double')this.double=8;this.emit('bonus',info.icon+' '+info.text);this.personality('bonus');return true;}
 moveMouse(m,dt){m.slow=Math.max(0,m.slow-dt);const p=this.player,near=distance(m,p)<5.6;let angle=m.angle;m.wander-=dt;if(near){angle=Math.atan2(m.x-p.x,m.z-p.z)+Math.sin(this.time*4.0+m.id)*.18*(this.level-1);}else if(m.wander<=0){angle+= (this.random()-.5)*1.7;m.wander=1.1+this.random()*2;}
 const speed=this.stage.speed*(near?1:.45)*(this.slow>0||m.slow>0?.24:1),travel=speed*dt;
 const offsets=[0,.48,-.48,.95,-.95,1.55,-1.55,2.2,-2.2,Math.PI];let best=null;
 for(const offset of offsets){const a=angle+offset,x=m.x+Math.sin(a)*travel,z=m.z+Math.cos(a)*travel;if(solid(x,z,.22))continue;const wall=Math.min(12-Math.abs(x),12-Math.abs(z)),value=(near?Math.hypot(x-p.x,z-p.z):0)-Math.abs(offset)*.015+Math.min(wall,1)*.015;if(!best||value>best.value)best={x,z,a,value};}
 if(best){m.x=best.x;m.z=best.z;m.angle=best.a;}else m.angle+=Math.PI/2;
 }
 update(dt,input={x:0,y:0}){if(this.mode!=='playing')return;dt=clamp(dt,0,.05);this.remaining=Math.max(0,this.remaining-dt);this.time+=dt;if(this.remaining<=0){this.mode='gameover';this.emit('gameover','タイムアップ！ 同じステージからもう一度！');return;}
 for(const key of ['pounceCooldown','meowCooldown','comboTimer','boost','slow','double','flairTimer','quipCooldown'])this[key]=Math.max(0,this[key]-dt);if(this.comboTimer===0)this.combo=0;
 const p=this.player,before={x:p.x,z:p.z};let x=input.x||0,y=input.y||0;const mag=Math.hypot(x,y);if(mag>1){x/=mag;y/=mag;}let speed=this.character.speed*(this.boost>0?7.1/5.4:1);p.moving=Math.hypot(x,y)>.04;
 if(this.pounceTimer>0){this.pounceTimer=Math.max(0,this.pounceTimer-dt);x=this.pounceDirection.x;y=this.pounceDirection.y;speed=this.character.pounce.speed;p.moving=true;}else if(p.moving)p.angle=Math.atan2(x,y);
 const nx=p.x+x*speed*dt,nz=p.z+y*speed*dt;if(!solid(nx,p.z,.32,p.y))p.x=nx;if(!solid(p.x,nz,.32,p.y))p.z=nz;
 const wasGrounded=p.grounded;p.vy-=15*dt;p.y+=p.vy*dt;const floor=Math.max(0,...ARENA.obstacles.filter(q=>Math.hypot(p.x-clamp(p.x,q.x,q.x+q.w),p.z-clamp(p.z,q.z,q.z+q.d))<.32).map(q=>q.h));if(p.y<=floor&&p.vy<=0){p.y=floor;p.vy=0;p.grounded=true;}else p.grounded=false;if(!wasGrounded&&p.grounded&&this.pendingStumble){this.pendingStumble=false;this.personality('stumble',true);}
 for(const m of this.mice){if(!m.active){m.respawn-=dt;if(m.respawn<=0){Object.assign(m,this.spawnPoint(5),{active:true,slow:0});}continue;}this.moveMouse(m,dt);if(segmentDistance(m,before,p)<(this.pounceTimer>0?this.character.pounce.reach:.82)){this.catchMouse(m);if(this.mode!=='playing')break;}}
 if(this.mode!=='playing')return;for(const b of this.bonuses){if(!b.active)continue;b.life-=dt;if(b.life<=0){b.active=false;continue;}if(distance(p,b)<this.character.pickupReach)this.collectBonus(b);}this.bonuses=this.bonuses.filter(b=>b.active);this.bonusTimer-=dt;if(this.bonusTimer<=0){this.spawnBonus();this.bonusTimer=12;}
 }
}
