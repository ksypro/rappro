import test from 'node:test';
import assert from 'node:assert/strict';
import {TrainerAudio} from '../audio.js';
import {RangePlayback} from '../playback.js';
test('stop without recorder stop event is bounded, releases mic and retains chunks',async()=>{
 globalThis.cancelAnimationFrame=()=>{};let released=false;
 const a=new TrainerAudio({duration:20},()=>{},()=>{});a.ctx={currentTime:5,close:()=>Promise.resolve()};a.anchor=1;a.offset=.2;a.chunks=[new Blob(['partial'])];a.recorder={state:'recording',mimeType:'audio/mp4',stop(){this.state='inactive';}};a.mic={getTracks:()=>[{stop:()=>{released=true;}}]};
 const pending=a.stop();assert.equal(released,true);const result=await pending;assert.equal(result.incomplete,true);assert.equal(result.elapsed,4);assert.equal(result.blob.size,7);assert.equal((await a.stop()).blob,result.blob);
});
test('play stays in gesture; seek waits for metadata and stale seek is cancelled',async()=>{
 class Player extends EventTarget{readyState=0;duration=4;paused=true;plays=0;seeks=[];getAttribute(){return 'blob:test';}set currentTime(n){assert.ok(this.readyState>=1);this.seeks.push(n);}get currentTime(){return this.seeks.at(-1)||0;}pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}play(){this.plays++;this.paused=false;return Promise.resolve();}}
 const p=new Player();let errors=0;const playback=new RangePlayback(p,()=>errors++);playback.play(1,2);assert.equal(p.plays,1);assert.equal(p.seeks.length,0);p.readyState=1;p.dispatchEvent(new Event('loadedmetadata'));assert.deepEqual(p.seeks,[1]);playback.cancel();p.readyState=0;playback.play(2,3);playback.cancel();p.readyState=1;p.dispatchEvent(new Event('loadedmetadata'));assert.deepEqual(p.seeks,[1]);assert.equal(errors,0);
});
