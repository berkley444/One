/* The animated piano hand: a stylised top-down hand (SVG) over the keys, five numbered fingers, left hand mirrored, driven by the same fingering data as the number dots.
   Checks: hand present, with a wrist / forearm; the wrist ROLLS (pronates toward the thumb and narrows on a cross-under, rolls the other way on a cross-over, leans into slides, returns level; mirrored for the left hand; none under reduced motion); the right finger on the right key for C major (RH 1-2-3-1-2-3-4-5, LH 5-4-3-2-1-3-2-1); the thumb tucks UNDER and a finger crosses OVER (events + geometry);
   the hand really slides between positions; chords press together; the Hand toggle (default on, persisted); prefers-reduced-motion jumps instead of sliding;
   every theme x 390 / 1280: finger numbers readable, nothing overflows, keys still tappable through the hand.
   Run:  python3 -m http.server 8123   then   BPGW_URL=http://localhost:8123/index.html NODE_PATH=/path/to/puppeteer-core/.. node tests/browser/hand.js */
const puppeteer = require('puppeteer-core');
const URL = process.env.BPGW_URL || 'file:///workspace/One_repo/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const THEMES = ['silver', 'console', 'pedal', 'tube', 'minimal', 'navy-light', 'minimal-dark', 'synth', 'wood', 'sunburst', 'surf', 'rosewood', 'sheet'];
const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  let checks = 0, bad = 0; const errs = [];
  const ok = (c, l) => { checks++; if (!c) { bad++; console.log('  ✗', l); } };
  const newPage = async (w, mobile, reduced) => {
    const ctx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
    const p = await ctx.newPage(); await p.setViewport({ width: w, height: mobile ? 844 : 900, isMobile: mobile, hasTouch: mobile });
    if (reduced) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    p.on('pageerror', e => errs.push(`[${w}] PAGEERR ` + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(`[${w}] ` + m.text()); });
    await p.goto(URL + '#play', { waitUntil: 'load' }); await sleep(500);
    return { ctx, p };
  };
  const set = (p, o, theme) => p.evaluate((o, theme) => { Object.assign(BPGW.S, { rootPc: 0, pref: 'auto', scale: 'major', mode: 'scale', scHand: 'R', psPos: 0, pOcts: 1, pOct: 4, tempo: 240, pHand: true, selDeg: null, scalePos: null, chordPos: 0 }, o);
    if (theme && theme !== 'silver') document.documentElement.setAttribute('data-theme', theme); else if (theme) document.documentElement.removeAttribute('data-theme'); BPGW.render(); }, o, theme);
  /* play something and record every hand event together with the hand's geometry at that moment */
  const record = (p, sel, ms) => p.evaluate((sel, ms) => new Promise(res => {
    const out = []; BPGW.Hand.log.length = 0;
    const h = e => { const i = BPGW.Hand.info(); out.push({ ...e.detail, info: i, cx: BPGW.Hand.keyCx(e.detail.midi) }); };
    document.addEventListener('bpgw-hand', h); document.querySelector(sel).click();
    setTimeout(() => { document.removeEventListener('bpgw-hand', h); res(out); }, ms);
  }), sel, ms);
  const fingers = (ev, hand) => ev.filter(e => e.type === 'press' && e.hand === hand).map(e => e.finger).join('-');

  /* ---------- 1. reduced motion: the pose is final the instant the event fires, so geometry can be checked exactly ---------- */
  {
    const { ctx, p } = await newPage(1280, false, true);
    await set(p, {});
    ok(await p.evaluate(() => BPGW.Hand.reduced()), 'prefers-reduced-motion is seen by the hand');
    const n = await p.evaluate(() => ({ svg: document.querySelectorAll('.pianowrap .piano > svg.handlay').length, hands: document.querySelectorAll('.handlay .hnd').length, fingers: document.querySelectorAll('.handlay .hnd.R .hf').length, nums: [...document.querySelectorAll('.handlay .hnd.R .hb .n')].map(t => t.textContent).join(''), aria: document.querySelector('.handlay').getAttribute('aria-hidden') }));
    ok(await p.evaluate(() => !!document.querySelector('.handlay .hnd.R .arm') && document.querySelector('.handlay .hnd.R .arm').getAttribute('d').length > 20), 'the hand has a visible wrist / forearm segment');
    ok(n.svg === 1 && n.hands === 1 && n.fingers === 5 && n.nums === '12345' && n.aria === 'true', `a hand is drawn over the keys: one right hand, five fingers numbered 1-5, hidden from screen readers (${JSON.stringify(n)})`);

    let ev = await record(p, '[data-act="pplay"][data-v="up"]', 2600);
    ok(fingers(ev, 'R') === '1-2-3-1-2-3-4-5', `C major, right hand ascending: fingers ${fingers(ev, 'R')} (1-2-3-1-2-3-4-5)`);
    const pr = ev.filter(e => e.type === 'press');
    ok(pr.length === 8 && pr.every(e => { const t = e.info.hands.R.tips[e.finger - 1]; return Math.abs(t.x - e.cx) < 0.6 && e.info.hands.R.pressed.includes(e.finger); }), 'at every note the numbered finger sits on that key (fingertip x = key centre) and is the one pressed');
    ok(pr.map(e => e.midi).join(' ') === '60 62 64 65 67 69 71 72', `...on the right notes: ${pr.map(e => e.midi).join(' ')}`);
    ok(ev.every(e => e.info.hands.R.roll.a === 0 && e.info.hands.R.roll.sx === 1 && e.info.hands.R.transform === ''), 'reduced motion: no wrist roll at all (every pose level, no transform), the hand just jumps');
    const tuck = ev.find(e => e.type === 'tuck'), cu = ev.find(e => e.type === 'cross-under');
    ok(tuck && tuck.finger === 3 && tuck.midi === 64 && tuck.to === 65 && tuck.toFinger === 1, `the thumb tucks under while finger 3 plays E: ${JSON.stringify(tuck && { f: tuck.finger, m: tuck.midi, to: tuck.to })}`);
    const tp = pr.find(e => e.midi === 64);
    ok(tp && tp.info.hands.R.thumbUnder === true, 'thumb is drawn under the palm during the tuck');
    ok(tp && Math.abs(tp.info.hands.R.tips[0].x - (tp.cx + 24)) < 0.6, 'the tucked thumb already points at F, the key it is about to play');
    ok(cu && cu.finger === 1 && cu.midi === 65 && cu.from === 64 && cu.fromFinger === 3, `a cross-under event fires at the thumb note: ${JSON.stringify(cu && { f: cu.finger, m: cu.midi, from: cu.from })}`);
    const f1 = pr.find(e => e.midi === 65);
    ok(f1 && f1.info.hands.R.thumbUnder === false && f1.info.hands.R.pressed.join() === '1', 'then the thumb comes out and presses');
    ok(f1 && tp && f1.info.hands.R.xc - tp.info.hands.R.xc > 40, `the whole hand slid along to the new position (${Math.round(f1 && tp ? f1.info.hands.R.xc - tp.info.hands.R.xc : 0)}px)`);
    ok(!ev.some(e => e.type === 'cross-over'), 'no cross-over on the way up');
    await sleep(600);

    /* down: finger 3 crosses OVER the thumb */
    await set(p, {});
    ev = await record(p, '[data-act="pplay"][data-v="scale"]', 5200);
    const down = ev.filter(e => e.type === 'press');
    ok(down.length === 15, 'scale up and down plays 15 notes');
    ok(down.map(e => e.finger).join('-') === '1-2-3-1-2-3-4-5-4-3-2-1-3-2-1', `up and down fingering ${down.map(e => e.finger).join('-')} (1-2-3-1-2-3-4-5-4-3-2-1-3-2-1)`);
    const co = ev.find(e => e.type === 'cross-over');
    ok(co && co.finger === 3 && co.midi === 64 && co.over === 65, `a cross-over event fires coming down: finger 3 on E crosses over the thumb on F ${JSON.stringify(co && { f: co.finger, m: co.midi, over: co.over })}`);
    const cop = down.find((e, i) => i > 7 && e.midi === 64);
    ok(cop && cop.info.hands.R.thumbUnder === true && Math.abs(cop.info.hands.R.tips[0].x - (cop.cx + 24)) < 0.6 && Math.abs(cop.info.hands.R.tips[2].x - cop.cx) < 0.6, 'during the cross-over the thumb stays down on F while finger 3 reaches over to E');
    ok(ev.filter(e => e.type === 'cross-under').length === 1, 'exactly one cross-under (going up), one cross-over (coming down)');

    /* left hand */
    await set(p, { scHand: 'L', pOct: 3 });
    ev = await record(p, '[data-act="pplay"][data-v="scale"]', 5200);
    const lp = ev.filter(e => e.type === 'press' && e.hand === 'L');
    ok(lp.slice(0, 8).map(e => e.finger).join('-') === '5-4-3-2-1-3-2-1', `C major, left hand ascending: ${lp.slice(0, 8).map(e => e.finger).join('-')} (5-4-3-2-1-3-2-1)`);
    ok(lp.length === 15 && lp.slice(7).map(e => e.finger).join('-') === '1-2-3-1-2-3-4-5', `left hand coming down: ${lp.slice(7).map(e => e.finger).join('-')}`);
    ok(lp.every(e => Math.abs(e.info.hands.L.tips[e.finger - 1].x - e.cx) < 0.6), 'left-hand fingers sit on their keys too');
    ok(ev.some(e => e.type === 'cross-over' && e.hand === 'L' && e.finger === 3) && ev.some(e => e.type === 'cross-under' && e.hand === 'L' && e.finger === 1), 'mirrored: the left hand crosses OVER going up and the thumb goes UNDER coming down');
    const lcr = lp.find((e, i) => i === 5);
    ok(lcr && lcr.info.hands.L.thumbUnder === true, 'left hand cross-over: the thumb is held down below the palm');
    const mir = await p.evaluate(() => { const t = BPGW.Hand.info().hands.L.tips; return t[0].x > t[4].x; });
    ok(mir, 'the left hand is mirrored: its thumb is on the right, little finger on the left');

    /* both hands */
    await set(p, { scHand: 'B', pOct: 3, pOcts: 2 });
    ok(await p.evaluate(() => document.querySelectorAll('.handlay .hnd').length) === 2, 'L+R shows two hands');
    await ctx.close();
  }

  /* ---------- 2. real motion: the hand slides (tweens) and the thumb tuck is visible mid-way ---------- */
  {
    const { ctx, p } = await newPage(390, true, false);
    await set(p, { tempo: 60 });
    const x = await p.evaluate(() => new Promise(res => {
      const seen = []; let before = null;
      const lis = e => { if (!BPGW.Hand.info().hands.R) return; const d = e.detail; if (d.type === 'press' && d.midi === 64) before = BPGW.Hand.info().hands.R.xc;
        if (d.type === 'cross-under') { setTimeout(() => { seen.push(BPGW.Hand.info().hands.R.xc); }, 110); setTimeout(() => { seen.push(BPGW.Hand.info().hands.R.xc); }, 600);
          setTimeout(() => { document.removeEventListener('bpgw-hand', lis); res({ before, mid: seen[0], end: seen[1] }); }, 700); } };
      document.addEventListener('bpgw-hand', lis);
      document.querySelector('[data-act="pplay"][data-v="up"]').click();
    }));
    ok(x.before !== null && x.mid > x.before + 1 && x.mid < x.end - 1 && x.end - x.before > 40, `the hand glides rather than jumps: ${Math.round(x.before)} → ${Math.round(x.mid)} (mid-slide) → ${Math.round(x.end)}`);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no horizontal page overflow at 390 while the hand moves');
    const vis = await p.evaluate(() => { const pw = document.querySelector('.pianowrap'), h = BPGW.Hand.info().hands.R.xc; return h >= pw.scrollLeft - 40 && h <= pw.scrollLeft + pw.clientWidth + 40; });
    ok(vis, 'the keyboard scrolled to keep the hand in view on the phone');
    await sleep(6500);
    /* wrist roll: sample the live hand for a whole scale up and down, for each hand */
    for (const [hand, uSign, oSign] of [['R', -1, 1], ['L', 1, -1]]) {
      await set(p, { tempo: 60, scHand: hand, pOct: hand === 'L' ? 3 : 4 });
      const smp = await p.evaluate(h => new Promise(res => {
        const out = [], t0 = performance.now(); document.querySelector('[data-act="pplay"][data-v="scale"]').click();
        const iv = setInterval(() => { const i = BPGW.Hand.info().hands[h]; out.push({ t: performance.now() - t0, a: i.roll.a, sx: i.roll.sx, tilt: i.roll.tilt, tr: i.transform, xc: i.xc }); }, 25);
        setTimeout(() => { clearInterval(iv); res(out); }, 8600);
      }), hand);
      const as = smp.map(x => x.a), mn = Math.min(...as), mx = Math.max(...as), under = uSign < 0 ? mn : mx, over = oSign > 0 ? mx : mn;
      const RR = `[${hand}H]`;
      ok(Math.abs(under) >= 9 && Math.sign(under) === uSign, `${RR} cross-under: the wrist pronates toward the thumb (${under}° — ${hand === 'R' ? 'counter-clockwise' : 'clockwise, mirrored'})`);
      ok(Math.min(...smp.map(x => x.sx)) <= 0.9 && Math.min(...smp.map(x => x.sx)) >= 0.8, `${RR} the palm narrows (scaleX ${Math.min(...smp.map(x => x.sx))}) while the thumb is under`);
      ok(Math.abs(over) >= 7 && Math.sign(over) === oSign, `${RR} cross-over: the roll goes the OTHER way (${over}°)`);
      ok(smp.some(x => /rotate\(/.test(x.tr) && /scale\(/.test(x.tr)), `${RR} a rotate + scale transform is really applied to the hand`);
      const lean = smp.filter(x => Math.abs(x.tilt) > 0.4); ok(lean.length > 5 && lean.some(x => x.tilt > 0) && lean.some(x => x.tilt < 0), `${RR} it leans into the slide, right while travelling up, left coming down`);
      const iU = as.findIndex(a => Math.sign(a) === uSign && Math.abs(a) >= 9), after = as.slice(iU).findIndex(a => Math.abs(a) < 2);
      ok(iU >= 0 && after > 0, `${RR} after the cross-under the roll eases back toward level`);
      const mid = as.slice(iU).filter(a => Math.abs(a) > 2.5 && Math.abs(a) < 9 && Math.sign(a) === uSign);
      ok(mid.length >= 3, `${RR} the return is a smooth ease, not a snap (${mid.length} in-between samples)`);
      const last = smp[smp.length - 1]; ok(Math.abs(last.a) < 0.6 && last.sx === 1 && last.tr === '', `${RR} at the end the hand is level again (a=${last.a}, no transform)`);
      await sleep(300);
    }
    await ctx.close();
  }

  /* ---------- 3. chords press together; the toggle; persistence ---------- */
  {
    const { ctx, p } = await newPage(1280, false, true);
    await set(p, { mode: 'chord', chordRoot: 'C', chordQ: 'major', chHand: 'B', pOct: 3 });
    let ev = await record(p, '[data-act="pplay"][data-v="block"]', 700);
    const pr = ev.filter(e => e.type === 'press');
    ok(pr.length === 4 && Math.max(...pr.map(e => e.t)) - Math.min(...pr.map(e => e.t)) < 40, `chord: all ${pr.length} fingers press in the same instant`);
    ok(fingers(ev, 'R') === '1-3-5' && fingers(ev, 'L') === '5', `C major chord, right hand ${fingers(ev, 'R')} (1-3-5), left hand ${fingers(ev, 'L')} (5)`);
    ok(pr.every(e => Math.abs(e.info.hands[e.hand].tips[e.finger - 1].x - e.cx) < 0.6), 'each chord finger sits on its note');
    ok(pr.find(e => e.hand === 'R').info.hands.R.pressed.join() === '1,3,5', 'the right-hand pose shows 1, 3 and 5 pressed down');
    ok(!ev.some(e => /tuck|cross/.test(e.type)), 'chords have no cross-under');

    /* toggle */
    await set(p, {});
    const btn = '[data-act="phtog"]';
    ok(await p.evaluate(b => document.querySelector(b).getAttribute('aria-pressed') === 'true', btn), 'the ✋ Hand toggle is in the piano controls, on by default');
    await p.evaluate(b => { const e = document.querySelector(b); e.scrollIntoView({ block: 'center' }); e.click(); }, btn); await sleep(150);
    ok(await p.evaluate(() => BPGW.S.pHand === false && !document.querySelector('.handlay') && document.querySelector('[data-act="phtog"]').getAttribute('aria-pressed') === 'false'), 'toggled off: the hand is gone');
    ev = await record(p, '[data-act="pplay"][data-v="up"]', 700);
    ok(ev.length === 0, 'with the hand off, playback emits no hand events');
    await p.reload({ waitUntil: 'load' }); await sleep(400);
    ok(await p.evaluate(() => BPGW.S.pHand === false && !document.querySelector('.handlay')), 'the choice survives a reload');
    await p.evaluate(b => document.querySelector(b).click(), btn); await sleep(150);
    ok(await p.evaluate(() => BPGW.S.pHand === true && !!document.querySelector('.handlay .hnd')), 'toggled back on');
    await ctx.close();
  }

  /* ---------- 4. themes x phone / desktop ---------- */
  for (const [w, mobile] of [[1280, false], [390, true]]) {
    const { ctx, p } = await newPage(w, mobile, true);
    for (const th of THEMES) {
      const T = `[${w} ${th}]`;
      await set(p, { scHand: 'B', pOct: 3, pOcts: 1 }, th); await sleep(120);
      const r = await p.evaluate(() => {
        const rgb = s => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
        const hs = [...document.querySelectorAll('.handlay .hnd')].map(h => ({ hand: h.dataset.hand, fills: [...h.querySelectorAll('.hb')].map(g => ({ bg: rgb(getComputedStyle(g.querySelector('.b')).fill), fg: rgb(getComputedStyle(g.querySelector('.n')).fill), size: parseFloat(g.querySelector('.n').style.fontSize) })), palm: getComputedStyle(h.querySelector('.palm rect')).fill }));
        document.querySelector('.pianowrap').scrollIntoView({ block: 'center' });
        const piano = document.querySelector('.piano'), svg = document.querySelector('.handlay'), r = svg.getBoundingClientRect();
        const pw = document.querySelector('.pianowrap').getBoundingClientRect();
        const el = document.elementFromPoint(pw.left + pw.width / 2, pw.top + 150), el2 = document.elementFromPoint(pw.left + pw.width / 2, pw.top + 190);
        return { hs, ov: document.documentElement.scrollWidth > innerWidth + 1, vw: innerWidth, inPiano: svg.parentElement === piano, clickable: getComputedStyle(svg).pointerEvents === 'none' && !!(el && el.closest('.pk')) && !!(el2 && el2.closest('.pk')), h: Math.round(piano.getBoundingClientRect().height) };
      });
      ok(r.hs.length === 2, `${T} both hands drawn`);
      const worst = Math.min(...r.hs.flatMap(h => h.fills.map(f => cr(f.fg, f.bg))));
      ok(worst >= 4.5, `${T} finger numbers readable on their badges (worst ${worst.toFixed(2)}:1)`);
      ok(!r.ov, `${T} no horizontal page overflow`);
      ok(r.inPiano && r.h <= 230, `${T} the hand lives inside the keyboard and the piano stays compact (${r.h}px)`);
      ok(r.clickable, `${T} keys are still tappable through the hand (pointer-events: none)`);
    }
    await ctx.close();
  }
  await b.close();
  if (errs.length) { console.log('console errors:'); errs.slice(0, 10).forEach(e => console.log('  ' + e)); }
  console.log(bad || errs.length ? `✗ ${bad} failed, ${errs.length} errors of ${checks}` : `✓ ALL PASSED — ${checks}/${checks} hand checks`);
  process.exit(bad || errs.length ? 1 : 0);
})();
