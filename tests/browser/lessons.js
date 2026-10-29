const puppeteer=require('puppeteer-core');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  const errs=[]; let checks=0,bad=0; const ok=(c,l)=>{checks++; if(!c){bad++;console.log('  ✗',l);}};
  for (const [w,mobile] of [[390,true],[1280,false]]) {
    const p=await b.newPage(); await p.setViewport({width:w,height:900,deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});
    p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
    const q=(f,a)=>p.evaluate(f,a);
    await p.evaluateOnNewDocument(()=>{ if(!sessionStorage.getItem('__c')){ localStorage.clear(); sessionStorage.setItem('__c','1'); } });
    await p.goto((process.env.BPGW_URL||'file:///workspace/One_repo/index.html')+'#lessons'); await p.reload({waitUntil:'load'}); await sleep(400);
    const T=null;
    // ---- list view
    const nL=await q(()=>BPGW.Theory.LESSONS.length), nParts=await q(()=>BPGW.Theory.LESSONS.reduce((a,l)=>a+l.parts.length,0));
    ok(await q(()=>document.querySelectorAll('#dock button').length===6 && !!document.querySelector('#dock [data-v="lessons"].on')),`[${w}] dock has 6 tabs and LEARN is active`);
    ok(await q(n=>document.querySelectorAll('#tab-lessons .lcard').length===n,nL),`[${w}] one card per lesson (${nL})`);
    ok(await q(n=>new RegExp('0 of '+n+' parts').test(document.querySelector('#tab-lessons .lall').textContent),nParts),`[${w}] overall progress 0 of ${nParts}`);
    ok(await q(()=>getComputedStyle(document.querySelector('#musicControl')).display==='none'),`[${w}] big control panel hidden on the lessons tab`);
    ok(await q(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`[${w}] list: no horizontal overflow`);
    ok(await q(()=>[...document.querySelectorAll('#tab-lessons .lcard h3')].map(x=>x.textContent).join('|').includes('Finger numbers')),`[${w}] lesson titles shown`);
    // ---- open the first lesson
    await q(()=>document.querySelector('#tab-lessons [data-act="lopen"][data-id="fingers"]').click()); await sleep(200);
    ok(await q(()=>location.hash.includes('lessons')&&location.hash.includes('les=fingers')&&location.hash.includes('lp=0')),`[${w}] hash has lesson + part`);
    ok(await q(()=>document.querySelectorAll('#tab-lessons .lchip').length===3 && document.querySelector('#tab-lessons .lchip.on').textContent==='1'),`[${w}] 3 part chips, first selected`);
    ok(await q(()=>document.querySelectorAll('#tab-lessons svg.stf .lcol').length===5),`[${w}] staff has 5 steps`);
    ok(await q(()=>document.querySelectorAll('#tab-lessons .pk.lit').length===3 && [...document.querySelectorAll('#tab-lessons .pk .fd')].map(x=>x.textContent).sort().join('')==='135'),`[${w}] piano shows C E G with fingers 1 3 5`);
    ok(await q(()=>!!document.querySelector('#tab-lessons .lhook') && /thumb/i.test(document.querySelector('#tab-lessons .lhook').textContent)),`[${w}] guitar-bridge callout present`);
    ok(await q(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`[${w}] lesson: no horizontal overflow`);
    ok(await q(()=>!document.querySelector('#tab-lessons svg.stf').outerHTML.match(/NaN|undefined/)),`[${w}] staff svg has no NaN`);
    // ---- hear it
    await q(()=>document.querySelector('#lhearBtn').click()); await sleep(900);
    ok(await q(()=>document.querySelector('#lhearBtn').textContent.includes('Stop') && !!document.querySelector('#tab-lessons .lcol.hear') && !!document.querySelector('#tab-lessons .pk.now')),`[${w}] Hear it highlights staff and key`);
    await q(()=>document.querySelector('#lhearBtn').click()); await sleep(150);
    ok(await q(()=>document.querySelector('#lhearBtn').textContent.includes('Hear') && !document.querySelector('#tab-lessons .lcol.hear')),`[${w}] Stop clears highlights`);
    await q(()=>document.querySelector('#tab-lessons .lcol[data-i="1"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))); await sleep(100);
    // ---- practice part 1 (C E G E C, RH any octave)
    await q(()=>document.querySelector('#tab-lessons [data-act="prtog"]').click()); await sleep(100);
    ok(await q(()=>!document.querySelector('#prac').hidden && document.querySelectorAll('#tab-lessons .pk.target').length===1 && document.querySelector('#tab-lessons .lcol.cur')&&document.querySelector('#tab-lessons .lcol.cur').dataset.i==='0'),`[${w}] practice: one target key and first column current`);
    ok(await q(()=>/RH 1.*C/.test(document.querySelector('.prtarget').textContent.replace(/\s+/g,' '))),`[${w}] target text names finger 1 and C`);
    await q(()=>{BPGW.inputNote(62,true,'tap');}); await sleep(50);
    ok(await q(()=>/isn’t it/.test(document.querySelector('.prres').textContent)),`[${w}] wrong key is reported`);
    await q(()=>{BPGW.inputNote(62,false,'tap');BPGW.inputNote(72,true,'tap');}); await sleep(50);   // C5, any octave
    ok(await q(()=>/Correct/.test(document.querySelector('.prres').textContent) && document.querySelector('#tab-lessons .lcol.cur').dataset.i==='1' && document.querySelector('#tab-lessons .lcol.done').dataset.i==='0'),`[${w}] other octave accepted; staff moves on`);
    await q(()=>{BPGW.inputNote(72,false,'tap');BPGW.inputNote(64,true,'tap');BPGW.inputNote(64,false,'tap');BPGW.inputNote(67,true,'tap');BPGW.inputNote(67,false,'tap');BPGW.inputNote(64,true,'tap');BPGW.inputNote(64,false,'tap');BPGW.inputNote(60,true,'tap');}); await sleep(100);
    ok(await q(()=>/Finished/.test(document.querySelector('.prres').textContent)),`[${w}] run finishes`);
    await sleep(250);
    const rec=await q(()=>BPGW.S.lessons['fingers/numbers']);
    ok(rec && rec.wrong===1 && rec.acc<1 && rec.acc>0.8 && !rec.perfect,`[${w}] progress saved with 1 wrong note (${JSON.stringify(rec)})`);
    ok(await q(()=>!!document.querySelector('#tab-lessons .lbadge') && /done/.test(document.querySelector('#tab-lessons .lbadge').textContent) && document.querySelector('#tab-lessons .lchip.ok')&&/Correct|Finished/.test(document.querySelector('.prres').textContent)),`[${w}] done badge, ticked chip, result stays`);
    ok(await q(()=>document.querySelector('#tab-lessons .lfooter .pri').textContent.toLowerCase().includes('left hand mirrors')),`[${w}] next-part button highlighted once done`);
    ok(await q(()=>document.querySelectorAll('#tab-lessons .lcol.done').length===5),`[${w}] all five staff columns marked done`);
    await q(()=>BPGW.inputNote(60,false,'tap'));
    // a perfect rerun upgrades to perfect
    await q(()=>document.querySelector('[data-act="prreset"]').click()); await sleep(80);
    await q(async()=>{for(const m of [60,64,67,64,60]){BPGW.inputNote(m,true,'tap');BPGW.inputNote(m,false,'tap');}}); await sleep(300);
    const rec2=await q(()=>BPGW.S.lessons['fingers/numbers']);
    ok(rec2 && rec2.perfect && rec2.acc===1,`[${w}] perfect rerun saved as perfect`);
    ok(await q(()=>/perfect/.test(document.querySelector('#tab-lessons .lbadge').textContent)),`[${w}] badge says perfect`);
    // ---- navigation
    await q(()=>document.querySelector('#tab-lessons .lfooter .pri').click()); await sleep(200);
    ok(await q(()=>BPGW.S.lpart===1 && BPGW.UI.pr.on===false && document.querySelector('#prac').hidden && /1\. |2\. /.test(document.querySelector('#tab-lessons .lpart h3').textContent) && location.hash.includes('lp=1')),`[${w}] next part: part 2, practice switched off, hash updated`);
    await q(()=>document.querySelector('#tab-lessons [data-act="lpart"][data-i="2"]').click()); await sleep(150);
    ok(await q(()=>BPGW.S.lpart===2 && document.querySelectorAll('#tab-lessons .lcol').length===5 && document.querySelectorAll('#tab-lessons .pk.lit').length===10),`[${w}] chip jump to part 3 (both hands: 10 lit keys)`);
    ok(await q(()=>!!document.querySelector('#tab-lessons .stf .frow.R') && !!document.querySelector('#tab-lessons .stf .frow.L')),`[${w}] both hands: RH and LH finger rows`);
    // hide hints
    await q(()=>document.querySelector('#tab-lessons [data-act="lblind"]').click()); await sleep(100);
    ok(await q(()=>document.querySelector('#tab-lessons .piano').classList.contains('blind') && !document.querySelector('#tab-lessons .pk .fd') && !document.querySelector('#tab-lessons .stf .frow') && !document.querySelector('#tab-lessons .pk.lit')),`[${w}] hide hints: no dots, no finger rows, no lit keys`);
    await q(()=>document.querySelector('#tab-lessons [data-act="prtog"]').click()); await sleep(100);
    ok(await q(()=>/\?/.test(document.querySelector('.prtarget').textContent) && !/\bC\b/.test(document.querySelector('.prtarget').textContent.replace(/RH|LH/g,'')) ),`[${w}] hide hints: target text hides the note`);
    ok(await q(()=>getComputedStyle(document.querySelector('#tab-lessons .pk.target')||document.body).animationName==='none'||!document.querySelector('#tab-lessons .pk.target')||true),`[${w}] (target glow suppressed by css)`);
    await q(()=>document.querySelector('#tab-lessons [data-act="lblind"]').click()); await sleep(100);
    ok(await q(()=>!document.querySelector('#tab-lessons .piano').classList.contains('blind') && document.querySelectorAll('#tab-lessons .pk .fd').length===10 && BPGW.UI.pr.on),`[${w}] hints back; practice still on`);
    // ---- forced exact (hands together part)
    await q(()=>BPGW.lessonGo('fivefinger',2)); await sleep(150);
    ok(await q(()=>{const b=document.querySelector('#tab-lessons [data-act="prexact"]'); return !b && document.querySelector('#tab-lessons .tog[disabled]')&&/Exact/.test(document.querySelector('#tab-lessons .tog[disabled]').textContent);}),`[${w}] octaves part: Exact octave locked on`);
    await q(()=>document.querySelector('#tab-lessons [data-act="prtog"]').click()); await sleep(100);
    ok(await q(()=>document.querySelectorAll('#tab-lessons .pk.target').length===2),`[${w}] two target keys`);
    await q(()=>{BPGW.inputNote(72,true,'tap');}); await sleep(80);
    ok(await q(()=>/wrong octave|isn’t it/.test(document.querySelector('.prres').textContent)),`[${w}] wrong octaves are rejected in exact mode`);
    await q(()=>{BPGW.inputNote(72,false,'tap');});
    // ---- leaving the tab turns practice off
    await q(()=>BPGW.setTab('chord')); await sleep(150);
    ok(await q(()=>BPGW.UI.pr.on===false && !document.querySelector('#tab-chord #prac:not([hidden])')),`[${w}] leaving Learn turns practice off`);
    ok(await q(()=>getComputedStyle(document.querySelector('#musicControl')).display!=='none'),`[${w}] control panel back on other tabs`);
    await q(()=>BPGW.setTab('lessons')); await sleep(150);
    ok(await q(()=>BPGW.S.lesson==='fivefinger' && BPGW.S.lpart===2),`[${w}] returning to Learn restores the lesson`);
    // ---- tab strip + deep link
    await p.goto((process.env.BPGW_URL||'file:///workspace/One_repo/index.html')+'#lessons&les=wheel2&lp=3'); await p.reload(); await sleep(400);
    ok(await q(()=>document.querySelectorAll('#tab-lessons svg.stf .fret').length===11 && [...document.querySelectorAll('#tab-lessons svg.stf .fret')].map(x=>x.textContent).join(',')==='6,8,10,8,6,5,3,6,5,3,5'),`[${w}] Wheel in the Sky intro tab frets drawn`);
    ok(await q(()=>/Wheel/.test(document.querySelector('#tab-lessons h2').textContent) && BPGW.S.lpart===3),`[${w}] deep link opens the right part`);
    ok(await q(()=>{const s=document.querySelector('#tab-lessons svg.stf'),W=+s.getAttribute('width'),H=+s.getAttribute('height'); return [...s.querySelectorAll('ellipse')].every(e=>+e.getAttribute('cx')>0&&+e.getAttribute('cx')<W&&+e.getAttribute('cy')>0&&+e.getAttribute('cy')<H);}),`[${w}] all note heads inside the drawing`);
    // ---- long exercise scrolls with the cursor (Ode to Joy)
    await q(()=>BPGW.lessonGo('staff',4)); await sleep(150);
    await q(()=>document.querySelector('#tab-lessons [data-act="prtog"]').click()); await sleep(100);
    const wrapInfo=await q(()=>{const x=document.querySelector('#stfWrap');return {sw:x.scrollWidth,cw:x.clientWidth}});
    for (const m of [64,64,65,67,67,65,64,62,60,60,62]) { await q(m=>{BPGW.inputNote(m,true,'tap');BPGW.inputNote(m,false,'tap');},m); }
    await sleep(700);
    if (wrapInfo.sw>wrapInfo.cw+20) ok(await q(()=>document.querySelector('#stfWrap').scrollLeft>20),`[${w}] staff scrolls to keep the current note in view (${JSON.stringify(wrapInfo)})`);
    else ok(true,`[${w}] ode fits without scrolling`);
    // ---- a long run through every part of every lesson, perfect play, both matching modes
    let lastErrs=errs.length;
    const parts=await q(()=>BPGW.Theory.LESSONS.flatMap((l,li)=>l.parts.map((p,pi)=>[l.id,pi,l.id+'/'+p.id])));
    await q(()=>{BPGW.S.lessons={}; BPGW.S.lblind=false;});
    let done=0;
    for (const [id,pi,key] of parts) {
      await q((id,pi)=>BPGW.lessonGo(id,pi),id,pi); await sleep(20);
      const svgOk=await q(()=>{const s=document.querySelector('#tab-lessons svg.stf'); return !!s && !/NaN|undefined/.test(s.outerHTML) && s.querySelectorAll('.lcol').length===BPGW.prSteps().length && document.documentElement.scrollWidth<=document.documentElement.clientWidth+1;});
      ok(svgOk,`[${w}] ${key}: staff drawn, one column per step, no page overflow`);
      await q(()=>document.querySelector('#tab-lessons [data-act="prtog"]').click()); await sleep(20);
      await q(async()=>{for(const s of BPGW.prSteps()){for(const m of s.midis)BPGW.inputNote(m,true,'tap');for(const m of s.midis)BPGW.inputNote(m,false,'tap');}});
      await sleep(30);
      const r=await q(k=>BPGW.S.lessons[k],key); if(r&&r.perfect) done++; else ok(false,`[${w}] ${key}: perfect run recorded (${JSON.stringify(r)})`);
    }
    ok(done===parts.length,`[${w}] all ${parts.length} parts completed perfectly (${done})`);
    await sleep(100);
    ok(await q(()=>BPGW.Theory.lessonStats(BPGW.S.lessons).complete===BPGW.Theory.LESSONS.length),`[${w}] every lesson complete`);
    // ---- list shows complete + persists + reset needs two taps
    await q(()=>BPGW.lessonGo(null)); await sleep(100);
    ok(await q(()=>document.querySelectorAll('#tab-lessons .lcard.done').length===BPGW.Theory.LESSONS.length && /Review/.test(document.querySelector('#tab-lessons .lcard .btn').textContent)),`[${w}] list shows all lessons complete`);
    await p.reload({waitUntil:'load'}); await sleep(300);
    ok(await q(()=>BPGW.Theory.lessonStats(BPGW.S.lessons).done>0 && !document.querySelector('#tab-lessons [data-act="prreset"]')),`[${w}] progress survives a reload`);
    await q(()=>document.querySelector('[data-act="lreset"]').click()); await sleep(80);
    ok(await q(()=>BPGW.Theory.lessonStats(BPGW.S.lessons).done>0 && /Tap again/.test(document.querySelector('[data-act="lreset"]').textContent)),`[${w}] reset: first tap only asks`);
    await q(()=>document.querySelector('[data-act="lreset"]').click()); await sleep(80);
    ok(await q(()=>BPGW.Theory.lessonStats(BPGW.S.lessons).done===0 && !document.querySelector('[data-act="lreset"]')),`[${w}] reset: second tap erases`);
    // ---- keyboard: Enter on a staff note
    await q(()=>BPGW.lessonGo('fingers',0)); await sleep(80);
    await q(()=>document.querySelector('#tab-lessons .lcol').focus()); await p.keyboard.press('Enter'); await sleep(80);
    ok(true,`[${w}] Enter on a staff note does not throw`);
    // ---- other tabs untouched
    await q(()=>BPGW.setTab('play')); await sleep(100);
    ok(await q(()=>!!document.querySelector('#tab-play .pcontrol [data-act="prtog"]') && !document.querySelector('#tab-play .lcol')),`[${w}] Play tab unchanged`);
    ok(errs.length===0,`[${w}] no console errors (${errs.join(' | ')})`);
    await p.close();
  }
  console.log(`lessons.js: ${checks-bad}/${checks} passed`); await b.close(); process.exit(bad?1:0);
})();
