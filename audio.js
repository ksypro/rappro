export class TrainerAudio{
 constructor(timeline,onTick,onEnd){this.timeline=timeline;this.onTick=onTick;this.onEnd=onEnd;this.nodes=new Set();this.closed=false;}
 async prepare(record){const AC=window.AudioContext||window.webkitAudioContext;this.ctx=new AC();await this.ctx.resume();this.mix=this.ctx.createMediaStreamDestination();this.recordRequested=record;
 if(record){try{if(!window.MediaRecorder)throw Error('Unsupported recording');this.mic=await navigator.mediaDevices.getUserMedia({audio:true});if(this.closed){this.mic.getTracks().forEach(t=>t.stop());return;}this.source=this.ctx.createMediaStreamSource(this.mic);this.source.connect(this.mix);const mime=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(t=>MediaRecorder.isTypeSupported?.(t));this.recorder=new MediaRecorder(this.mix.stream,mime?{mimeType:mime}:undefined);this.chunks=[];this.recorder.ondataavailable=e=>{if(e.data.size)this.chunks.push(e.data);};
this.recorder.addEventListener('stop',()=>{this.stopped=true;this.resolveStopped?.();if(!this.closed){this.recordError=Error('Recorder stopped unexpectedly');this.onEnd(true);}});
for(const track of this.mic.getAudioTracks()){const interrupt=()=>{if(!this.closed){this.recordError=Error('Microphone interrupted');this.onEnd(true);}};track.addEventListener('ended',interrupt);track.addEventListener('mute',interrupt);}}catch(e){this.mic?.getTracks().forEach(t=>t.stop());this.recordError=e;}}
 }
 async start(){if(this.closed)return;if(this.recorder){await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Recording start timed out')),8000);this.cancelStart=()=>{clearTimeout(timer);resolve();};this.recorder.onstart=()=>{clearTimeout(timer);this.recordOrigin=this.ctx.currentTime;resolve();};this.recorder.onerror=e=>{clearTimeout(timer);reject(e.error||Error('Recording failed'));};try{this.recorder.start(1000);}catch(e){clearTimeout(timer);reject(e);}});this.recorder.onerror=()=>{this.recordError=Error('Recording interrupted');this.onEnd(true);};}else this.recordOrigin=this.ctx.currentTime;if(this.closed)return;this.anchor=this.ctx.currentTime+.15;this.offset=this.anchor-this.recordOrigin;this.index=0;this.visualIndex=0;
 this.ctx.onstatechange=()=>{if(!this.closed&&this.ctx.state!=='running')this.onEnd(true);};
 const schedule=()=>{if(this.closed)return;const now=this.ctx.currentTime;while(this.index<this.timeline.events.length&&this.anchor+this.timeline.events[this.index].time<now+.12){const e=this.timeline.events[this.index++];if(!e.silent)this.click(this.anchor+e.time,e);}if(now>=this.anchor+this.timeline.duration)this.onEnd(false);};
 const frame=()=>{if(this.closed)return;const elapsed=this.ctx.currentTime-this.anchor;while(this.visualIndex<this.timeline.events.length&&this.timeline.events[this.visualIndex].time<=elapsed){const e=this.timeline.events[this.visualIndex++];if(e.kind==='beat')this.onTick(e);}this.raf=requestAnimationFrame(frame);};schedule();this.timer=setInterval(schedule,25);frame();}
 click(time,e){const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.frequency.value=e.kind==='sub'?1100:e.beat===0?750:500;g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(e.kind==='sub'?.10:.22,time+.003);g.gain.exponentialRampToValueAtTime(.001,time+.055);o.connect(g);g.connect(this.ctx.destination);g.connect(this.mix);this.nodes.add(o);o.onended=()=>{this.nodes.delete(o);g.disconnect();};o.start(time);o.stop(time+.06);}
 async stop(){if(this.stopping)return this.stopping;this.stopping=this.finish();return this.stopping;}
 async finish(){
  this.closed=true;
  this.cancelStart?.();
  clearInterval(this.timer);
  cancelAnimationFrame(this.raf);
  const elapsed=this.anchor?Math.max(0,Math.min(this.timeline.duration,this.ctx.currentTime-this.anchor)):0;
  for(const o of this.nodes){try{o.stop();}catch{}}
  // Release microphone immediately, even if Safari delays recorder events.
  this.mic?.getTracks().forEach(t=>t.stop());
  let incomplete=false,blob=null;
  if(this.recorder){
   await new Promise(resolve=>{
    if(this.stopped){resolve();return;}
    const timer=setTimeout(()=>{incomplete=true;resolve();},2500);
    this.resolveStopped=()=>{clearTimeout(timer);resolve();};
    try{if(this.recorder.state!=='inactive')this.recorder.stop();else if(!this.chunks?.length)this.resolveStopped();}catch{incomplete=true;this.resolveStopped();}
   });
   blob=new Blob(this.chunks||[],{type:this.recorder.mimeType||this.chunks?.[0]?.type||'audio/mp4'});
   if(!blob.size)blob=null;
  }
  this.mix?.stream.getTracks().forEach(t=>t.stop());
  // Closing AudioContext can itself be delayed by the OS while backgrounded.
  this.ctx?.close().catch(()=>{});
  return {blob,elapsed,offset:this.offset||0,recordError:!!this.recordError,incomplete};
 }
}
