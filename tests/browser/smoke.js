const puppeteer=require('puppeteer-core');
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  const errs=[]; let checks=0, bad=0;
  const ok=(c,l)=>{checks++; if(!c){bad++; console.log('  ✗',l);} };
  for (const [w,mobile] of [[390,true],[1280,false]]) {
    const p=await b.newPage(); await p.setViewport({width:w,height:844,deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});
    p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+' '+m.text())});
    await p.goto((process.env.BPGW_URL||'file:///workspace/One_repo/index.html')+'#play&mode=scale&scale=major&root=C&tuning=standard',{waitUntil:'load'});
    await p.evaluate(()=>{localStorage.clear();}); await p.goto((process.env.BPGW_URL||'file:///workspace/One_repo/index.html')+'#play&mode=scale&scale=major&root=C&tuning=standard');
    await p.reload({waitUntil:'load'}); await new Promise(r=>setTimeout(r,400));
    const q=(f,a)=>p.evaluate(f,a);
    // scales
    let n=await q(()=>document.querySelectorAll('#tab-play [data-act="spos"]').length); ok(n===8,`[${w}] major has All+7 buttons (${n})`);
    const oneLine=async(sel)=>q((sel)=>{const bs=[...document.querySelectorAll(sel)]; const tops=new Set(bs.map(x=>Math.round(x.getBoundingClientRect().top))); return tops.size===1 && bs.length>0;},sel);
    ok(await oneLine('#tab-play [data-act="spos"]'),`[${w}] scale buttons on one line`);
    ok(await q(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`[${w}] no horizontal page overflow (play)`);
    for (let k=0;k<7;k++){
      await p.click(`[data-act="spos"][data-v="${k}"]`);
      const r=await q(()=>({sp:BPGW.S.scalePos, on:document.querySelector('#tab-play .pos.on')?.dataset.v, dots:document.querySelectorAll('#tab-play #fbWrap .dot.in').length, cap:document.querySelector('.poscap')?.textContent.slice(0,60)}));
      ok(r.sp===k && r.on===String(k) && r.dots>=18,`[${w}] position ${k+1} selected, ${r.dots} lit dots`);
    }
    await p.click('[data-act="spos"][data-v="all"]'); ok(await q(()=>BPGW.S.scalePos===null && document.querySelectorAll('#tab-play #fbWrap .dot.in').length===0),`[${w}] All restores whole neck`);
    await p.click('[data-act="spos"][data-v="2"]'); await p.click('[data-act="labels"][data-v="fingers"]');
    ok(await q(()=>[...document.querySelectorAll('#tab-play #fbWrap .dot.in text')].every(t=>/^[1-4o]$/.test(t.textContent))),`[${w}] finger labels shown`);
    await p.click('[data-act="playScale"]');
    // chord mode from diatonic
    await p.click('[data-act="dia"][data-deg="4"]');
    ok(await q(()=>BPGW.S.mode==='chord' && document.querySelectorAll('#tab-play [data-act="cpos"]').length>=6),`[${w}] diatonic chord shows chord positions`);
    ok(await oneLine('#tab-play .posrow [data-act="cpos"]'),`[${w}] chord buttons on one line (play tab)`);
    // chord tab: every quality
    await p.evaluate(()=>BPGW.setTab('chord'));
    const qs=await q(()=>[...document.querySelectorAll('[data-act="cq"]')].map(x=>x.dataset.q));
    ok(qs.length===51,`[${w}] ${qs.length} qualities in grid`);
    let fewer=[];
    for (const id of qs){
      await p.evaluate(id=>document.querySelector(`[data-act="cq"][data-q="${id}"]`).click(),id);
      const r=await q(()=>({n:document.querySelectorAll('#tab-chord .posrow [data-act="cpos"]').length, svg:document.querySelectorAll('#tab-chord .cdiag svg').length, ov:document.documentElement.scrollWidth>document.documentElement.clientWidth+1}));
      if(r.n<4) fewer.push(id+':'+r.n);
      ok(r.svg===1 && !r.ov,`[${w}] quality ${id} renders diagram, no overflow ${JSON.stringify(r)}`);
    }
    console.log(`[${w}] qualities with <4 positions:`,fewer.join(' ')||'none');
    ok(await oneLine('#tab-chord .posrow [data-act="cpos"]'),`[${w}] chord buttons on one line`);
    // roots
    for (let pc=0;pc<12;pc++){ await p.evaluate(pc=>document.querySelector(`[data-act="croot"][data-pc="${pc}"]`).click(),pc); }
    await p.evaluate(()=>document.querySelector('#tab-chord [data-act="cq"][data-q="dom7"]').click());
    await p.click('#tab-chord .posrow [data-act="cpos"][data-v="3"]'); ok(await q(()=>BPGW.S.chordPos===3 && document.querySelectorAll('#tab-chord #fbWrap .dot.in').length>=3),`[${w}] chord position 4 picked`);
    await p.click('#tab-chord .pinfo [data-act="vstrum"]'); await p.click('#tab-chord [data-act="varp"]'); await p.click('#tab-chord [data-act="vblock"]');
    ok(await q(()=>document.querySelectorAll('#tab-chord .voic, #tab-chord .vc').length===0 && !/All positions at a glance/.test(document.getElementById('tab-chord').textContent)),`[${w}] thumbnail grid removed`);
    ok(await q(()=>!document.querySelector('[data-act="inv"]')),`[${w}] old inversion seg removed`);
    // ---- piano control (chord tab) ----
    await p.evaluate(()=>{BPGW.S.chordRoot='C';BPGW.S.chordQ='major';BPGW.S.pcPos=0;BPGW.S.chHand='B';BPGW.S.pOct=4;BPGW.render();});
    ok(await q(()=>document.querySelectorAll('#tab-chord .pcontrol').length===1),`[${w}] piano control panel on chord tab`);
    let c=await q(()=>({R:document.querySelectorAll('#tab-chord .pk .fd.R').length,L:document.querySelectorAll('#tab-chord .pk .fd.L').length,txt:document.querySelector('#tab-chord .pfing').textContent.replace(/\s+/g,' ')}));
    ok(c.R===3&&c.L===1&&/RH: C\(1\) E\(3\) G\(5\)/.test(c.txt)&&/LH: C\(5\)/.test(c.txt),`[${w}] C major Both: RH 1-3-5, LH root 5 :: ${c.txt}`);
    await p.evaluate(()=>document.querySelector('#tab-chord [data-act="phand"][data-v="S"]').click());
    c=await q(()=>({R:document.querySelectorAll('#tab-chord .pk .fd.R').length,L:document.querySelectorAll('#tab-chord .pk .fd.L').length,txt:document.querySelector('#tab-chord .pfing').textContent.replace(/\s+/g,' ')}));
    ok(c.R===3&&c.L===3&&/LH: C\(5\) E\(3\) G\(1\)/.test(c.txt),`[${w}] Both-same: LH 5-3-1 :: ${c.txt}`);
    await p.evaluate(()=>document.querySelector('#tab-chord [data-act="ppos"][data-v="1"]').click());
    c=await q(()=>document.querySelector('#tab-chord .pfing').textContent.replace(/\s+/g,' ')); ok(/RH: E\(1\) G\(2\) C\(5\)/.test(c),`[${w}] 1st inversion RH 1-2-5 :: ${c}`);
    await p.evaluate(()=>document.querySelector('#tab-chord [data-act="ppos"][data-v="2"]').click());
    c=await q(()=>document.querySelector('#tab-chord .pfing').textContent.replace(/\s+/g,' ')); ok(/RH: G\(1\) C\(3\) E\(5\)/.test(c)&&/LH: G\(5\) C\(2\) E\(1\)/.test(c),`[${w}] 2nd inversion RH 1-3-5, LH 5-2-1 :: ${c}`);
    for (const sel of ['#tab-chord [data-act="phand"]','#tab-chord [data-act="ppos"]','#tab-chord .pc-play .btn']) ok(await oneLine(sel),`[${w}] ${sel} on one line`);
    ok(await q(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`[${w}] no horizontal overflow with piano panel`);
    // octave stepper
    await p.evaluate(()=>document.querySelector('#tab-chord [data-act="poct"][data-v="1"]').click()); ok(await q(()=>BPGW.S.pOct===5),`[${w}] octave up`);
    await p.evaluate(()=>{BPGW.S.pOct=4;BPGW.render();});
    // follow-along
    await p.evaluate(()=>document.querySelector('#tab-chord [data-act="pplay"][data-v="arp"]').click()); await new Promise(r=>setTimeout(r,250));
    c=await q(()=>({now:document.querySelectorAll('#tab-chord .pk.now').length,live:document.querySelector('#tab-chord .nowline').classList.contains('live'),t:document.querySelector('#tab-chord .nowline').textContent}));
    ok(c.now>=1&&c.live&&/^Now: [LR]H \d/.test(c.t),`[${w}] arpeggio follow-along lights a key + finger :: ${c.t}`);
    await p.evaluate(()=>document.querySelector('#tab-chord [data-act="pplay"][data-v="block"]').click()); await new Promise(r=>setTimeout(r,250));
    ok(await q(()=>document.querySelectorAll('#tab-chord .pk.now').length===6),`[${w}] block chord lights all six keys (both same, 2nd inv)`);
    // match guitar
    await p.evaluate(()=>document.querySelector('#tab-chord [data-act="ppos"][data-v="g"]').click());
    c=await q(()=>({n:document.querySelectorAll('#tab-chord .pk .fd').length,g:BPGW.Theory.chordPositions(BPGW.Theory.buildChord('C','major'),BPGW.Theory.TUNINGS[0].strings)[BPGW.S.chordPos].midi.filter(m=>m!=null).length,dis:!!document.querySelector('#tab-chord .pcontrol .dis')}));
    ok(c.n===c.g&&c.dis,`[${w}] Match guitar lights exactly the guitar pitches (${c.n}/${c.g}), hand seg disabled`);
    // every quality: piano panel renders sensible dots
    for (const id of qs){
      await p.evaluate(id=>{BPGW.S.pcPos=0;BPGW.S.chHand='B';document.querySelector(`[data-act="cq"][data-q="${id}"]`).click();},id);
      const r=await q(()=>({n:document.querySelectorAll('#tab-chord .posrow [data-act="ppos"]').length,fd:document.querySelectorAll('#tab-chord .pk .fd').length,tones:BPGW.Theory.buildChord(BPGW.S.chordRoot,BPGW.S.chordQ).tones.length,ov:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,one:new Set([...document.querySelectorAll('#tab-chord .posrow [data-act="ppos"]')].map(x=>Math.round(x.getBoundingClientRect().top))).size===1}));
      ok(r.fd>=2&&r.n===Math.min(r.tones,5)+(r.tones>4?0:0)+0||r.n===(r.tones<=4?r.tones:4)+1,`[${w}] ${id}: piano positions ${r.n} for ${r.tones} tones, ${r.fd} fingered keys`);
      ok(!r.ov&&r.one,`[${w}] ${id}: piano rows one line, no overflow`);
    }
    // ---- piano control (play tab, scales) ----
    await p.evaluate(()=>{BPGW.S.rootPc=2;BPGW.S.pref='auto';BPGW.S.scale='dorian';BPGW.S.mode='scale';BPGW.S.psPos=0;BPGW.S.scHand='R';BPGW.S.pOcts=1;BPGW.S.scalePos=null;BPGW.setTab('play',{keepMode:true});});
    ok(await q(()=>document.querySelectorAll('#tab-play .pcontrol').length===1),`[${w}] piano control panel on play tab`);
    c=await q(()=>({fd:document.querySelectorAll('#tab-play .pk .fd.R').length,txt:document.querySelector('#tab-play .pfing').textContent.replace(/\s+/g,' ')}));
    ok(c.fd===8&&/RH: D\(2\) E\(3\) F\(1\) G\(2\) A\(3\) B\(4\) C\(1\) D\(2\)/.test(c.txt),`[${w}] D Dorian RH fingering :: ${c.txt}`);
    for (const k of [0,1,2,3,4,5,6]) { await p.evaluate(k=>document.querySelector(`#tab-play [data-act="ppos"][data-v="${k}"]`).click(),k); ok(await q(k=>document.querySelectorAll('#tab-play .pk .fd.R').length===8 && BPGW.S.psPos===k,k),`[${w}] scale position ${k+1} lights 8 keys`); }
    for (const sel of ['#tab-play [data-act="phand"]','#tab-play [data-act="ppos"]','#tab-play .pc-play .btn','#tab-play [data-act="poctn"]']) ok(await oneLine(sel),`[${w}] ${sel} on one line`);
    await p.evaluate(()=>document.querySelector('#tab-play [data-act="poctn"][data-v="2"]').click()); ok(await q(()=>document.querySelectorAll('#tab-play .pk .fd.R').length===15),`[${w}] two octaves = 15 keys`);
    await p.evaluate(()=>document.querySelector('#tab-play [data-act="phand"][data-v="B"]').click()); ok(await q(()=>document.querySelectorAll('#tab-play .pk .fd.L').length>=14),`[${w}] hands together lights LH too`);
    await p.evaluate(()=>document.querySelector('#tab-play [data-act="pplay"][data-v="scale"]').click()); await new Promise(r=>setTimeout(r,500));
    ok(await q(()=>document.querySelectorAll('#tab-play .pk.now').length>=1 && /^Now: /.test(document.querySelector('#tab-play .nowline').textContent)),`[${w}] scale follow-along`);
    await p.evaluate(()=>document.querySelector('#tab-play [data-act="spos"][data-v="1"]').click());
    await p.evaluate(()=>document.querySelector('#tab-play [data-act="ppos"][data-v="g"]').click());
    ok(await q(()=>document.querySelectorAll('#tab-play .pk .fd').length>=10),`[${w}] scale Match guitar lights the guitar box on the keys`);
    // every scale x every root: renders, fingered
    const sids=await q(()=>BPGW.Theory.SCALE_ORDER);
    for (const sid of sids) for (let pc=0;pc<12;pc++){ await p.evaluate((sid,pc)=>{BPGW.S.scale=sid;BPGW.S.rootPc=pc;BPGW.S.scalePos=null;BPGW.S.psPos=0;BPGW.S.scHand='R';BPGW.S.pOcts=1;BPGW.render();},sid,pc);
      const r=await q(()=>document.querySelectorAll('#tab-play .pk .fd.R').length); if(!(r>=5)) ok(false,`[${w}] ${sid}/${pc} fingered keys ${r}`); else checks++; }
    await p.evaluate(()=>{BPGW.S.scale='major';BPGW.S.rootPc=0;BPGW.render();});
    ok(await q(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`[${w}] no overflow after scales`);
    // tunings
    for (const tn of ['dropD','dadgad','openG','bass4','seven']) {
      const has=await q(tn=>BPGW.Theory.TUNINGS.some(t=>t.id===tn),tn); if(!has) continue;
      await p.evaluate(tn=>{BPGW.S.tuning=tn; BPGW.render();},tn);
      ok(await q(()=>document.querySelectorAll("#tab-chord .cdiag svg").length+document.querySelectorAll('.posblock .hint').length>0),`[${w}] tuning ${tn} renders`);
    }
    await p.close();
  }
  console.log(errs.length?errs.join('\n'):'no console errors'); console.log(`smoke: ${checks-bad}/${checks} ok`);
  await b.close();
})();
