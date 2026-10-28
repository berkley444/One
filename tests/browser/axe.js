const puppeteer=require('puppeteer-core'); const fs=require('fs');
const axeSrc=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const URL=process.argv[2]||(process.env.BPGW_URL||'file:///workspace/One_repo/index.html')+'';
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});
  const all={}; let total=0;
  for (const [w,mobile] of [[390,true],[1280,false]]) {
    const p=await b.newPage(); await p.setViewport({width:w,height:900,isMobile:mobile,hasTouch:mobile});
    await p.evaluateOnNewDocument(()=>{ if(!sessionStorage.getItem('__c')){ localStorage.clear(); sessionStorage.setItem('__c','1'); } });
    await p.goto(URL); await sleep(500);
    await p.evaluate(axeSrc);
    for (const tab of ['play','chord','circle','math','song','lessons','lessons-open','practice','identify','identify-done','quiz','quiz-checked','gate','gate-menu']) {
      await p.evaluate(t=>{ if(t==='lessons-open'){BPGW.setTab('lessons');document.querySelector('[data-act="lopen"]').click();} else if(t==='practice'){BPGW.setTab('lessons');document.querySelector('[data-act="prtog"]')&&document.querySelector('[data-act="prtog"]').click();} else if(t==='identify'){BPGW.setTab('play');BPGW.idEnter(false);} else if(t==='identify-done'){BPGW.idEnter(false);[[1,3],[2,2],[4,1]].forEach(([s,f])=>BPGW.idPress(s,f));BPGW.idPress(5,0);} else if(t==='quiz'){BPGW.idExit();BPGW.idEnter(true);} else if(t==='quiz-checked'){[[1,3],[2,2],[3,0],[4,1]].forEach(([s,f])=>BPGW.idPress(s,f));BPGW.quizCheck();} else if(t==='gate'){BPGW.idExit();BPGW.gateOpen(true);} else if(t==='gate-menu'){BPGW.gateClose();document.querySelector('#gateBtn').click();} else {if(document.querySelector('#gatePanel')&&!document.querySelector('#gatePanel').hidden)document.querySelector('#gateBtn').click();BPGW.idExit&&BPGW.idExit();BPGW.setTab(t);}},tab);
      await sleep(250);
      const r=await p.evaluate(async()=>{const x=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}}); return x.violations.map(v=>{ if(v.id==='label-content-name-mismatch') v.nodes=v.nodes.filter(n=>!/^<(div|g) class="(pk|lcol|cdiag|idc)[ "]/.test(n.html)); return v;}).filter(v=>v.nodes.length).map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,help:v.help,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' :: '+(n.any[0]?.message||n.all[0]?.message||n.none[0]?.message||'').slice(0,140))}));});
      for(const v of r){ const k=v.id; (all[k]??={help:v.help,impact:v.impact,where:{},ex:v.ex}); all[k].where[w+'/'+tab]=v.n; total+=v.n; }
    }
  }
  for(const [k,v] of Object.entries(all)) console.log(`\n${k} [${v.impact}] ${v.help}\n  `+Object.entries(v.where).map(e=>e.join('=')).join(' ')+'\n  '+v.ex.join('\n  '));
  console.log('\nTOTAL nodes',total,'rules',Object.keys(all).length);
  await b.close();
})();
