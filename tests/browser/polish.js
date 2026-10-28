// Slice 4: PWA (manifest, icons, service worker, offline) + accessibility behaviour.
const puppeteer=require('puppeteer-core');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const BASE=process.env.BPGW_BASE||'http://localhost:8123/';
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
  let checks=0,bad=0; const ok=(c,l)=>{checks++; if(!c){bad++;console.log('  ✗',l);}};
  const errs=[];
  const p=await b.newPage(); await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  const q=(f,a)=>p.evaluate(f,a);
  await p.goto(BASE+'#play',{waitUntil:'load'});
  // ---------- manifest + icons ----------
  const man=await q(async()=>{const l=document.querySelector('link[rel=manifest]'); const r=await fetch(l.href); return {href:l.getAttribute('href'),ok:r.ok,ct:r.headers.get('content-type'),j:await r.json()}});
  ok(man.ok && man.href==='manifest.webmanifest','manifest linked and fetchable');
  const m=man.j;
  ok(m.name==='Big Pear Guitar Works' && m.short_name && m.short_name.length<=12,'manifest: name + short_name ≤12 chars');
  ok(m.display==='standalone' && m.start_url==='./' && m.scope==='./' && m.id,'manifest: standalone, start_url, scope, id');
  ok(/^#[0-9a-f]{6}$/i.test(m.theme_color) && /^#[0-9a-f]{6}$/i.test(m.background_color),'manifest: theme + background colours');
  ok(m.icons.some(i=>i.sizes==='192x192'&&i.purpose==='any') && m.icons.some(i=>i.sizes==='512x512'&&i.purpose==='any') && m.icons.some(i=>i.purpose==='maskable'),'manifest: 192, 512 and a maskable icon');
  const sizes=await q(async(icons)=>{const out=[];for(const i of icons){if(!/png$/.test(i.src))continue;const im=new Image();im.src=i.src;await im.decode();out.push([i.src,i.sizes,im.naturalWidth+'x'+im.naturalHeight]);}return out;},m.icons);
  ok(sizes.length===3 && sizes.every(s=>s[1]===s[2]),'icon PNGs decode at their declared sizes ('+sizes.map(s=>s[2]).join(', ')+')');
  ok(await q(()=>!!document.querySelector('link[rel=apple-touch-icon]') && document.querySelector('meta[name=theme-color]').content==='#f2f2f7' && !!document.querySelector('meta[name=apple-mobile-web-app-capable]')),'apple-touch-icon, theme-color, iOS web-app meta present');
  ok(await q(async()=>{const r=await fetch('icons/apple-touch-icon.png');const bl=await createImageBitmap(await r.blob());return bl.width===180}),'apple-touch-icon is 180×180');
  // shortcuts hashes resolve to real tabs
  ok(m.shortcuts.every(s=>/^\.\/#(lessons|song)$/.test(s.url)),'manifest shortcuts point at real tabs');
  // ---------- service worker ----------
  const sw=await q(async()=>{const reg=await navigator.serviceWorker.ready; const keys=await caches.keys(); const c=await caches.open(keys.find(k=>/^bpgw-v/.test(k))); const urls=(await c.keys()).map(r=>new URL(r.url).pathname); return {state:reg.active.state,scope:reg.scope,keys,urls}});
  ok(sw.state==='activated','service worker activated');
  ok(sw.urls.some(u=>/\/index\.html$/.test(u)) && sw.urls.some(u=>/\/manifest\.webmanifest$/.test(u)) && sw.urls.some(u=>/icon-512\.png/.test(u)),'core files precached: '+sw.urls.length+' entries');
  await p.waitForFunction(()=>/offline/i.test((document.getElementById("pwaStatus")||{}).textContent||""),{timeout:8000}).catch(()=>{});
  ok(await q(()=>/offline/i.test(document.getElementById('pwaStatus').textContent) && !document.getElementById('pwa').hidden),'footer shows "Saved for offline use ✓"');
  // controlled page needed for offline fetch interception -> reload once so SW controls it
  await p.reload({waitUntil:'load'}); await sleep(300);
  ok(await q(()=>!!navigator.serviceWorker.controller),'page is controlled by the service worker after reload');
  // ---------- offline ----------
  await p.setOfflineMode(true);
  await p.reload({waitUntil:'load'}); await sleep(500);
  ok(await q(()=>typeof BPGW!=='undefined' && document.querySelectorAll('#tab-play .pk').length===88),'OFFLINE: reload serves the full app (88-key piano rendered)');
  await q(()=>BPGW.setTab('lessons')); await sleep(150);
  ok(await q(()=>document.querySelectorAll('#tab-lessons .lcard').length===7),'OFFLINE: lessons tab works');
  await q(()=>BPGW.setTab('song')); await sleep(250);
  ok(await q(()=>document.querySelectorAll('#tab-song .sec').length>=2),'OFFLINE: song generator works');
  const p2=await b.newPage(); await p2.goto(BASE+'#chord',{waitUntil:'load'}); await sleep(400);
  ok(await p2.evaluate(()=>typeof BPGW!=='undefined' && BPGW.S.tab==='chord'),'OFFLINE: a brand-new tab opens a deep link');
  const p3=await b.newPage(); await p3.goto(BASE+'icons/icon-192.png').catch(()=>{}); 
  ok(await p3.evaluate(()=>document.images.length===1 && document.images[0].naturalWidth===192),'OFFLINE: cached icon served');
  await p3.close(); await p2.close();
  await p.setOfflineMode(false);
  // ---------- update + cleanup of old caches ----------
  const cl=await q(async()=>{await caches.open('bpgw-v0.old'); await caches.open('other-app'); const reg=await navigator.serviceWorker.ready; await reg.unregister(); return (await caches.keys())});
  ok(cl.includes('bpgw-v0.old'),'(setup) stale cache created');
  await p.reload({waitUntil:'load'}); await sleep(1500);
  const after=await q(async()=>{await navigator.serviceWorker.ready; return await caches.keys()});
  ok(!after.includes('bpgw-v0.old') && after.includes('other-app') && after.some(k=>/^bpgw-v/.test(k)),'new worker deletes stale bpgw-* caches but leaves other caches alone ('+after.join(', ')+')');
  // ---------- install prompt UI ----------
  await q(()=>{const e=new Event('beforeinstallprompt');e.prompt=()=>{window.__prompted=1};e.userChoice=Promise.resolve({outcome:'accepted'});window.dispatchEvent(e)});
  ok(await q(()=>!document.getElementById('pwaInstall').hidden),'beforeinstallprompt shows the Install app button');
  await q(()=>document.getElementById('pwaInstall').click()); await sleep(100);
  ok(await q(()=>window.__prompted===1 && document.getElementById('pwaInstall').hidden),'Install button triggers the browser prompt, then hides');
  // ---------- skip link, landmarks, live region ----------
  ok(await q(()=>!!document.querySelector('a.skip[href="#main"]') && !!document.querySelector('header h1') && !!document.querySelector('main#main') && !!document.querySelector('nav.dock[aria-label]') && !!document.querySelector('footer')),'landmarks: skip link, header, main, nav, footer');
  await p.keyboard.press('Tab');
  ok(await q(()=>document.activeElement.classList.contains('skip') && document.activeElement.getBoundingClientRect().top>=0),'first Tab stop is the skip link and it becomes visible');
  await p.keyboard.press('Enter'); await sleep(100);
  ok(await q(()=>location.hash==='#main'||document.activeElement.id==='main'),'skip link activates (moves to main)');
  await q(()=>history.replaceState(null,'','#play')); 
  await q(()=>{BPGW.setTab('math')}); await sleep(200);
  ok(await q(()=>/math tab/i.test(document.getElementById('live').textContent)),'tab change is announced in the live region');
  ok(await q(()=>document.querySelector('#dock [aria-current="page"]').dataset.v==='math' && document.querySelectorAll('#dock [aria-current]').length===1),'dock marks the current tab with aria-current');
  ok(await q(()=>document.getElementById('knob-tempo').getAttribute('aria-label')==='Tempo' && document.getElementById('knob-vol').getAttribute('aria-label')==='Volume' && /BPM/.test(document.getElementById('knob-tempo').getAttribute('aria-valuetext'))),'knobs have names and readable values');
  // ---------- piano by keyboard ----------
  await q(()=>BPGW.setTab('play')); await sleep(200);
  ok(await q(()=>{const w=document.getElementById('pianoWrap');return w.tabIndex===0 && w.getAttribute('role')==='region' && w.querySelectorAll('.pk[role=button][aria-label]').length===88}),'piano: focusable region, 88 labelled keys');
  await q(()=>document.getElementById('pianoWrap').focus());
  await p.keyboard.press('ArrowRight'); await sleep(50);
  const f1=await q(()=>({m:document.activeElement.dataset.midi,l:document.activeElement.getAttribute('aria-label')}));
  ok(f1.m && /^[A-G]/.test(f1.l),'piano: ArrowRight from the region focuses a key ('+f1.l+')');
  const m0=+f1.m;
  await p.keyboard.press('ArrowRight'); ok(await q(m=>+document.activeElement.dataset.midi===m+1,m0),'piano: ArrowRight = +1 semitone');
  await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowLeft'); ok(await q(m=>+document.activeElement.dataset.midi===m-1,m0),'piano: ArrowLeft = −1 semitone');
  await p.keyboard.down('Shift'); await p.keyboard.press('ArrowRight'); await p.keyboard.up('Shift'); ok(await q(m=>+document.activeElement.dataset.midi===m+11,m0),'piano: Shift+Arrow = octave');
  await p.keyboard.press('Home'); ok(await q(()=>+document.activeElement.dataset.midi===21),'piano: Home → A0'); await p.keyboard.press('End'); ok(await q(()=>+document.activeElement.dataset.midi===108),'piano: End → C8');
  await p.keyboard.press('ArrowRight'); ok(await q(()=>+document.activeElement.dataset.midi===108),'piano: stops at the top key');
  // Enter plays: use practice so we can observe
  await q(()=>BPGW.setTab('lessons')); await sleep(150);
  await q(()=>document.querySelector('[data-act="lopen"][data-id="fingers"]').click()); await sleep(200);
  await q(()=>document.querySelector('#tab-lessons [data-act="prtog"]').click()); await sleep(150);
  const tgt=await q(()=>+document.querySelector('#tab-lessons .pk.target').dataset.midi);
  await q(m=>document.querySelector('#tab-lessons .pk[data-midi="'+m+'"]').focus(),tgt);
  await p.keyboard.press('Enter'); await sleep(150);
  ok(await q(()=>document.querySelector('#tab-lessons .prstep').textContent.replace(/\s+/g,' ').includes('2')),'piano: Enter on the target key advances the practice');
  await p.keyboard.press('Space'); await sleep(100);
  ok(await q(()=>document.activeElement.classList.contains('pk')),'piano: focus stays on the key after playing (no re-render)');
  await q(()=>BPGW.setTab('play'));
  // ---------- fretboard by keyboard ----------
  await sleep(200);
  ok(await q(()=>{const w=document.getElementById('fbWrap');return w.tabIndex===0 && w.querySelectorAll('.dot[role=button][aria-label]').length>10}),'fretboard: focusable region, labelled notes');
  await q(()=>document.getElementById('fbWrap').focus()); await p.keyboard.press('ArrowRight'); await sleep(50);
  const d0=await q(()=>({si:+document.activeElement.dataset.si,f:+document.activeElement.dataset.f,l:document.activeElement.getAttribute('aria-label')}));
  ok(d0.l && /string \d, (open|fret \d+)$/.test(d0.l),'fretboard: label reads note, string and fret ('+d0.l+')');
  await p.keyboard.press('ArrowRight'); const d1=await q(()=>({si:+document.activeElement.dataset.si,f:+document.activeElement.dataset.f}));
  ok(d1.si===d0.si && d1.f>d0.f,'fretboard: ArrowRight moves to a higher fret on the same string');
  await p.keyboard.press('ArrowUp'); const d2=await q(()=>({si:+document.activeElement.dataset.si}));
  ok(d2.si>d1.si,'fretboard: ArrowUp moves to a higher string');
  await p.keyboard.press('ArrowDown'); ok(await q(s=>+document.activeElement.dataset.si===s,d1.si),'fretboard: ArrowDown comes back');
  await p.keyboard.press('Enter'); await sleep(100);
  ok(await q(()=>!!document.activeElement.closest('#fbWrap')),'fretboard: Enter plays and keeps focus');
  // ---------- focus survives a re-render ----------
  await q(()=>BPGW.setTab('song')); await sleep(250);
  await q(()=>document.querySelector('select[data-chg="bars"]')&&0);
  await q(()=>document.querySelector('[data-act="sgen"],[data-act="songgen"],#tab-song button.btn').focus());
  const keyBefore=await q(()=>document.activeElement.outerHTML.slice(0,80));
  await q(()=>BPGW.render()); await sleep(50);
  ok(await q(k=>document.activeElement.outerHTML.slice(0,80)===k,keyBefore),'re-render restores keyboard focus to the same control');
  await q(()=>{const s=document.querySelector('#tab-song select');s.focus();});
  const selId=await q(()=>document.activeElement.dataset.chg);
  await p.keyboard.press('ArrowDown'); await sleep(200);
  ok(await q(c=>document.activeElement.dataset.chg===c && document.activeElement.tagName==='SELECT',selId),'changing a select keeps focus on it after the re-render');
  // ---------- names on form controls ----------
  ok(await q(()=>[...document.querySelectorAll('select')].every(s=>s.getAttribute('aria-label')||s.id)),'every <select> has a name');
  // ---------- contrast of the colours we changed ----------
  // ---------- focus ring ----------
  await p.keyboard.press('Tab'); await sleep(50);
  const ring=await q(()=>{const cs=getComputedStyle(document.activeElement);return cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>=2||cs.boxShadow!=='none'});
  ok(ring,'keyboard focus ring visible on the focused control');
  // ---------- reduced motion ----------
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p.reload({waitUntil:'load'}); await sleep(300);
  ok(await q(()=>{const e=document.querySelector('.power.on .led');const cs=getComputedStyle(e);return parseFloat(cs.animationDuration)<0.01||cs.animationName==='none'}),'reduced motion: LED glow animation disabled');
  ok(await q(()=>{const k=document.createElement('div');k.className='pk good';document.body.appendChild(k);const d=parseFloat(getComputedStyle(k).animationDuration);k.remove();return d<0.01}),'reduced motion: practice flash animation shortened to ~0');
  ok(await q(()=>SMOOTH==='auto'),'reduced motion: programmatic scrolling is instant');
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);
  // ---------- phone layout still fits ----------
  ok(await q(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'no horizontal overflow at 390px');
  ok(errs.length===0,'no console errors '+errs.slice(0,3).join(' | '));
  console.log(`polish.js: ${checks-bad}/${checks} passed`);
  await b.close(); process.exit(bad?1:0);
})();
