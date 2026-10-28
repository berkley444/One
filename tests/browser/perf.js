const puppeteer=require('puppeteer-core');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const URL=process.argv[2]||(process.env.BPGW_URL||'file:///workspace/One_repo/index.html')+'';
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});
  const p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  const cdp=await p.target().createCDPSession(); await cdp.send('Emulation.setCPUThrottlingRate',{rate:4}); // ~mid phone
  await p.evaluateOnNewDocument(()=>{ if(!sessionStorage.getItem('__c')){ localStorage.clear(); sessionStorage.setItem('__c','1'); } });
  const t0=Date.now(); await p.goto(URL,{waitUntil:'load'}); const loadMs=Date.now()-t0;
  await sleep(500);
  const nav=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];const paint=Object.fromEntries(performance.getEntriesByType('paint').map(x=>[x.name,Math.round(x.startTime)]));return {dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),paint,bytes:document.documentElement.outerHTML.length,nodes:document.querySelectorAll('*').length}});
  console.log('4x CPU throttle: load wall',loadMs,'ms',JSON.stringify(nav));
  const res=await p.evaluate(()=>{
    const out={};
    for(const t of ['play','chord','circle','math','song','lessons']){ BPGW.setTab(t); const N=15; const a=performance.now(); for(let i=0;i<N;i++) BPGW.render(); out[t]={ms:+((performance.now()-a)/N).toFixed(1), nodes:document.querySelectorAll('#tab-'+t+' *').length, htmlKB:+(document.getElementById('tab-'+t).innerHTML.length/1024).toFixed(0)}; }
    return out;});
  console.log('render() per tab (4x throttle):'); for(const [k,v] of Object.entries(res)) console.log(' ',k,JSON.stringify(v));
  const heap=async()=>{await cdp.send('HeapProfiler.collectGarbage'); const m=await p.metrics(); return Math.round(m.JSHeapUsedSize/1024)+'KB / nodes '+m.Nodes+' / listeners '+m.JSEventListeners};
  const h0=await heap();
  await p.evaluate(()=>{for(let i=0;i<300;i++){BPGW.setTab(['play','chord','circle','math','song','lessons'][i%6]);}});
  console.log('heap before/after 300 tab switches:',h0,'→',await heap());
  // interaction: input latency of tapping a piano key
  await p.evaluate(()=>BPGW.setTab('play')); await sleep(200);
  const tap=await p.evaluate(()=>{const k=document.querySelector('.pk.w');const a=performance.now();for(let i=0;i<50;i++){k.dispatchEvent(new MouseEvent('click',{bubbles:true}));}return +((performance.now()-a)/50).toFixed(2)});
  console.log('piano tap handler ms:',tap);
  const sel=await p.evaluate(()=>{const a=performance.now();for(let i=0;i<15;i++){document.querySelector('.seg button[data-act]').click();}return +((performance.now()-a)/15).toFixed(1)});
  console.log('control click→render ms:',sel);
  await b.close();
})();
