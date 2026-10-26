const limit=(value,min,max)=>Math.max(min,Math.min(max,value));

export function stickVector(dx,dy,radius,deadzone=.12){
 const length=Math.hypot(dx,dy);
 if(radius<=0||length<=radius*deadzone)return {x:0,y:0};
 const strength=limit((length/radius-deadzone)/(1-deadzone),0,1);
 return {x:dx/length*strength,y:dy/length*strength};
}

export function movementVector(keyX,keyY,stick,yaw=0){
 let x=keyX+stick.x,y=keyY+stick.y;
 const magnitude=Math.hypot(x,y);
 if(magnitude>1){x/=magnitude;y/=magnitude;}
 return {x:x*Math.cos(yaw)+y*Math.sin(yaw),y:-x*Math.sin(yaw)+y*Math.cos(yaw)};
}

export function cameraDelta(stick,dt){return {yaw:stick.x*1.9*dt,pitch:stick.y*.8*dt};}

// Each action owns only its own pointer. A second finger never cancels a stick.
export class ActionButton{
 constructor(element,action,enabled=()=>true){
  this.element=element;this.pointer=null;
  element.addEventListener('pointerdown',event=>{
   if(event.button>0||element.disabled||!enabled()||this.pointer!==null)return;
   event.preventDefault();event.stopPropagation();this.pointer=event.pointerId;
   element.setPointerCapture(event.pointerId);element.classList.add('pressed');action();
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(name,event=>{if(event.pointerId===this.pointer)this.reset();});
  // Keyboard/assistive clicks have detail 0; pointer clicks already fired on down.
  element.addEventListener('click',event=>{event.preventDefault();if(event.detail===0&&!element.disabled&&enabled())action();});
  element.addEventListener('contextmenu',event=>event.preventDefault());
 }
 reset(){const pointer=this.pointer;this.pointer=null;this.element.classList.remove('pressed');if(pointer!==null&&this.element.hasPointerCapture(pointer))this.element.releasePointerCapture(pointer);}
}

export class VirtualStick{
 constructor(element,enabled=()=>true){
  this.element=element;this.enabled=enabled;this.pointer=null;this.x=0;this.y=0;
  element.addEventListener('pointerdown',event=>{
   if(!this.enabled()||this.pointer!==null||event.button>0)return;
   event.preventDefault();this.pointer=event.pointerId;
   element.setPointerCapture(event.pointerId);element.classList.add('active');this.move(event);
  });
  element.addEventListener('pointermove',event=>{if(event.pointerId===this.pointer){event.preventDefault();this.move(event);}});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(name,event=>{if(event.pointerId===this.pointer)this.reset();});
  element.addEventListener('contextmenu',event=>event.preventDefault());
 }
 move(event){
  if(!this.enabled()){this.reset();return;}
  const rect=this.element.getBoundingClientRect(),radius=rect.width*.30;
  const dx=event.clientX-rect.left-rect.width/2,dy=event.clientY-rect.top-rect.height/2;
  const length=Math.hypot(dx,dy),visual=length>radius?radius/length:1;
  const vector=stickVector(dx,dy,radius);this.x=vector.x;this.y=vector.y;
  this.element.style.setProperty('--stick-x',`${dx*visual}px`);
  this.element.style.setProperty('--stick-y',`${dy*visual}px`);
 }
 reset(){
  const pointer=this.pointer;this.pointer=null;this.x=0;this.y=0;
  this.element.classList.remove('active');this.element.style.setProperty('--stick-x','0px');this.element.style.setProperty('--stick-y','0px');
  if(pointer!==null&&this.element.hasPointerCapture(pointer))this.element.releasePointerCapture(pointer);
 }
}
