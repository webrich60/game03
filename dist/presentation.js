const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function viewportBox(viewport,fallbackWidth=390,fallbackHeight=700){
 const width=Math.max(1,Number(viewport?.width)||fallbackWidth),height=Math.max(1,Number(viewport?.height)||fallbackHeight);
 return {width,height,left:Math.max(0,Number(viewport?.offsetLeft)||0),top:Math.max(0,Number(viewport?.offsetTop)||0)};
}

export function controlLayout(width,height){
 if(width<260){const move=clamp(width*.34,52,72);return {mode:'stacked',move,look:44,action:44,leftWidth:44,dockHeight:160};}
 if(height<500){const move=clamp(height*.22,76,92);return {mode:'horizontal',move,look:48,action:48,leftWidth:158,dockHeight:move+18};}
 const move=clamp(width*.27,84,112),look=clamp(width*.16,48,62),action=clamp(width*.15,44,56);
 return {mode:'normal',move,look,action,leftWidth:action*2+8,dockHeight:look+action+28};
}

// Fit every playable corner rather than guessing a portrait camera distance.
export function parkOverviewPose(aspect,yaw=0,fov=48){
 const target={x:0,y:1.1,z:0},pitch=1.20,sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch);
 const tangent=Math.tan(fov*Math.PI/360),tanX=tangent*Math.max(.1,aspect),margin=.86;
 let distance=16;
 for(const x of [-13.6,13.6])for(const z of [-13.6,13.6])for(const y of [0,3]){
  const ry=y-target.y,depth=x*sy*cp+ry*sp+z*cy*cp,right=x*cy-z*sy,up=-x*sy*sp+ry*cp-z*cy*sp;
  distance=Math.max(distance,depth+Math.abs(right)/(tanX*margin),depth+Math.abs(up)/(tangent*margin));
 }
 return {target,position:{x:sy*cp*distance,y:target.y+sp*distance,z:cy*cp*distance}};
}

export function mapPoint(x,z,size=176,padding=9){
 const extent=size-padding*2;
 return {x:padding+(clamp(x,-12,12)+12)/24*extent,y:padding+(clamp(z,-12,12)+12)/24*extent};
}

export function drawMinimap(ctx,game,size=176){
 const p=9,span=size-p*2;
 ctx.clearRect(0,0,size,size);ctx.fillStyle='#fff9e9';ctx.fillRect(0,0,size,size);
 ctx.fillStyle='#c7dcaf';ctx.fillRect(p,p,span,span);ctx.strokeStyle='#657e61';ctx.lineWidth=2;ctx.strokeRect(p,p,span,span);
 ctx.fillStyle='#a78963';
 for(const q of game.arenaObstacles||[]){const a=mapPoint(q.x,q.z,size);ctx.fillRect(a.x,a.y,q.w/24*span,q.d/24*span);}
 for(const m of game.mice){
  if(!m.active)continue;const a=mapPoint(m.x,m.z,size);
  ctx.fillStyle=m.gold?'#e9b42b':'#566375';ctx.beginPath();ctx.arc(a.x,a.y,m.gold?3.8:2.6,0,Math.PI*2);ctx.fill();
 }
 for(const b of game.bonuses){
  if(!b.active)continue;const a=mapPoint(b.x,b.z,size);ctx.fillStyle='#ffe082';ctx.strokeStyle='#82703e';ctx.lineWidth=1;ctx.fillRect(a.x-3,a.y-3,6,6);ctx.strokeRect(a.x-3,a.y-3,6,6);
 }
 const a=mapPoint(game.player.x,game.player.z,size);
 ctx.save();ctx.translate(a.x,a.y);ctx.rotate(-game.player.angle);
 ctx.fillStyle='#e77049';ctx.strokeStyle='#fffdf0';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(0,7);ctx.lineTo(-5,-5);ctx.lineTo(0,-2);ctx.lineTo(5,-5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}
