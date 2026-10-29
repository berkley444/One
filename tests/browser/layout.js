/* Layout order: the fretboard is the showpiece. On CHORD (and PLAY where it applies) the single row of root + position buttons sits directly above the fretboard,
   the Chord Builder block (qualities, Chord/Formula/Notes cards, Play/Strum/Arpeggio, notes table) sits BELOW the fretboard section, and nothing hides behind the bottom tab bar.
   Run:  python3 -m http.server 8123   then   BPGW_URL=http://localhost:8123/index.html NODE_PATH=/path/to/puppeteer-core/.. node tests/browser/layout.js */
const puppeteer = require('puppeteer-core');
const URL = process.env.BPGW_URL || 'file:///workspace/One_repo/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const THEMES = ['silver', 'console', 'pedal', 'tube', 'minimal', 'minimal-dark', 'synth', 'wood'];
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  let checks = 0, bad = 0; const errs = [];
  const ok = (c, l) => { checks++; if (!c) { bad++; console.log('  ✗', l); } };
  for (const [w, mobile] of [[1280, false], [390, true]]) {
    const tag = `[${w}]`;
    const ctx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
    const p = await ctx.newPage(); await p.setViewport({ width: w, height: mobile ? 844 : 900, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    p.on('pageerror', e => errs.push(tag + ' PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(tag + ' ' + m.text()); });
    const q = (f, a) => p.evaluate(f, a);
    const go = async (hash, qs = '') => { await p.goto(URL + qs + hash, { waitUntil: 'load' }); await sleep(450); };
    const geo = () => q(() => {
      const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: b.top + scrollY, bottom: b.bottom + scrollY, h: b.height }; };
      const strip = document.querySelector('#fbStrip');
      return {
        guitarH2: r('.tab.on h2'), toolbar: r('.tab.on .toolbar'), strip: r('#fbStrip'), fb: r('#fbWrap'),
        builder: [...document.querySelectorAll('.tab.on h2')].map(h => ({ t: h.textContent, top: h.getBoundingClientRect().top + scrollY })),
        det: r('.tab.on details.det'), pdetail: r('.tab.on .pdetail'), piano: r('.tab.on #pianoWrap'),
        tops: strip ? [...strip.querySelectorAll('button')].map(b => Math.round(b.getBoundingClientRect().top)).filter((v, i, a) => a.indexOf(v) === i) : [],
        roots: strip ? strip.querySelectorAll('[data-act="croot"]').length : 0, cpos: strip ? strip.querySelectorAll('[data-act="cpos"]').length : 0, spos: strip ? strip.querySelectorAll('[data-act="spos"]').length : 0,
        sw: strip ? strip.scrollWidth : 0, cw: strip ? strip.clientWidth : 0,
        posrowsBelowBoard: [...document.querySelectorAll('.tab.on .posrow')].filter(e => !e.closest('#fbStrip') && !e.closest('.pcontrol')).length,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      };
    });
    const h2 = (g, re) => (g.builder.find(h => re.test(h.t)) || {}).top;

    /* ---- CHORD tab ---- */
    await go('#chord');
    let g = await geo();
    ok(g.strip && g.fb, `${tag} chord: the strip and the fretboard exist`);
    ok(g.toolbar.bottom <= g.strip.top + 1 && g.strip.bottom <= g.fb.top + 1 && g.fb.top - g.strip.bottom < 24, `${tag} chord: strip sits directly above the fretboard, under the fretboard header (gap ${Math.round(g.fb.top - g.strip.bottom)}px)`);
    ok(g.tops.length === 1, `${tag} chord: roots and positions share ONE line (tops ${g.tops})`);
    ok(g.roots === 12 && g.cpos >= 3, `${tag} chord: 12 root buttons and ${g.cpos} position buttons`);
    ok(mobile ? g.sw >= g.cw : g.sw <= g.cw + 1, `${tag} chord: ${mobile ? 'phone strip scrolls sideways' : 'desktop strip fits without scrolling'} (${g.sw}/${g.cw})`);
    ok(g.posrowsBelowBoard === 0, `${tag} chord: no old position row below the fretboard`);
    const gap = await q(() => { const a = document.querySelector('#fbStrip .froot .rootstrip').getBoundingClientRect(), c = document.querySelector('#fbStrip .fpos .posrow').getBoundingClientRect(); return Math.round(c.left - a.right); });
    ok(gap >= 10, `${tag} chord: visible gap between the root and position groups (${gap}px)`);
    ok(g.guitarH2.top < g.strip.top, `${tag} chord: the Guitar heading comes first`);
    const bt = h2(g, /Chord Builder/);
    ok(bt > g.fb.bottom, `${tag} chord: Chord Builder is below the fretboard`);
    ok(g.pdetail && bt > g.pdetail.bottom - 1, `${tag} chord: Chord Builder comes after the chord diagram/info under the board`);
    ok(g.det && g.det.top > bt, `${tag} chord: notes · intervals · frequencies is inside the lower block`);
    ok(h2(g, /Piano/) > g.det.bottom, `${tag} chord: Piano follows the builder`);
    ok(await q(() => { const c = document.querySelector('.tab.on .card .readout'); const t = document.querySelector('.tab.on .card .toolbar'); const f = document.querySelector('#fbWrap'); return c && t && (c.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_PRECEDING) && (t.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_PRECEDING); }), `${tag} chord: Chord/Formula/Notes cards and Play chord/Strum/Arpeggio are after the fretboard in the DOM`);
    ok(!g.overflow, `${tag} chord: no page overflow`);

    // the controls still work and the strip keeps its place
    const tapSel = async sel => { await q(s => document.querySelector(s).scrollIntoView({ block: 'center', inline: 'nearest' }), sel); await sleep(40); const r = await q(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, sel); if (mobile) await p.touchscreen.tap(r.x, r.y); else await p.mouse.click(r.x, r.y); await sleep(120); };
    await tapSel('#fbStrip [data-act="croot"][data-pc="7"]');
    ok(await q(() => /^G/.test(BPGW.S.chordRoot) && document.querySelector('#fbStrip [data-act="croot"][data-pc="7"]').classList.contains('on')), `${tag} chord: tapping G in the strip changes the chord (${await q(() => BPGW.S.chordRoot)})`);
    ok(await q(() => /G/.test(document.querySelector('.tab.on .card .readout .v.big').textContent)), `${tag} chord: the lower Chord card follows`);
    await tapSel('#fbStrip [data-act="cpos"][data-v="2"]');
    ok(await q(() => BPGW.S.chordPos === 2 && /position 3/.test(document.querySelector('.pdetail .ptit').textContent)), `${tag} chord: tapping position 3 updates the diagram`);
    if (mobile) { await q(() => { document.querySelector('#fbStrip').scrollLeft = 120; }); await sleep(50); await tapSel('#fbStrip [data-act="cpos"][data-v="3"]'); ok(await q(() => document.querySelector('#fbStrip').scrollLeft > 60), `${tag} chord: strip keeps its scroll position after a tap (${await q(() => document.querySelector('#fbStrip').scrollLeft)})`); }
    await tapSel('.tab.on [data-act="cq"][data-q="min7"]');
    ok(await q(() => BPGW.S.chordQ === 'min7'), `${tag} chord: quality buttons in the lower block still work`);

    // hash state restores
    const hash = await q(() => location.hash);
    await go(hash);
    ok(await q(() => BPGW.S.chordQ === 'min7' && /^G/.test(BPGW.S.chordRoot)), `${tag} chord: state restored from the hash (${hash})`);

    // bottom tab bar never covers content
    await q(() => window.scrollTo(0, document.documentElement.scrollHeight)); await sleep(150);
    const cover = await q(() => { const d = document.querySelector('#dock, nav.dock').getBoundingClientRect(); const f = [...document.querySelectorAll('footer, .foot, body > *:last-child')].pop(); const fb = document.querySelector('footer, .foot'); const lastBottom = fb ? fb.getBoundingClientRect().bottom : f.getBoundingClientRect().bottom; return { dockTop: d.top, lastBottom }; });
    ok(cover.lastBottom <= cover.dockTop + 1, `${tag} chord: the last line of the page clears the bottom tab bar (${Math.round(cover.lastBottom)} ≤ ${Math.round(cover.dockTop)})`);

    /* ---- identify / quiz keep working with the new order ---- */
    await go('#chord');
    await tapSel('[data-act="idtoggle"]'); await sleep(200);
    g = await geo();
    ok(g.strip === null, `${tag} chord: no position strip while placing notes`);
    ok(await q(() => !!document.querySelector('#idPanel') && document.querySelectorAll('.idc').length > 90), `${tag} chord: Clear / Identify board is there`);
    ok(h2(g, /Chord Builder/) > g.fb.bottom && g.det && g.det.top > g.fb.bottom, `${tag} chord: builder stays below the board in identify mode`);
    await tapSel('[data-act="quiztoggle"]'); await sleep(200);
    ok(await q(() => BPGW.S.qOn === true || !!document.querySelector('.idquizp')), `${tag} chord: Chord Quiz opens from the chord tab`);
    await tapSel('[data-act="quiztoggle"]'); await sleep(150);
    g = await geo(); ok(g.strip && g.roots === 12, `${tag} chord: strip is back after leaving the quiz`);

    /* ---- PLAY tab: positions row above the board, no root row (Music Control owns the key) ---- */
    await go('#play');
    g = await geo();
    ok(g.strip && g.fb && g.strip.bottom <= g.fb.top + 1 && g.fb.top - g.strip.bottom < 24, `${tag} play: position row sits directly above the fretboard`);
    ok(g.tops.length === 1, `${tag} play: one line (tops ${g.tops})`);
    ok(g.roots === 0 && (g.cpos > 0 || g.spos > 0), `${tag} play: positions only (${g.cpos + g.spos} buttons), no duplicate root row`);
    ok(g.posrowsBelowBoard === 0 && !g.overflow, `${tag} play: no old row below, no overflow`);
  }
  // every theme, both widths: one line, no overflow
  for (const th of THEMES) for (const [w, mobile] of [[1280, false], [390, true]]) {
    const ctx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
    const p = await ctx.newPage(); await p.setViewport({ width: w, height: 844, isMobile: mobile, hasTouch: mobile });
    p.on('pageerror', e => errs.push(th + ' PAGEERR ' + e.message));
    await p.goto(URL + '?theme=' + th + '#chord', { waitUntil: 'load' }); await sleep(450);
    const r = await p.evaluate(() => { const s = document.querySelector('#fbStrip'), t = [...s.querySelectorAll('button')].map(b => Math.round(b.getBoundingClientRect().top)).filter((v, i, a) => a.indexOf(v) === i); const h = s.getBoundingClientRect(); return { lines: t.length, fit: s.scrollWidth <= s.clientWidth + 1, h: h.height, ov: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, noclip: [...s.querySelectorAll('button')].every(b => b.scrollHeight <= b.clientHeight + 2) }; });
    ok(r.lines === 1 && !r.ov && r.noclip, `[${th} ${w}] strip: one line, no clipped buttons, no page overflow (${JSON.stringify(r)})`);
    if (!mobile) ok(r.fit, `[${th} ${w}] strip fits without scrolling on desktop`);
    await ctx.close();
  }
  await b.close();
  if (errs.length) { console.log('console errors:'); errs.slice(0, 10).forEach(e => console.log('  ' + e)); }
  console.log(bad || errs.length ? `✗ ${bad} failed, ${errs.length} errors of ${checks}` : `✓ ALL PASSED — ${checks}/${checks} layout checks`);
  process.exit(bad || errs.length ? 1 : 0);
})();
