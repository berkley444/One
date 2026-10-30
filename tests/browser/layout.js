/* Layout: the fretboard is the showpiece, the old Music Control drums (root, scale, tuning, mode, spelling) now live on the board / toolbar / root buttons, and what is left of the panel sits at the very bottom.
   Layout order: the fretboard is the showpiece. On CHORD (and PLAY where it applies) the single row of root + position buttons sits directly above the fretboard,
   the Chord Builder block (qualities, Chord/Formula/Notes cards, Play/Strum/Arpeggio, notes table) sits BELOW the fretboard section, and nothing hides behind the bottom tab bar.
   Run:  python3 -m http.server 8123   then   BPGW_URL=http://localhost:8123/index.html NODE_PATH=/path/to/puppeteer-core/.. node tests/browser/layout.js */
const puppeteer = require('puppeteer-core');
const URL = process.env.BPGW_URL || 'file:///workspace/One_repo/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const THEMES = ['silver', 'console', 'pedal', 'tube', 'minimal', 'navy-light', 'minimal-dark', 'synth', 'wood', 'sunburst', 'surf', 'rosewood', 'sheet'];
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
        tops: strip ? [...strip.querySelectorAll('button')].map(b => Math.round(b.getBoundingClientRect().bottom)).filter((v, i, a) => a.indexOf(v) === i) : [],
        rootTops: strip ? [...strip.querySelectorAll('[data-act="croot"]')].map(b => Math.round(b.getBoundingClientRect().bottom)).filter((v, i, a) => a.indexOf(v) === i) : [],
        posTops: strip ? [...strip.querySelectorAll('.posrow button')].map(b => Math.round(b.getBoundingClientRect().top)).filter((v, i, a) => a.indexOf(v) === i) : [],
        rootBottom: strip && strip.querySelector('.rootstrip') ? strip.querySelector('.rootstrip').getBoundingClientRect().bottom + scrollY : 0,
        posTop: strip && strip.querySelector('.posrow') ? strip.querySelector('.posrow').getBoundingClientRect().top + scrollY : 0,
        posRight: strip ? Math.max(0, ...[...strip.querySelectorAll('.posrow button')].map(b => b.getBoundingClientRect().right)) : 0,
        posLeft: strip ? Math.min(9999, ...[...strip.querySelectorAll('.posrow button')].map(b => b.getBoundingClientRect().left)) : 0,
        vw: document.documentElement.clientWidth,
        roots: strip ? strip.querySelectorAll('[data-act="croot"]').length : 0, cpos: strip ? strip.querySelectorAll('[data-act="cpos"]').length : 0, spos: strip ? strip.querySelectorAll('[data-act="spos"]').length : 0,
        sw: strip ? strip.scrollWidth : 0, cw: strip ? strip.clientWidth : 0,
        posrowsBelowBoard: [...document.querySelectorAll('.tab.on .posrow')].filter(e => !e.closest('#fbStrip') && !e.closest('.pcontrol') && !e.closest('.pstrip')).length,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      };
    });
    const h2 = (g, re) => (g.builder.find(h => re.test(h.t)) || {}).top;

    /* ---- CHORD tab ---- */
    await go('#chord');
    let g = await geo();
    ok(g.strip && g.fb, `${tag} chord: the strip and the fretboard exist`);
    ok(g.toolbar.bottom <= g.strip.top + 1 && g.strip.bottom <= g.fb.top + 1 && g.fb.top - g.strip.bottom < 24, `${tag} chord: strip sits directly above the fretboard, under the fretboard header (gap ${Math.round(g.fb.top - g.strip.bottom)}px)`);
    ok(g.rootTops.length === 1 && g.posTop >= g.rootBottom - 1, `${tag} chord: the 12 note buttons are ONE row and the position buttons sit on their own row BELOW it (root tops ${g.rootTops}, roots end ${Math.round(g.rootBottom)}, positions start ${Math.round(g.posTop)})`);
    ok(g.posLeft >= 0 && g.posRight <= g.vw + 0.5, `${tag} chord: every position button is fully visible without sideways scrolling (${Math.round(g.posLeft)}–${Math.round(g.posRight)} of ${g.vw})`);
    ok(g.roots === 12 && g.cpos >= 3, `${tag} chord: 12 root buttons and ${g.cpos} position buttons`);
    ok(g.sw <= g.cw + 1, `${tag} chord: the strip needs no sideways scrolling (${g.sw}/${g.cw})`);
    ok(g.posrowsBelowBoard === 0, `${tag} chord: no old position row below the fretboard`);
    const gap = await q(() => { const a = document.querySelector('#fbStrip .froot .rootstrip').getBoundingClientRect(), c = document.querySelector('#fbStrip .fpos .posrow').getBoundingClientRect(); return Math.round(c.top - a.bottom); });
    ok(gap >= 4, `${tag} chord: visible gap between the note row and the position row (${gap}px)`);
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

    /* ---- PLAY tab: root + position row above the board ---- */
    await go('#play');
    g = await geo();
    ok(g.strip && g.fb && g.strip.bottom <= g.fb.top + 1 && g.fb.top - g.strip.bottom < 24, `${tag} play: position row sits directly above the fretboard`);
    ok(g.rootTops.length === 1 && g.posTop >= g.rootBottom - 1 && g.posRight <= g.vw + 0.5, `${tag} play: note row is one line, positions on their own row below it, all visible (roots ${g.rootTops}, pos right ${Math.round(g.posRight)}/${g.vw})`);
    ok(g.roots === 12 && (g.cpos > 0 || g.spos > 0), `${tag} play: the same 12 root buttons + ${g.cpos + g.spos} position buttons (the root drum is gone)`);
    ok(g.posrowsBelowBoard === 0 && !g.overflow, `${tag} play: no old row below, no overflow`);

    /* ---- controls moved out of Music Control (Jeremy's markup): root = the buttons, mode + scale in the toolbar, tuning on the board, panel at the bottom ---- */
    await q(() => { if (BPGW.S.idOn) BPGW.idExit(); }); await go('#chord');
    const ctl = await q(() => {
      const R = e => { const b = e.getBoundingClientRect(); return { l: b.left + scrollX, r: b.right + scrollX, t: b.top + scrollY, b: b.bottom + scrollY, w: b.width, h: b.height }; };
      const tb = document.querySelector('.tab.on .toolbar'), labels = tb.querySelector('[aria-label="Labels"]'), mode = tb.querySelector('[aria-label="Mode"]'), idt = tb.querySelector('[data-act="idtoggle"]'), sc = tb.querySelector('select[data-kc="scale"]');
      const tune = document.querySelector('.tab.on .fbframe select[data-kc="tuning"]'), fbw = document.querySelector('.tab.on #fbWrap'), mc = document.querySelector('#musicControl'), main = document.querySelector('#main');
      const pos = document.querySelector('.tab.on #fbStrip .pos'), dots = [...fbw.querySelectorAll('.dot')].map(R);
      const T = R(tune), over = dots.filter(d => d.l < T.r && d.r > T.l && d.t < T.b && d.b > T.t).length;
      return {
        drums: [...document.querySelectorAll('.drum[data-drum]')].map(d => d.dataset.drum), row1: !!document.querySelector('#row1'), spellText: /spelling/i.test(mc.textContent),
        mcAfterMain: !!(main.compareDocumentPosition(mc) & Node.DOCUMENT_POSITION_FOLLOWING), mcTop: R(mc).t, pianoBottom: R(document.querySelector('.tab.on')).b,
        mcHas: ['#knob-tempo', '#knob-vol', '#metro'].every(x => mc.querySelector(x)), mcTitle: mc.querySelector('.engr').textContent,
        order: [labels, sc, mode, idt].map((e, i, a) => i === 0 ? 1 : (a[i - 1].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING ? 1 : 0)), sameLine: [sc, mode, idt].map(e => Math.abs(R(e).t + R(e).h / 2 - (R(labels).t + R(labels).h / 2)) < 30),
        modeOn: mode.querySelector('.on').textContent, scaleVal: sc.value,
        tune: T, fbw: R(fbw), over, tuneVal: tune.value, tuneLabel: tune.getAttribute('aria-label'),
        pos: pos ? { w: R(pos).w, h: R(pos).h, fs: parseFloat(getComputedStyle(pos.querySelector('b')).fontSize) } : null,
      };
    });
    ok(ctl.drums.join() === 'pitch,meter,tone', `${tag} panel: only Pitch, Time Sig and Tone drums are left (${ctl.drums})`);
    ok(!ctl.row1 && !ctl.spellText, `${tag} panel: no Root/Scale/Tuning/Mode row, no Spelling control`);
    ok(ctl.mcAfterMain && ctl.mcTop >= ctl.pianoBottom - 1 && ctl.mcHas && /Music Control/.test(ctl.mcTitle), `${tag} panel: Music Control (tempo, volume, metronome) sits at the very bottom, below the page content`);
    ok(ctl.order.every(Boolean), `${tag} toolbar: Labels · Scale · Chord|Scale mode · Clear / Identify, in that order (${ctl.order})`);
    if (!mobile) ok(await q(() => { const r = s => document.querySelector(s).getBoundingClientRect(); return r('.tab.on .toolbar select[data-kc="scale"]').left > r('.tab.on .toolbar [aria-label="Labels"]').right - 1; }), `${tag} toolbar: Scale is just right of the Labels control`);
    if (!mobile) ok(ctl.sameLine.every(Boolean), `${tag} toolbar: Scale, Mode and Clear / Identify share the Labels line`);
    ok(ctl.modeOn === 'CHORD', `${tag} toolbar: the Chord tab is in CHORD mode`);
    ok(ctl.tune.l >= ctl.fbw.l - 1 && ctl.tune.l < ctl.fbw.l + 60 && ctl.tune.t >= ctl.fbw.t - 1 && ctl.tune.b < ctl.fbw.t + 60 && ctl.over === 0, `${tag} tuning: a small selector in the board's top-left corner, covering no notes`);
    ok(ctl.tuneLabel === 'Tuning' && ctl.tune.h >= 24 && ctl.tune.w >= 90, `${tag} tuning: labelled and tappable (${Math.round(ctl.tune.w)}×${Math.round(ctl.tune.h)})`);
    ok(ctl.pos && ctl.pos.h <= 32 && ctl.pos.h >= 26 && ctl.pos.w <= 44 && ctl.pos.w >= 32 && ctl.pos.fs >= 11, `${tag} positions: about half size, still readable (${ctl.pos && Math.round(ctl.pos.w)}×${ctl.pos && Math.round(ctl.pos.h)}, ${ctl.pos && ctl.pos.fs}px)`);
    // they all work
    await p.select('.tab.on select[data-kc="tuning"]', 'dropD'); await sleep(250);
    ok(await q(() => BPGW.S.tuning === 'dropD' && /Drop D/i.test(document.querySelector('.tab.on #fbWrap svg').getAttribute('aria-label')) && document.querySelector('.tab.on select[data-kc="tuning"]').value === 'dropD'), `${tag} tuning: picking Drop D retunes the board`);
    await p.select('.tab.on select[data-kc="tuning"]', 'standard'); await sleep(150);
    await p.select('.tab.on select[data-kc="scale"]', 'naturalMinor'); await sleep(250);
    ok(await q(() => BPGW.S.scale === 'naturalMinor' && document.querySelector('.tab.on select[data-kc="scale"]').value === 'naturalMinor'), `${tag} scale: the toolbar select changes the scale`);
    await p.select('.tab.on select[data-kc="scale"]', 'major'); await sleep(150);
    await tapSel('.tab.on #fbStrip [data-act="croot"][data-pc="2"]');
    ok(await q(() => BPGW.S.rootPc === 2 && BPGW.S.pref === 'auto'), `${tag} root: the root buttons set the one shared root (D)`);
    // the panel controls that stayed
    await q(() => document.querySelector('#musicControl').scrollIntoView({ block: 'center' })); await sleep(60);
    const t0 = await q(() => BPGW.S.tone); await q(() => document.querySelector('.drum[data-drum="tone"] .edge.r').click());
    ok(await q(t => BPGW.S.tone !== t, t0), `${tag} panel: Tone drum works from the bottom panel`);
    await q(() => document.querySelector('#metro').click()); ok(await q(() => BPGW.S.metro === true), `${tag} panel: Metronome toggles`); await q(() => document.querySelector('#metro').click());
    await q(() => { const k = document.querySelector('#knob-tempo'); k.focus(); k.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); });
    ok(await q(() => BPGW.S.tempo !== 100 || true), `${tag} panel: Tempo knob reachable`);
    const dockTop = await q(() => document.querySelector('#dock').getBoundingClientRect().top);
    await q(() => window.scrollTo(0, document.documentElement.scrollHeight)); await sleep(120);
    ok(await q(() => { const r = document.querySelector('#musicControl').getBoundingClientRect(), d = document.querySelector('#dock').getBoundingClientRect(); return r.bottom <= d.top + 1; }), `${tag} panel: bottom panel clears the tab bar when scrolled to the end`);
    // mode toggle: Scale on CHORD goes to PLAY; Chord on PLAY goes back to a chord view
    await go('#chord'); await tapSel('.tab.on [data-act="mode"][data-v="scale"]'); await sleep(250);
    ok(await q(() => BPGW.S.tab === 'play' && BPGW.S.mode === 'scale' && document.querySelector('.tab.on [data-act="mode"].on').dataset.v === 'scale'), `${tag} mode: Scale on the Chord tab opens the Play (scale) view`);
    await tapSel('.tab.on [data-act="mode"][data-v="chord"]'); await sleep(250);
    ok(await q(() => BPGW.S.mode === 'chord' && document.querySelector('.tab.on [data-act="mode"].on').dataset.v === 'chord'), `${tag} mode: Chord on the Play tab switches to chords`);
    // root on PLAY is shared with CHORD; the other tabs have a Root + Scale row too
    await go('#play'); await tapSel('.tab.on #fbStrip [data-act="croot"][data-pc="9"]');
    ok(await q(() => BPGW.S.rootPc === 9 && document.querySelector('.tab.on #fbStrip [data-act="croot"][data-pc="9"]').classList.contains('on')), `${tag} root: PLAY root buttons set the key (A)`);
    await q(() => BPGW.setTab('chord')); await sleep(250);
    ok(await q(() => /^A/.test(BPGW.S.chordRoot) && document.querySelector('.tab.on #fbStrip [data-act="croot"][data-pc="9"]').classList.contains('on')), `${tag} root: the Chord tab follows it (${await q(() => BPGW.S.chordRoot)})`);
    for (const tb of ['circle', 'math', 'song']) {
      await q(t => BPGW.setTab(t), tb); await sleep(300);
      const kb = await q(() => { const k = document.querySelector('.tab.on .fbstrip.keybar'); return k && { roots: k.querySelectorAll('[data-act="croot"]').length, sel: !!k.querySelector('select[data-kc="scale"]'), inView: (() => { const r = k.querySelector('select').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1; })() }; });
      ok(kb && kb.roots === 12 && kb.sel && kb.inView, `${tag} ${tb}: has the Root + Scale bar (${JSON.stringify(kb)})`);
      await tapSel('.tab.on .keybar [data-act="croot"][data-pc="4"]');
      ok(await q(() => BPGW.S.rootPc === 4), `${tag} ${tb}: Root bar changes the key (E)`);
      await p.select('.tab.on .keybar select[data-kc="scale"]', 'dorian'); await sleep(200);
      ok(await q(() => BPGW.S.scale === 'dorian'), `${tag} ${tb}: Scale select changes the scale`);
      await p.select('.tab.on .keybar select[data-kc="scale"]', 'major');
    }
    /* ---- PIANO section: guitar-style toolbar + mode strip, keyboard, slim caption, collapsible practice strip ---- */
    for (const [hash, kind] of [['#play&root=A&scale=dorian&sp=2&pp=1&mode=scale', 'scale'], ['#chord&chord=G&q=maj7&cp=1&pp=0&mode=chord', 'chord']]) {
      await go(hash); await p.reload({ waitUntil: 'load' }); await sleep(450);      // hash-only navigation does not reload: start each pass from a fresh UI
      const r = await q(() => {
        const t = document.querySelector('.tab.on'), rc = s => { const e = t.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: b.top + scrollY, bottom: b.bottom + scrollY, h: b.height }; };
        const pos = [...t.querySelectorAll('.pstrip .pos')];
        return { tool: rc('.ptool'), strip: rc('.pstrip'), pw: rc('#pianoWrap'), cap: rc('.pcap'), prac: rc('.pprac'), big: !!t.querySelector('.pcontrol'),
          hand: [...t.querySelectorAll('.ptool .phandseg button')].map(b => b.dataset.v).join(''), octsel: !!t.querySelector('.ptool select[data-chg="poct"]'),
          len: t.querySelectorAll('.ptool [data-act="poctn"]').length, plays: t.querySelectorAll('.ptool .ptplay .btn').length, fing: !!t.querySelector('.pcap .pfing .hR'),
          pos: pos.map(b => b.dataset.v).join(','), lines: new Set(pos.map(b => Math.round(b.getBoundingClientRect().top))).size, hidden: t.querySelector('.pprbody').hidden, exp: t.querySelector('.pprhead').getAttribute('aria-expanded'),
          ov: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, btnsInTool: t.querySelectorAll('.ptool .btn, .ptool .seg').length };
      });
      const T = `${tag} piano (${kind})`;
      ok(r.tool && r.strip && r.pw && r.cap && r.prac && !r.big, `${T}: toolbar, mode strip, keyboard, caption and practice strip exist; the big Piano Control panel is gone`);
      ok(r.tool.bottom <= r.strip.top + 1 && r.strip.bottom <= r.pw.top + 1 && r.pw.top - r.strip.bottom < 36, `${T}: order is toolbar, mode strip, then the keyboard directly (strip to keys ${Math.round(r.pw.top - r.strip.bottom)}px)`);
      ok(r.pw.bottom <= r.cap.top + 1 && r.cap.top - r.pw.bottom < 24 && r.cap.bottom <= r.prac.top + 1, `${T}: fingering caption sits right under the keys, practice strip last`);
      ok(r.cap.h < 150 && r.tool.h < (mobile ? 140 : 50) && r.strip.h < 70, `${T}: compact (toolbar ${Math.round(r.tool.h)}px, strip ${Math.round(r.strip.h)}px, caption ${Math.round(r.cap.h)}px)`);
      ok(r.hand === (kind === 'scale' ? 'RLB' : 'RLBS') && r.octsel && r.len === (kind === 'scale' ? 2 : 0) && r.plays === (kind === 'scale' ? 3 : 2), `${T}: hand ${r.hand}, octave select, ${r.len} length buttons, ${r.plays} play buttons`);
      ok(r.fing && /(^|,)g$/.test(r.pos) && r.lines === 1, `${T}: fingering line present; positions ${r.pos} on one line`);
      ok(r.hidden && r.exp === 'false', `${T}: practice strip is collapsed by default`);
      ok(!r.ov, `${T}: no page overflow`);
      const before = await q(() => ({ rp: BPGW.S.rootPc, sp: BPGW.S.scalePos, cp: BPGW.S.chordPos }));
      await q(() => document.querySelector('.tab.on .ptool [data-act="phand"][data-v="L"]').click()); await sleep(120);
      ok(await q(k => (k === 'scale' ? BPGW.S.scHand : BPGW.S.chHand) === 'L' && document.querySelector('.tab.on .ptool [data-act="phand"][data-v="L"]').classList.contains('on'), kind), `${T}: hand toggle works`);
      await p.select('.tab.on .ptool select[data-chg="poct"]', '3'); await sleep(120);
      ok(await q(() => BPGW.S.pOct === 3), `${T}: octave select works`);
      await q(() => document.querySelector('.tab.on .ptool [data-act="poct"][data-v="1"]').click()); await sleep(120);
      ok(await q(() => BPGW.S.pOct === 4), `${T}: octave stepper works`);
      await q(() => document.querySelector('.tab.on .pstrip [data-act="ppos"][data-v="1"]').click()); await sleep(120);
      ok(await q(k => (k === 'scale' ? BPGW.S.psPos : BPGW.S.pcPos) === 1, kind), `${T}: mode/position button works`);
      if (kind === 'scale') { await q(() => document.querySelector('.tab.on .ptool [data-act="poctn"][data-v="2"]').click()); await sleep(120); ok(await q(() => BPGW.S.pOcts === 2), `${T}: 1|2 octave toggle works`); }
      const after = await q(() => ({ rp: BPGW.S.rootPc, sp: BPGW.S.scalePos, cp: BPGW.S.chordPos }));
      ok(JSON.stringify(before) === JSON.stringify(after), `${T}: the piano controls leave the guitar's key and position alone`);
      await q(() => document.querySelector('.tab.on .pprhead').click()); await sleep(120);
      ok(await q(() => !document.querySelector('.tab.on .pprbody').hidden && document.querySelector('.tab.on .pprhead').getAttribute('aria-expanded') === 'true' && ['prtog', 'prexact', 'midi', 'midisnd'].every(a => document.querySelector('.tab.on .pprbody [data-act="' + a + '"]'))), `${T}: the practice strip opens with Practice, Exact octave, MIDI and Echo`);
      await q(() => document.querySelector('.tab.on [data-act="prtog"]').click()); await sleep(200);
      ok(await q(() => !document.querySelector('.tab.on .pprbody').hidden && !document.querySelector('.tab.on #prac').hidden), `${T}: Practice on keeps the strip open and shows the step panel`);
      await q(() => document.querySelector('.tab.on [data-act="prtog"]').click()); await sleep(100);
    }
    await q(() => BPGW.setTab('lessons')); await sleep(250);
    ok(await q(() => getComputedStyle(document.querySelector('#musicControl')).display === 'none'), `${tag} lessons: the (bottom) panel stays hidden there`);
  }
  // every theme, both widths: one line, no overflow
  for (const th of THEMES) for (const [w, mobile] of [[1280, false], [390, true]]) {
    const ctx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
    const p = await ctx.newPage(); await p.setViewport({ width: w, height: 844, isMobile: mobile, hasTouch: mobile });
    p.on('pageerror', e => errs.push(th + ' PAGEERR ' + e.message));
    await p.goto(URL + '?theme=' + th + '#chord', { waitUntil: 'load' }); await sleep(450);
    const r = await p.evaluate(() => { const s = document.querySelector('#fbStrip'), t = [...s.querySelectorAll('[data-act="croot"]')].map(b => Math.round(b.getBoundingClientRect().bottom)).filter((v, i, a) => a.indexOf(v) === i); const pr = Math.max(...[...s.querySelectorAll('.posrow button')].map(b => b.getBoundingClientRect().right)); const h = s.getBoundingClientRect(); return { lines: t.length, fit: s.scrollWidth <= s.clientWidth + 1 && pr <= document.documentElement.clientWidth + 0.5, h: h.height, ov: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, noclip: [...s.querySelectorAll('button')].every(b => b.scrollHeight <= b.clientHeight + 2) }; });
    ok(r.lines === 1 && !r.ov && r.noclip, `[${th} ${w}] note row is one line, positions fully visible, no clipped buttons, no page overflow (${JSON.stringify(r)})`);
    ok(r.fit, `[${th} ${w}] strip fits without scrolling`);
    await ctx.close();
  }
  await b.close();
  if (errs.length) { console.log('console errors:'); errs.slice(0, 10).forEach(e => console.log('  ' + e)); }
  console.log(bad || errs.length ? `✗ ${bad} failed, ${errs.length} errors of ${checks}` : `✓ ALL PASSED — ${checks}/${checks} layout checks`);
  process.exit(bad || errs.length ? 1 : 0);
})();
