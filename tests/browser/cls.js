const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});
for(const block of [false,true]){
 const p=await b.newPage();await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
 if(block){await p.setRequestInterception(true);p.on('request',r=>/fonts\.(googleapis|gstatic)/.test(r.url())?r.abort():r.continue());}
 await p.evaluateOnNewDocument(()=>{window.__cls=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__cls.push([+e.value.toFixed(4),Math.round(e.startTime),(e.sources||[]).map(s=>s.node&&s.node.nodeName+'.'+(s.node.className||s.node.id)).join(',')])) ).observe({type:'layout-shift',buffered:true});});
 await p.goto('http://localhost:8123/index.html?'+Math.random(),{waitUntil:'networkidle2'});await sleep(1500);
 console.log(block?'fonts blocked:':'fonts allowed:',JSON.stringify(await p.evaluate(()=>window.__cls)));await p.close();}
await b.close();})();
