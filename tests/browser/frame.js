const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});
for(const [name,url] of [['before (c50110f)','http://localhost:8124/index.html'],['after','http://localhost:8123/index.html']]){
 const p=await b.newPage();await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 const c=await p.target().createCDPSession(); await c.send('Emulation.setCPUThrottlingRate',{rate:4});
 await p.goto(url);await sleep(500);
 const out=await p.evaluate(async()=>{const r={};const raf=()=>new Promise(res=>requestAnimationFrame(()=>requestAnimationFrame(res)));
  for(const t of ['play','chord','circle','math','song','lessons']){BPGW.setTab(t);await raf();const ts=[];for(let i=0;i<12;i++){const a=performance.now();BPGW.render();await raf();ts.push(performance.now()-a);}ts.sort((x,y)=>x-y);r[t]=+ts[6].toFixed(1);}return r;});
 console.log(name.padEnd(18),'render→2 frames, 4x CPU, median ms:',JSON.stringify(out)); await p.close();}
await b.close();})();
