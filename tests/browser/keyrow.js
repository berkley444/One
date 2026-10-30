/* The combined key row: the old Notes / Formula / Key signature / Step pattern cards are gone; the 12 note buttons now carry that information.
   In scale mode: in-scale notes are colour-coded, spelled for the key (E♭ not D♯) and labelled with their interval, out-of-scale notes are muted,
   W/H step marks sit under the notes, the key signature is a short caption beside the heading. In chord mode the chord tones are coded by role.
   The position buttons sit on their own row directly below. 13 themes x 390 / 1280: contrast, overflow, distinct colours.
   Run:  python3 -m http.server 8123   then   BPGW_URL=http://localhost:8123/index.html NODE_PATH=/path/to/puppeteer-core/.. node tests/browser/keyrow.js */
const puppeteer = require('puppeteer-core');
const URL = process.env.BPGW_URL || 'file:///workspace/One_repo/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const THEMES = ['silver', 'console', 'pedal', 'tube', 'minimal', 'navy-light', 'minimal-dark', 'synth', 'wood', 'sunburst', 'surf', 'rosewood', 'sheet'];
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  let checks = 0, bad = 0; const errs = [];
  const ok = (c, l) => { checks++; if (!c) { bad++; console.log('  ✗', l); } };
  const row = () => document.querySelector('#fbStrip');
  const read = () => {
    const s = document.querySelector('#fbStrip');
    return {
      head: s.querySelector('.kr-name').textContent, cap: s.querySelector('.kr-cap').textContent,
      cells: [...s.querySelectorAll('.rc')].map(c => { const bt = c.querySelector('button'); return { pc: +bt.dataset.pc, name: bt.querySelector('b').textContent, sub: bt.querySelector('small').textContent.trim(), tone: bt.dataset.tone || null, out: bt.classList.contains('out'), on: bt.classList.contains('on'), step: c.querySelector('.st').textContent.trim() }; }),
      oldCards: document.querySelectorAll('#tab-play .readout, #tab-play .ro, #tab-play .pat').length,
      posBtns: s.querySelectorAll('.posrow button').length,
    };
  };
  for (const [w, mobile] of [[1280, false], [390, true]]) {
    const tag = `[${w}]`;
    const ctx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
    const p = await ctx.newPage(); await p.setViewport({ width: w, height: mobile ? 844 : 900, isMobile: mobile, hasTouch: mobile });
    p.on('pageerror', e => errs.push(tag + ' PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(tag + ' ' + m.text()); });
    const q = (f, a) => p.evaluate(f, a);
    await p.goto(URL + '#play', { waitUntil: 'load' }); await sleep(500);
    const set = (o) => q(o => { Object.assign(BPGW.S, o, { selDeg: null, scalePos: null, chordPos: 0 }); BPGW.render(); }, o);

    /* C natural minor */
    await set({ rootPc: 0, pref: 'auto', scale: 'naturalMinor', mode: 'scale' });
    let r = await q(read);
    ok(r.oldCards === 0, `${tag} the old notes / formula / key-signature / step-pattern cards are gone (${r.oldCards} left)`);
    ok(r.head === 'C Natural Minor', `${tag} one compact heading: "${r.head}"`);
    ok(/3♭/.test(r.cap) && /B♭ E♭ A♭/.test(r.cap), `${tag} key signature as a short caption beside it: "${r.cap}"`);
    ok(r.cells.length === 12, `${tag} 12 note buttons`);
    const inn = r.cells.filter(c => !c.out);
    ok(inn.map(c => c.name).join(' ') === 'C D E♭ F G A♭ B♭', `${tag} in-scale notes spelled for the key: ${inn.map(c => c.name).join(' ')}`);
    ok(inn.map(c => c.sub).join(' ') === '1 2 ♭3 4 5 ♭6 ♭7', `${tag} each carries its interval label: ${inn.map(c => c.sub).join(' ')}`);
    ok(!r.cells.some(c => !c.out && /♯/.test(c.name)), `${tag} no sharps on in-scale buttons in a flat key`);
    ok(inn[0].tone === 'root' && inn.slice(1).every(c => c.tone === 'scale'), `${tag} root is coded as the root, the rest as scale notes`);
    ok(r.cells.filter(c => c.out).length === 5 && r.cells.filter(c => c.out).every(c => c.tone === null), `${tag} the 5 other notes are muted (out), uncoloured`);
    ok(r.cells.filter(c => c.on).length === 1 && r.cells.find(c => c.on).pc === 0, `${tag} exactly one selected button: the root`);
    ok(inn.map(c => c.step).join(' ') === 'W H W W H W W', `${tag} step marks under the in-scale notes: ${inn.map(c => c.step).join(' ')}`);
    ok(r.cells.filter(c => c.out).every(c => c.step === ''), `${tag} no step marks under muted notes`);
    ok(r.posBtns >= 6, `${tag} position buttons present (${r.posBtns})`);

    /* the row is the only control: tap E♭ -> new key */
    const tap = async sel => { await q(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await sleep(40); const c = await q(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, sel); if (mobile) await p.touchscreen.tap(c.x, c.y); else await p.mouse.click(c.x, c.y); await sleep(150); };
    await tap('#fbStrip [data-act="croot"][data-pc="3"]');
    r = await q(read);
    ok(r.head === 'E♭ Natural Minor' && r.cells.find(c => c.on).pc === 3 && r.cells.find(c => c.on).name === 'E♭', `${tag} tapping the E♭ button re-keys everything ("${r.head}")`);
    ok(/6♭/.test(r.cap), `${tag} caption follows: "${r.cap}"`);

    /* sharp keys, modes, pentatonic */
    await set({ rootPc: 9, pref: 'auto', scale: 'major', mode: 'scale' });
    r = await q(read);
    ok(r.cells.filter(c => !c.out).map(c => c.name).join(' ') === 'C♯ D E F♯ G♯ A B', `${tag} A major spelled with sharps (buttons run C to B): ${r.cells.filter(c => !c.out).map(c => c.name).join(' ')}`);
    await set({ rootPc: 2, pref: 'auto', scale: 'dorian', mode: 'scale' });
    r = await q(read);
    ok(/as C major/.test(r.cap) && r.cells.filter(c => !c.out).map(c => c.sub).join(' ') === '♭7 1 2 ♭3 4 5 6', `${tag} D Dorian: labels and parent key in the caption ("${r.cap}")`);
    await set({ rootPc: 0, pref: 'auto', scale: 'minorPent', mode: 'scale' });
    r = await q(read);
    ok(r.cells.filter(c => !c.out).length === 5 && r.cells.filter(c => !c.out).map(c => c.step).join(' ') === 'WH W W WH W', `${tag} minor pentatonic: 5 coded notes, steps ${r.cells.filter(c => !c.out).map(c => c.step).join(' ')}`);

    /* chord mode: chord tones coded by role */
    await set({ rootPc: 0, pref: 'auto', scale: 'major', mode: 'chord', chordRoot: 'C', chordQ: 'maj7' });
    r = await q(read);
    ok(r.head === 'Cmaj7' && r.cells.filter(c => !c.out).map(c => c.tone).join(' ') === 'root third fifth seventh', `${tag} chord mode: Cmaj7 tones coded root/third/fifth/seventh (${r.cells.filter(c => !c.out).map(c => c.tone).join(' ')})`);
    ok(r.cells.filter(c => !c.out).map(c => c.sub).join(' ') === '1 3 5 7' && r.cells.filter(c => !c.out).every(c => c.step === ''), `${tag} chord mode: formula labels 1 3 5 7, no step marks`);
    await set({ rootPc: 3, pref: 'auto', chordRoot: 'E♭', chordQ: 'minor', mode: 'chord' });
    r = await q(read);
    ok(r.cells.filter(c => !c.out).map(c => c.name).join(' ') === 'E♭ G♭ B♭', `${tag} chord mode: E♭m spelled E♭ G♭ B♭ (${r.cells.filter(c => !c.out).map(c => c.name).join(' ')})`);
    // Chord tab uses the same row
    await p.goto(URL + '#chord', { waitUntil: 'load' }); await sleep(450);
    r = await q(read);
    ok(r.cells.length === 12 && r.cells.some(c => c.tone === 'root'), `${tag} the Chord tab shows the same combined row`);

    /* identify / quiz still replace the strip as before and come back */
    await set({ rootPc: 0, pref: 'auto', scale: 'naturalMinor', mode: 'scale' });
    await p.goto(URL + '#play', { waitUntil: 'load' }); await sleep(450);
    ok(await q(() => !!document.querySelector('#fbStrip .rc') && !!document.querySelector('#fbWrap')), `${tag} play tab renders row + fretboard`);
    ok(!(await q(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)), `${tag} no page overflow`);
    await ctx.close();
  }

  /* every theme, both widths */
  const lum = c => { const v = c.map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const cr = (a, c) => { const x = lum(a), y = lum(c); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  for (const th of THEMES) for (const [w, mobile] of [[1280, false], [390, true]]) {
    const ctx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
    const p = await ctx.newPage(); await p.setViewport({ width: w, height: 844, isMobile: mobile, hasTouch: mobile });
    p.on('pageerror', e => errs.push(th + ' PAGEERR ' + e.message));
    await p.goto(URL + '?theme=' + th + '#play', { waitUntil: 'load' }); await sleep(450);
    for (const mode of ['scale', 'chord']) {
      await p.evaluate(m => { Object.assign(BPGW.S, { rootPc: 0, pref: 'auto', scale: 'naturalMinor', mode: m, chordRoot: 'C', chordQ: 'dom7', selDeg: null, scalePos: null, chordPos: 0 }); BPGW.render(); }, mode);
      await sleep(150);
      const r = await p.evaluate(() => {
        const rgb = s => (s.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);
        const s = document.querySelector('#fbStrip'), btns = [...s.querySelectorAll('.rc button.in')];
        const cols = {}; btns.forEach(bt => { const cs = getComputedStyle(bt); cols[bt.dataset.tone] = { bg: rgb(cs.backgroundColor), fg: rgb(cs.color), fgs: rgb(getComputedStyle(bt.querySelector('small')).color) }; });
        const rt = [...s.querySelectorAll('.rc button')].map(x => Math.round(x.getBoundingClientRect().bottom)).filter((v, i, a) => a.indexOf(v) === i);
        const pr = Math.max(...[...s.querySelectorAll('.posrow button')].map(x => x.getBoundingClientRect().right));
        const clip = [...s.querySelectorAll('button')].every(x => x.scrollHeight <= x.clientHeight + 2 && x.scrollWidth <= x.clientWidth + 2);
        const on = s.querySelector('.rc button.on'), onOutline = on ? getComputedStyle(on).outlineStyle : '';
        return { cols, lines: rt.length, pr, vw: document.documentElement.clientWidth, ov: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, clip, n: btns.length, onOutline, rowW: s.querySelector('.rootstrip').getBoundingClientRect().width };
      });
      const T = `[${th} ${w} ${mode}]`;
      let minCr = 99; for (const k in r.cols) minCr = Math.min(minCr, cr(r.cols[k].bg, r.cols[k].fg), cr(r.cols[k].bg, r.cols[k].fgs));
      ok(minCr >= 4.5, `${T} colour-coded buttons: text contrast >= 4.5 (min ${minCr.toFixed(2)})`);
      const bgs = Object.values(r.cols).map(c => c.bg), dist = (a, c) => Math.hypot(a[0] - c[0], a[1] - c[1], a[2] - c[2]);
      let minD = 999; for (let i = 0; i < bgs.length; i++) for (let j = i + 1; j < bgs.length; j++) minD = Math.min(minD, dist(bgs[i], bgs[j]));
      ok(Object.keys(r.cols).length >= 2 && minD > 60, `${T} the ${Object.keys(r.cols).join('/')} colours are clearly different (min distance ${Math.round(minD)})`);
      ok(r.n === (mode === 'scale' ? 7 : 4), `${T} ${r.n} coded buttons`);
      ok(r.onOutline !== 'none' && r.onOutline !== '', `${T} the selected root has a ring`);
      ok(r.lines === 1 && r.clip && !r.ov && r.pr <= r.vw + 0.5, `${T} one row of 12, nothing clipped, positions visible, no overflow (${JSON.stringify({ lines: r.lines, clip: r.clip, ov: r.ov, pr: Math.round(r.pr), vw: r.vw })})`);
      if (mobile) ok(r.rowW <= r.vw, `${T} row fits the phone (${Math.round(r.rowW)}px)`);
    }
    await ctx.close();
  }
  await b.close();
  if (errs.length) { console.log('console errors:'); errs.slice(0, 10).forEach(e => console.log('  ' + e)); }
  console.log(bad || errs.length ? `✗ ${bad} failed, ${errs.length} errors of ${checks}` : `✓ ALL PASSED — ${checks}/${checks} key-row checks`);
  process.exit(bad || errs.length ? 1 : 0);
})();
