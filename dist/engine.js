import {findCat} from './cats.js';
export const W=1080,H=680;
export const stages=[
 {name:'月あかりの展示室',subtitle:'THE MOONLIT GALLERY',fish:[[200,180],[530,150],[875,180],[360,465],[785,475]],walls:[[280,255,170,45],[625,255,170,45],[470,410,140,45]],boxes:[[165,365],[880,355],[570,560]],guards:[{route:[[490,230],[890,230],[890,545],[670,545]],speed:72},{route:[[200,510],[200,240],[410,240],[410,510]],speed:62}]},
 {name:'真珠とさんまの回廊',subtitle:'THE PEARL COLLECTION',fish:[[180,170],[500,155],[880,160],[210,490],[560,490],[890,510]],walls:[[300,220,45,235],[700,220,45,235],[455,300,160,45]],boxes:[[150,340],[535,240],[820,360]],guards:[{route:[[180,220],[240,220],[240,555],[160,555]],speed:77},{route:[[400,180],[650,180],[650,550],[400,550]],speed:76},{route:[[810,240],[950,240],[950,545],[810,545]],speed:67}]},
 {name:'黄金のおさかなの間',subtitle:'THE GOLDEN FISH VAULT',fish:[[170,165],[500,145],[890,170],[175,480],[500,490],[880,490],[860,335]],walls:[[290,245,155,45],[630,245,155,45],[290,400,155,45],[630,400,155,45]],boxes:[[530,335],[155,335],[930,570]],guards:[{route:[[210,200],[520,200],[520,360],[210,360]],speed:85},{route:[[590,170],[920,170],[920,370],[590,370]],speed:80},{route:[[235,550],[860,550],[860,330],[550,330],[550,550]],speed:85}]}
];
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function circleRect(x,y,r,rect){return Math.hypot(x-clamp(x,rect[0],rect[0]+rect[2]),y-clamp(y,rect[1],rect[1]+rect[3]))<r;}
export function blocked(x,y,walls,r=16){return x<65+r||x>1015-r||y<105+r||y>600-r||walls.some(w=>circleRect(x,y,r,w));}
export function lineClear(a,b,walls){const n=Math.ceil(dist(a,b)/8);for(let i=1;i<n;i++){const k=i/n;if(walls.some(w=>circleRect(a.x+(b.x-a.x)*k,a.y+(b.y-a.y)*k,2,w)))return false;}return true;}
export function canSee(g,p,walls){const d=dist(g,p);if(d>220||p.hidden)return false;const angle=Math.atan2(p.y-g.y,p.x-g.x);const diff=Math.atan2(Math.sin(angle-g.angle),Math.cos(angle-g.angle));return (d<36||Math.abs(diff)<.49)&&lineClear(g,p,walls);}
export class MuseumGame{
 constructor(){this.level=0;this.lives=3;this.totalTime=0;this.caught=0;this.events=[];this.selectedCat='monaka';this.load(0);this.mode='intro';}
 selectCat(id){this.selectedCat=findCat(id).id;}
 emit(type,text){this.events.push({type,text});}
 load(index){this.level=index;this.stage=stages[index];this.player={x:114,y:570,angle:-Math.PI/2,hidden:false,moving:false};this.fish=this.stage.fish.map(([x,y],i)=>({x,y,id:i,taken:false}));this.guards=this.stage.guards.map(g=>({...g,x:g.route[0][0],y:g.route[0][1],target:1,angle:Math.atan2(g.route[1][1]-g.route[0][1],g.route[1][0]-g.route[0][0]),distracted:0,look:0}));this.alert=0;this.invincible=2.5;this.yarnCooldown=0;this.yarn=null;this.elapsed=0;this.mode='playing';this.events=[];}
 start(){this.lives=3;this.totalTime=0;this.caught=0;this.load(0);}
 get count(){return this.fish.filter(f=>f.taken).length;}
 get nearbyBox(){return this.stage.boxes.find(([x,y])=>Math.hypot(x-this.player.x,y-this.player.y)<63);}
 hide(){if(this.mode!=='playing')return;if(this.player.hidden){this.player.hidden=false;this.emit('hide','小さな肉球で、そーっと。');return;}const box=this.nearbyBox;if(box){this.player.x=box[0];this.player.y=box[1];this.player.hidden=true;this.alert=Math.max(0,this.alert-.3);this.emit('hide','すっぽり。ここなら見つからないにゃ。');}else this.emit('tip','段ボール箱のそばで隠れられるよ');}
 throwYarn(){if(this.mode!=='playing')return;if(this.yarnCooldown>0){this.emit('tip',`毛糸玉の準備中… あと${Math.ceil(this.yarnCooldown)}秒`);return;}const p=this.player;let x=p.x,y=p.y;for(let d=10;d<=145;d+=10){const nx=p.x+Math.cos(p.angle)*d,ny=p.y+Math.sin(p.angle)*d;if(blocked(nx,ny,this.stage.walls,8))break;x=nx;y=ny;}this.yarn={x,y,life:4};this.yarnCooldown=8;for(const g of this.guards){if(dist(g,this.yarn)<430){g.distracted=4;g.look=Math.atan2(y-g.y,x-g.x);}}this.emit('yarn','ころころ… 警備員の気がそれた！');}
 update(dt,input={x:0,y:0}){if(this.mode!=='playing')return;dt=Math.min(dt,.05);this.elapsed+=dt;this.totalTime+=dt;this.invincible=Math.max(0,this.invincible-dt);this.yarnCooldown=Math.max(0,this.yarnCooldown-dt);if(this.yarn){this.yarn.life-=dt;if(this.yarn.life<=0)this.yarn=null;}const p=this.player;let {x:mx=0,y:my=0}=input;const mag=Math.hypot(mx,my);p.moving=mag>0&&!p.hidden;if(p.moving){mx/=mag;my/=mag;p.angle=Math.atan2(my,mx);const step=180*dt*Math.min(1,mag);const nx=p.x+mx*step,ny=p.y+my*step;if(!blocked(nx,p.y,this.stage.walls))p.x=nx;if(!blocked(p.x,ny,this.stage.walls))p.y=ny;}
 for(const f of this.fish){if(!f.taken&&!p.hidden&&dist(p,f)<42){f.taken=true;this.emit('fish',this.count===this.fish.length?'全部そろった！ 緑の出口へ帰ろう。':'おさかな、いただきにゃ！');}}
 let seen=false;for(const g of this.guards){if(g.distracted>0){g.distracted=Math.max(0,g.distracted-dt);g.angle=g.look;}else{const t=g.route[g.target];const dx=t[0]-g.x,dy=t[1]-g.y,d=Math.hypot(dx,dy);if(d<5)g.target=(g.target+1)%g.route.length;else{g.angle=Math.atan2(dy,dx);const step=Math.min(d,g.speed*dt);g.x+=dx/d*step;g.y+=dy/d*step;}}if(this.invincible<=0&&canSee(g,p,this.stage.walls))seen=true;}
 this.alert=clamp(this.alert+dt*(seen?.72:-.55),0,1);if(this.alert>=1){this.lives--;this.caught++;this.emit('caught',this.lives?'見つかった！ 入口からもう一度。お宝はそのまま。':'今夜はここまで。もう一度挑戦しよう。');if(this.lives<=0){this.mode='lost';return;}p.x=114;p.y=570;p.hidden=false;this.alert=0;this.invincible=3;}
 if(this.count===this.fish.length&&!p.hidden&&p.x<162&&p.y>523){this.mode=this.level===2?'won':'clear';this.emit('clear',this.mode==='won'?'大成功！':'次の展示室へ');}
 }
}
