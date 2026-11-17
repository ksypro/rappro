export const VERSION=1;
export const LESSONS=[
 {id:'steady',title:'穩住節奏',description:'八分音符 · 每拍兩個音節',cycle:4},
 {id:'switch',title:'切換節奏',description:'八分音符 ↔ 三連音',cycle:8},
 {id:'ghost',title:'靜音接拍',description:'三 Bars 有聲 · 一 Bar 靜音',cycle:4}
];
export const clampBpm=value=>Math.max(40,Math.min(240,Math.round(Number(value)||80)));
export function pattern(id,bar){return {division:id==='switch'&&Math.floor(bar/4)%2===1?3:2,silent:id==='ghost'&&bar%4===3};}
export function buildTimeline(id,bpm){const lesson=LESSONS.find(x=>x.id===id);if(!lesson)throw Error('Unknown lesson');bpm=clampBpm(bpm);const beat=60/bpm,bar=beat*4,practiceStart=(lesson.cycle+1)*bar;const events=[];
 for(let b=0;b<lesson.cycle+17;b++){const phase=b<lesson.cycle?'demo':b===lesson.cycle?'count':'practice';const n=phase==='practice'?b-lesson.cycle-1:b;const p=phase==='count'?{division:1,silent:false}:pattern(id,n);
 for(let k=0;k<4;k++){events.push({time:b*bar+k*beat,phase,bar:n,beat:k,division:p.division,silent:p.silent,kind:'beat'});if(phase==='demo'&&!p.silent)for(let s=1;s<p.division;s++)events.push({time:b*bar+(k+s/p.division)*beat,phase,bar:n,beat:k,division:p.division,silent:false,kind:'sub'});}}
 return {bpm,barDuration:bar,practiceStart,duration:practiceStart+16*bar,events:events.sort((a,b)=>a.time-b.time),segments:Array.from({length:4},(_,i)=>({index:i,start:practiceStart+i*4*bar,end:practiceStart+(i+1)*4*bar,rating:'unrated'}))};}
