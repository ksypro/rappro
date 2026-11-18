import {test,expect} from '@playwright/test';
test('WebKit: missing recording API falls back; interruption unlocks immediate retry',async({page})=>{
 await page.goto('/gym.html');test.skip(await page.evaluate(()=>typeof AudioContext==='undefined'),'Windows WebKit has no Web Audio / MediaRecorder; real Safari required');await page.locator('#start').click();await expect(page.locator('#notice')).toContainText('純跟練');await expect(page.locator('#phase')).toHaveText('聽示範');await page.waitForTimeout(500);
 await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
 await expect(page.locator('#reviewMeta')).toContainText('練習中斷');await expect(page.locator('#repeat')).toBeEnabled();await page.locator('#repeat').click();await expect(page.locator('#start')).toBeVisible();
});
test('WebKit: native WAV playback, metadata seek, range end and background pause',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/gym.html');test.skip(await page.evaluate(()=>typeof AudioContext==='undefined'),'Windows WebKit media backend unavailable; native playback requires Safari');
 await page.evaluate(async()=>{
  const rate=44100,n=rate*4,buffer=new ArrayBuffer(44+n*2),v=new DataView(buffer);const str=(offset,s)=>[...s].forEach((c,i)=>v.setUint8(offset+i,c.charCodeAt(0)));
  str(0,'RIFF');v.setUint32(4,36+n*2,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,n*2,true);for(let i=0;i<n;i++)v.setInt16(44+i*2,Math.sin(i*440*2*Math.PI/rate)*3000,true);
  const {saveSession}=await import('/storage.js');await saveSession({id:'wav-fixture',lessonId:'steady',bpm:80,createdAt:new Date().toISOString(),completed:false,recordingOffset:0,blob:new Blob([buffer],{type:'audio/wav'}),segments:[{index:0,start:.5,end:1.1,available:true,rating:'unrated'}]});
 });
 await page.locator('#historyTab').click();await page.getByRole('button',{name:'回聽與標記'}).click();await page.locator('#segments button').click();await expect.poll(()=>page.locator('#player').evaluate(p=>p.currentTime)).toBeGreaterThan(.5);await expect.poll(()=>page.locator('#player').evaluate(p=>p.paused)).toBe(true);await page.locator('#playAll').click();await expect.poll(()=>page.locator('#player').evaluate(p=>p.paused)).toBe(false);await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));await expect(page.locator('#player')).toHaveJSProperty('paused',true);expect(errors).toEqual([]);
});

test('WebKit DOM: mobile layout and deferred seek controller',async({page})=>{
 await page.goto('/gym.html');await expect(page.locator('.course')).toHaveCount(3);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const result=await page.evaluate(async()=>{const {RangePlayback}=await import('/playback.js');class Fake extends EventTarget{readyState=0;duration=4;time=0;plays=0;pause(){}play(){this.plays++;return Promise.resolve();}set currentTime(v){if(!this.readyState)throw Error('No metadata');this.time=v;}get currentTime(){return this.time;}getAttribute(){return 'fixture';}}const p=new Fake();let errors=0;const c=new RangePlayback(p,()=>errors++);c.play(1,2);const before=p.time;p.readyState=1;p.dispatchEvent(new Event('loadedmetadata'));const after=p.time;c.cancel();return{before,after,plays:p.plays,errors};});expect(result).toEqual({before:0,after:1,plays:1,errors:0});
});
