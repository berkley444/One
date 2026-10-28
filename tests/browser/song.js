const puppeteer=require('puppeteer-core');
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  const errs=[]; let checks=0,bad=0; const ok=(c,l)=>{checks++; if(!c){bad++;console.log('  ✗',l);}};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  for (const [w,mobile] of [[390,true],[1280,false]]) {
    const p=await b.newPage(); await p.setViewport({width:w,height:900,deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});
    p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
    await p.goto((process.env.BPGW_URL||'file:///workspace/One_repo/index.html')+'#song&root=G&scale=major&tuning=standard&meter=4/4&tempo=220&ss=5&sf=full&sst=smart');
    await p.evaluate(()=>localStorage.clear()); await p.reload({waitUntil:'load'}); await sleep(400); await p.evaluate(()=>{BPGW.S.tempo=220;BPGW.render();});
    const q=(f,a)=>p.evaluate(f,a); const T=`[${w}]`;
    ok(await q(()=>document.querySelectorAll('#tab-song .sec').length===4),T+' 4 unique sections (intro verse chorus bridge)');
    ok(await q(()=>document.querySelectorAll('#tab-song .fchip').length===7),T+' 7 form chips');
    ok(await q(()=>document.querySelectorAll('#tab-song pre.tabtxt').length===4&&[...document.querySelectorAll('#tab-song pre.tabtxt')].every(e=>/e\|/.test(e.textContent))),T+' tab per section');
    ok(await q(()=>document.querySelectorAll('#tab-song .sbar').length===14),T+' 14 bar cards');
    ok(await q(()=>document.querySelectorAll('#tab-song .sgrid .sl').length===4*8),T+' strum grid 8 slots x 4 sections');
    ok(await q(()=>document.querySelectorAll('#tab-song .pfc').length>=4),T+' piano fingering cards');
    ok(await q(()=>[...document.querySelectorAll('#tab-song .pfc .ln')].every(e=>/\(\d\)/.test(e.textContent))),T+' every fingering line has finger numbers');
    ok(await q(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),T+' no page overflow');
    ok(await q(()=>!!document.querySelector('#tab-song [data-act="songplay"]')),T+' progression sketcher still there');
    ok(await q(()=>location.hash.includes('ss=5')&&location.hash.includes('sf=full')),T+' hash carries song seed/form');
    // play
    await q(()=>document.querySelector('#tab-song [data-act="songgo"]').click()); await sleep(900);
    ok(await q(()=>BPGW.SongPlay.on),T+' playing'); 
    ok(await q(()=>document.querySelectorAll('#tab-song .sbar.now').length===1&&document.querySelectorAll('#tab-song .fchip.now').length===1),T+' current bar + chip lit');
    ok(await q(()=>/Intro · bar \d\/2/.test(document.querySelector('#songnow').textContent)),T+' now-playing text: '+await q(()=>document.querySelector('#songnow').textContent));
    ok(await q(()=>document.querySelector('[data-act="songgo"]').textContent==='■ Stop'),T+' button shows Stop');
    // 240 bpm 4/4 -> bar = 1s; wait to reach verse (after 2s)
    await sleep(2200);
    ok(await q(()=>/Verse/.test(document.querySelector('#songnow').textContent)&&document.querySelector('.fchip.now').dataset.o==='1'),T+' advanced to verse: '+await q(()=>document.querySelector('#songnow').textContent));
    // survives a re-render
    await q(()=>BPGW.render()); ok(await q(()=>document.querySelectorAll('#tab-song .sbar.now').length===1),T+' highlight survives re-render');
    // stop is immediate and silences the bus
    await q(()=>document.querySelector('[data-act="songgo"]').click()); await sleep(150);
    ok(await q(()=>!BPGW.SongPlay.on&&BPGW.SongPlay.bus===null&&!document.querySelector('.sbar.now,.fchip.now')),T+' stop clears everything');
    ok(await q(()=>document.querySelector('[data-act="songgo"]').textContent==='▶ Play song'),T+' button back to Play');
    // one section play ends by itself
    await q(()=>document.querySelector('[data-act="secplay"][data-sec="intro"]').click()); await sleep(300);
    ok(await q(()=>BPGW.SongPlay.on&&BPGW.SongPlay.only==='intro'&&document.querySelector('[data-act="secplay"][data-sec="intro"]').textContent==='■ Stop'),T+' section play');
    await sleep(4200); ok(await q(()=>!BPGW.SongPlay.on),T+' section play ends by itself');
    // starting the progression player stops the song and vice versa
    await q(()=>document.querySelector('[data-act="songgo"]').click()); await sleep(200);
    await q(()=>document.querySelector('[data-act="songplay"]').click()); await sleep(200);
    ok(await q(()=>!BPGW.SongPlay.on&&BPGW.Player.chordsOn),T+' progression player takes over');
    await q(()=>document.querySelector('[data-act="songgo"]').click()); await sleep(200);
    ok(await q(()=>BPGW.SongPlay.on&&!BPGW.Player.chordsOn),T+' song takes over'); 
    // changing the key mid-play stops it
    await q(()=>{location.hash='#song&root=A&scale=minorPent&tuning=standard&meter=4/4&tempo=220&ss=5&sf=full&sst=smart';}); await sleep(900);
    ok(await q(()=>!BPGW.SongPlay.on),T+' key change stops the song');
    // new song
    const before=await q(()=>BPGW.S.songSeed); await q(()=>document.querySelector('[data-act="songnew"]').click());
    ok(await q(b=>BPGW.S.songSeed!==b&&location.hash.includes('ss='+BPGW.S.songSeed),before),T+' new song changes seed + hash');
    // form short
    await q(()=>{const s=document.querySelector('[data-chg="songform"]'); s.value='short'; s.dispatchEvent(new Event('change',{bubbles:true}));});
    ok(await q(()=>document.querySelectorAll('#tab-song .sec').length===2&&document.querySelectorAll('#tab-song .fchip').length===4),T+' short form');
    // sweep: every meter, a few tunings/scales render with no errors, correct slot counts
    const slots={'2/4':4,'3/4':6,'4/4':8,'5/4':10,'6/8':6,'7/8':7,'9/8':9,'12/8':12};
    for (const [mt,n] of Object.entries(slots)) for (const [tn,sc,rt] of [['standard','major','C'],['bass','minorPent','E'],['seven','dorian','B♭'],['dadgad','blues','D']]) {
      await q((h)=>{location.hash=h;},`#song&root=${encodeURIComponent(rt)}&scale=${sc}&tuning=${tn}&meter=${mt}&tempo=120&ss=3&sf=short&sst=pop`); await sleep(60);
      const r=await q(n=>({slots:document.querySelectorAll('#tab-song .sec')[0].querySelectorAll('.sl').length,tabs:document.querySelectorAll('#tab-song pre.tabtxt').length,ov:document.documentElement.scrollWidth-document.documentElement.clientWidth}),n);
      ok(r.slots===n&&r.tabs===2,`${T} ${mt} ${tn} ${sc}: ${JSON.stringify(r)}`);
      if(w===1280) ok(r.ov<=1,`${T} ${mt} ${tn} no overflow`);
    }
    // play a 12/8 section for real in a weird tuning, no errors
    await q(()=>{location.hash='#song&root=F%E2%99%AF&scale=lydian&tuning=bass&meter=12/8&tempo=90&ss=9&sf=full&sst=smart';}); await sleep(100);
    await q(()=>document.querySelector('[data-act="songgo"]').click()); await sleep(1500); ok(await q(()=>BPGW.SongPlay.on&&document.querySelectorAll('.sbar.now').length===1),T+' 12/8 bass lydian plays'); await q(()=>BPGW.SongPlay.stop());
    // practice link
    await q(()=>{location.hash='#song&root=C&scale=major&tuning=standard&meter=4/4&tempo=100&ss=1&sf=full&sst=smart';}); await sleep(100);
    const nm=await q(()=>BPGW.currentSong().sections.verse.chords[0].name);
    await q(()=>document.querySelector('#tab-song [data-act="songprac"]').click()); await sleep(200);
    ok(await q(()=>BPGW.S.tab==='chord'&&BPGW.UI.pr.on&&BPGW.S.chordRoot+'' !== ''),T+' Practice link goes to chord tab with practice on ('+nm+')');
    ok(await q(n=>document.querySelector('#tab-chord').textContent.includes(n.replace('♭','♭')),nm),T+' chord tab shows '+nm);
    await q(()=>BPGW.prToggle(false));
    await p.close();
  }
  console.log('console errors:',errs.length?errs:'none'); console.log(`song: ${checks-bad}/${checks} ok`); await b.close(); process.exit(bad||errs.length?1:0);
})();
