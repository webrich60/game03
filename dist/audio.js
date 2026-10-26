// A short voiced "nyaaan": harmonic vocal tone, moving vowel resonances and breath.
// No audio files or network request are required by the exported single HTML.
export function synthesizeMeow(sampleRate=22050){
 const duration=.82,out=new Float32Array(Math.ceil(sampleRate*duration));
 let phase=0,noise=23,peak=0;
 for(let i=0;i<out.length;i++){
  const t=i/sampleRate,u=t/duration;
  let hz=t<.12?480+t/.12*500:t<.32?980-(t-.12)/.20*210:770-(t-.32)/.50*410;
  hz*=1+.018*Math.sin(t*Math.PI*12);phase+=Math.PI*2*hz/sampleRate;
  const mouth=Math.min(1,t/.30),f1=1450-mouth*680,f2=2650-mouth*1050;
  let voiced=0;
  for(let n=1;n<=9;n++){
   const frequency=hz*n;
   const resonance=.20+1.2*Math.exp(-Math.pow((frequency-f1)/420,2))+.7*Math.exp(-Math.pow((frequency-f2)/560,2));
   voiced+=Math.sin(phase*n+Math.sin(t*17)*.025*n)*resonance/Math.pow(n,1.05);
  }
  noise=(noise*1664525+1013904223)>>>0;
  const breath=(noise/4294967296*2-1)*.10*(1-mouth*.7);
  const attack=Math.min(1,t/.035),release=Math.min(1,(duration-t)/.17),envelope=attack*release*(.9-.26*u);
  const value=(voiced+breath)*envelope;out[i]=value;peak=Math.max(peak,Math.abs(value));
 }
 const gain=.82/(peak||1);for(let i=0;i<out.length;i++)out[i]*=gain;
 return out;
}

export class GameAudio{
 constructor({createContext}={}){
  this.createContext=createContext||(()=>new(window.AudioContext||window.webkitAudioContext)());
  this.context=null;this.muted=false;this.pending=null;this.epoch=0;this.active=new Set();
 }
 setMuted(value){
  this.muted=Boolean(value);this.epoch++;
  if(this.muted){for(const s of this.active){try{s.stop();}catch{}}this.active.clear();}
 }
 unlock(){
  if(this.muted)return Promise.resolve(false);
  try{
   if(!this.context||this.context.state==='closed'){this.context=this.createContext();this.meowBuffer=null;}
   if(this.context.state==='running')return Promise.resolve(true);
   if(!this.pending){
    this.pending=Promise.resolve(this.context.resume()).then(()=>this.context.state==='running',()=>false).finally(()=>{this.pending=null;});
   }
   return this.pending;
  }catch{return Promise.resolve(false);}
 }
 async play(type){
  if(this.muted)return false;
  const epoch=this.epoch;
  // Creation and resume happen during the originating pointer/key event.
  const ready=await this.unlock();if(!ready||this.muted||epoch!==this.epoch)return false;
  const c=this.context;
  if(type==='meow'){
   if(!this.meowBuffer){const samples=synthesizeMeow();this.meowBuffer=c.createBuffer(1,samples.length,22050);this.meowBuffer.getChannelData(0).set(samples);}
   const source=c.createBufferSource(),gain=c.createGain();source.buffer=this.meowBuffer;gain.gain.value=.50;
   source.connect(gain);gain.connect(c.destination);this.track(source,gain);source.start(c.currentTime);return true;
  }
  const tone=(f,t=0,d=.18,end=0,volume=.045)=>{
   const o=c.createOscillator(),g=c.createGain(),now=c.currentTime+t;o.type='sine';o.frequency.setValueAtTime(f,now);if(end)o.frequency.exponentialRampToValueAtTime(end,now+d);
   g.gain.setValueAtTime(.001,now);g.gain.exponentialRampToValueAtTime(volume,now+.014);g.gain.exponentialRampToValueAtTime(.001,now+d);o.connect(g);g.connect(c.destination);this.track(o,g);o.start(now);o.stop(now+d+.02);
  };
  if(type==='jump')tone(220,0,.2,700);
  else if(type==='step')tone(110,0,.05,80,.008);
  else if(type==='gameover'){tone(440,0,.25,220);tone(220,.25,.35,110);}
  else{const notes=type==='clear'||type==='win'?[523,659,784,1046]:type==='bonus'?[784,1046,1568]:type==='catch'?[880,1175]:[523,784];notes.forEach((n,i)=>tone(n,i*.07,.18));}
  return true;
 }
 track(source,gain){this.active.add(source);source.onended=()=>{this.active.delete(source);source.disconnect?.();gain?.disconnect?.();};}
}
