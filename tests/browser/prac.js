const puppeteer=require('puppeteer-core');
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  const errs=[]; let checks=0,bad=0; const ok=(c,l)=>{checks++; if(!c){bad++;console.log('  ✗',l);}};
  for (const [w,mobile] of [[390,true],[1280,false]]) {
    const p=await b.newPage(); await p.setViewport({width:w,height:900,deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});
    p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
    // fake Web MIDI
    await p.evaluateOnNewDocument(()=>{
      window.__ins=[]; window.__fake=true;
      const inp={id:'x1',name:'Williams Allegro III',state:'connected',onmidimessage:null};
      const access={inputs:new Map([['x1',inp]]),onstatechange:null};
      window.__midi={inp,access,send:(...b)=>inp.onmidimessage&&inp.onmidimessage({data:new Uint8Array(b)})};
      if(location.hash.includes('nomidi')) { delete navigator.requestMIDIAccess; try{Object.defineProperty(Navigator.prototype,'requestMIDIAccess',{value:undefined,configurable:true})}catch(e){} }
      else navigator.requestMIDIAccess=()=>Promise.resolve(access);
    });
    await p.goto((process.env.BPGW_URL||'file:///workspace/One_repo/index.html')+'#chord&root=C&scale=major&chord=C&q=major&cp=0&pp=0&hd=R&po=4&mode=chord');
    await p.evaluate(()=>localStorage.clear()); await p.reload({waitUntil:'load'}); await new Promise(r=>setTimeout(r,400));
    const q=(f,a)=>p.evaluate(f,a);
    ok(await q(()=>document.querySelectorAll('#tab-chord .pcontrol [data-act="prtog"]').length===1&&document.querySelectorAll('#tab-chord [data-act="midi"]').length===1),`[${w}] practice + midi buttons`);
    const oneLine=async sel=>q(sel=>{const bs=[...document.querySelectorAll(sel)]; return bs.length>0&&new Set(bs.map(x=>Math.round(x.getBoundingClientRect().top))).size===1;},sel);
    ok(await oneLine('#tab-chord .pc-prac .btn'),`[${w}] practice buttons on one line`);
    ok(await q(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`[${w}] no overflow`);
    // MIDI connect
    await q(()=>document.querySelector('#tab-chord [data-act="midi"]').click()); await new Promise(r=>setTimeout(r,200));
    ok(await q(()=>/Connected: Williams Allegro III/.test(document.querySelector('#tab-chord .midistat').textContent)),`[${w}] MIDI connected message`);
    // incoming note lights purple, no practice
    await q(()=>__midi.send(0x90,64,90)); ok(await q(()=>document.querySelector('#tab-chord .pk[data-midi="64"]').classList.contains('inp')),`[${w}] incoming MIDI note lights key`);
    await q(()=>__midi.send(0x80,64,0)); ok(await q(()=>!document.querySelector('#tab-chord .pk[data-midi="64"]').classList.contains('inp')),`[${w}] note off clears`);
    // practice: C major RH
    await q(()=>document.querySelector('#tab-chord [data-act="prtog"]').click());
    ok(await q(()=>!document.querySelector('#tab-chord #prac').hidden && document.querySelectorAll('#tab-chord .pk.target').length===3),`[${w}] practice shows 3 target keys`);
    ok(await q(()=>/RH 1.*C.*RH 3.*E.*RH 5.*G/.test(document.querySelector('#tab-chord .prtarget').textContent.replace(/\s+/g,' '))),`[${w}] target line shows fingers`);
    await q(()=>__midi.send(0x90,62,90)); ok(await q(()=>/isn’t it/.test(document.querySelector('#tab-chord .prres').textContent) && document.querySelector('#tab-chord .pk[data-midi="62"]').classList.contains('bad')),`[${w}] wrong note -> red`);
    await q(()=>__midi.send(0x80,62,0));
    await q(()=>{__midi.send(0x90,72,90);__midi.send(0x90,52,90);}); // C5 + E3 any octave
    ok(await q(()=>document.querySelectorAll('#tab-chord .pk.hit').length===2),`[${w}] held correct keys show green`);
    await q(()=>__midi.send(0x90,79,90)); // G5
    ok(await q(()=>/Finished/.test(document.querySelector('#tab-chord .prres').textContent)&&/3 of 3/.test(document.querySelector('#tab-chord .prscore').textContent)&&/1<\/b> wrong|>1</.test(document.querySelector('#tab-chord .prscore').innerHTML)),`[${w}] chord done, score shown :: `+await q(()=>document.querySelector('#tab-chord .prscore').textContent));
    await q(()=>{[72,52,79,62].forEach(m=>__midi.send(0x80,m,0));});
    await q(()=>document.querySelector('#tab-chord [data-act="prreset"]').click()); ok(await q(()=>/Step 1 of 1/.test(document.querySelector('#tab-chord .prstep').textContent)),`[${w}] start over`);
    // tap input: tap C, E, G within window
    for (const m of [60,64,67]) await q(m=>document.querySelector(`#tab-chord .pk[data-midi="${m}"]`).click(),m);
    ok(await q(()=>/Finished/.test(document.querySelector('#tab-chord .prres').textContent)),`[${w}] tapping the three keys completes the chord`);
    // keyboard
    await q(()=>document.querySelector('#tab-chord [data-act="prreset"]').click());
    for (const k of ['a','d','g']) await p.keyboard.down(k);
    ok(await q(()=>/Finished/.test(document.querySelector('#tab-chord .prres').textContent)),`[${w}] computer keys A D G = C E G`);
    for (const k of ['a','d','g']) await p.keyboard.up(k);
    // exact octave
    await q(()=>document.querySelector('#tab-chord [data-act="prexact"]').click());
    await q(()=>{__midi.send(0x90,72,90);}); ok(await q(()=>/wrong octave/.test(document.querySelector('#tab-chord .prres').textContent)),`[${w}] exact octave says wrong octave`);
    await q(()=>__midi.send(0x80,72,0)); await q(()=>document.querySelector('#tab-chord [data-act="prexact"]').click());
    // scale practice on play tab
    await p.goto((process.env.BPGW_URL||'file:///workspace/One_repo/index.html')+'#play&root=D&scale=dorian&mode=scale&pp=0&hd=R&po=4&pn=1&x=1'); await p.reload({waitUntil:'load'}); await new Promise(r=>setTimeout(r,300));
    ok(await q(()=>document.querySelectorAll('#tab-play [data-act="prtog"]').length===1),`[${w}] practice on play tab`);
    ok(await oneLine('#tab-play .pc-prac .btn'),`[${w}] play-tab practice buttons on one line`);
    await q(()=>document.querySelector('#tab-play [data-act="prtog"]').click());
    const seq=[62,64,65,67,69,71,72,74,72,71,69,67,65,64,62];
    for (const m of seq){ await q(m=>{__midi.send(0x90,m,80);__midi.send(0x80,m,0);},m); }
    ok(await q(()=>/Finished/.test(document.querySelector('#tab-play .prres').textContent)&&/perfect/.test(document.querySelector('#tab-play .prscore').textContent)),`[${w}] D Dorian practice finishes perfect`);
    ok(await q(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),`[${w}] no overflow in practice`);
    // unsupported browser message
    const p2=await b.newPage(); await p2.setViewport({width:w,height:900,isMobile:mobile});
    await p2.evaluateOnNewDocument(()=>{ Object.defineProperty(navigator,'requestMIDIAccess',{value:undefined,configurable:true}); });
    p2.on('pageerror',e=>errs.push('PAGEERR2 '+e.message));
    await p2.goto((process.env.BPGW_URL||'file:///workspace/One_repo/index.html')+'#chord&mode=chord'); await p2.evaluate(()=>localStorage.clear()); await p2.reload();
    await p2.evaluate(()=>document.querySelector('#tab-chord [data-act="midi"]').click());
    ok(await p2.evaluate(()=>/can’t talk to MIDI|isn’t available/.test(document.querySelector('#tab-chord .midistat').textContent)),`[${w}] unsupported message`);
    await p.close(); await p2.close();
  }
  console.log(errs.length?errs.join('\n'):'no console errors'); console.log(`prac: ${checks-bad}/${checks} ok`);
  await b.close();
})();
