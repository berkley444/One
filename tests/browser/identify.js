/* Clear / Identify, Chord Quiz and the optional chord-unlock gate, driven with real mouse clicks (desktop) and real touch taps (phone).
   Run:  python3 -m http.server 8123   then   BPGW_URL=http://localhost:8123/index.html NODE_PATH=/path/to/puppeteer-core/.. node tests/browser/identify.js */
const puppeteer = require('puppeteer-core');
const URL = process.env.BPGW_URL || 'file:///workspace/One_repo/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  let checks = 0, bad = 0; const errs = [];
  const ok = (c, l) => { checks++; if (!c) { bad++; console.log('  ✗', l); } };
  for (const [w, mobile] of [[1280, false], [390, true]]) {
    const tag = `[${w}]`;
    let ctx = null, p = null;
    const mk = async () => {                       // a brand-new browser context = empty localStorage / sessionStorage
      if (ctx) await ctx.close();
      ctx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
      p = await ctx.newPage(); await p.setViewport({ width: w, height: mobile ? 844 : 900, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
      p.on('pageerror', e => errs.push(tag + ' PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(tag + ' ' + m.text()); });
    };
    const q = (f, a) => p.evaluate(f, a);
    const fresh = async (hash = '#play', qs = '') => { await mk(); await p.goto(URL + qs + hash, { waitUntil: 'load' }); await sleep(450); };
    // a real tap/click on a cell (scrolled into view first: the board scrolls sideways on a phone)
    const tap = async (sel) => {
      await q(sel => { const e = document.querySelector(sel); e.scrollIntoView({ inline: 'center', block: 'center' }); }, sel); await sleep(40);
      const r = await q(sel => { const e = document.querySelector(sel), b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, ok: !!e }; }, sel);
      if (mobile) await p.touchscreen.tap(r.x, r.y); else await p.mouse.click(r.x, r.y);
      await sleep(30);
    };
    const cell = (si, f, board = 'main') => `[data-idc="${board}"][data-si="${si}"][data-f="${f}"]`;
    const place = async (shape, board = 'main') => { for (let si = 0; si < shape.length; si++) { const c = shape[si]; if (c === 'x') { await tap(cell(si, 0, board)); await tap(cell(si, 0, board)); } else await tap(cell(si, parseInt(c, 16), board)); } };
    const text = sel => q(sel => (document.querySelector(sel) || {}).textContent || '', sel);
    const noOverflow = () => q(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
    const shape = () => q(() => (document.querySelector('.idshape code') || {}).textContent);

    /* ---- default theme and the toolbar buttons ---- */
    await fresh();
    ok(await q(() => document.documentElement.dataset.theme === 'minimal'), `${tag} Minimal Light is the default theme`);
    ok(await q(() => !!document.querySelector('[data-act="idtoggle"]') && !!document.querySelector('[data-act="quiztoggle"]')), `${tag} Clear/Identify and Chord Quiz buttons are on the fretboard toolbar`);
    ok(await q(() => !document.querySelector('.idc')), `${tag} the normal board has no note-placing cells`);

    /* ---- identify: enter, place open C, read the answer ---- */
    await tap('[data-act="idtoggle"]'); await sleep(150);
    ok(await q(() => document.querySelectorAll('.idc').length >= 6 * 16), `${tag} entering shows a cell for every string and fret`);
    ok(await q(() => document.querySelector('#idPanel') && /Place some notes/.test(document.querySelector('#idRes').textContent)), `${tag} cleared board asks for notes`);
    ok(await q(() => document.querySelector('#tab-play [data-act="idtoggle"]').getAttribute('aria-pressed') === 'true'), `${tag} toggle shows as pressed`);
    ok(await q(() => !document.querySelector('[data-act="idclear"]:not([disabled])')), `${tag} Clear board is disabled while empty`);
    await place('x32010');
    ok(await text('.idbig') === 'C', `${tag} open C x32010 is named C (got "${await text('.idbig')}")`);
    ok(/C E G/.test(await text('.idsub2')) || /C.*E.*G/.test(await text('#idRes')), `${tag} result lists the notes C E G`);
    ok(await shape() === 'x 3 2 0 1 0', `${tag} shape text x 3 2 0 1 0 (got ${await shape()})`);
    ok(await q(() => /id=x,3,2,0,1,0/.test(location.hash)), `${tag} hash records the placement (${await q(() => location.hash)})`);
    ok(await q(() => document.querySelectorAll('.idc.on').length === 5), `${tag} five dots on the board (open strings are dots too)`);
    ok(await q(() => { const d = [...document.querySelectorAll('.idc.on')].map(g => g.textContent.replace(/\s+/g, '')); return d.some(t => /^C/.test(t)) && d.some(t => /^E/.test(t)) && d.some(t => /^G/.test(t)); }), `${tag} dots show note names`);
    ok(await q(() => [...document.querySelectorAll('.idc.on .dot')].map(d => d.dataset.tone).sort().join() === 'root,root,third,third,fifth'.split(',').sort().join()), `${tag} dots are coloured root/third/fifth`);
    ok(await q(() => document.querySelector('.idc[data-si="0"][data-f="0"]').getAttribute('aria-pressed') === 'true'), `${tag} the muted string is marked pressed`);
    ok(await q(() => /Cmajor|C major|root position/i.test(document.querySelector('#idRes').textContent)), `${tag} detail mentions the chord quality / position`);
    ok(await noOverflow(), `${tag} no page overflow in identify mode`);
    // cycle the open column: open ○ → muted × → blank, and remove / move notes
    await tap(cell(5, 0)); ok(await shape() === 'x 3 2 0 1 x', `${tag} open then muted gives x (${await shape()})`);
    await tap(cell(5, 0)); ok(await shape() === 'x 3 2 0 1 x'.replace('1 x', '1 x') && (await q(() => BPGW.idFretsNow()[5])) === null, `${tag} muted then blank`);
    await tap(cell(1, 3)); ok(await shape() === 'x x 2 0 1 x', `${tag} tapping a placed fret removes it (${await shape()})`);
    await tap(cell(1, 3)); await tap(cell(1, 5)); ok((await q(() => BPGW.idFretsNow()[1])) === 5, `${tag} tapping another fret moves the note`);
    ok(await q(() => /id=/.test(location.hash)), `${tag} hash follows edits`);
    // build clean: clear and place again
    await tap('[data-act="idclear"]'); await sleep(100);
    ok(await q(() => document.querySelectorAll('.idc.on').length === 0 && /Place some notes/.test(document.querySelector('#idRes').textContent)), `${tag} Clear board empties the fretboard`);

    /* ---- many chords through the real UI ---- */
    const cases = [['022100', 'E'], ['x02210', 'Am'], ['x02220', 'A'], ['320003', 'G'], ['xx0232', 'D'], ['x32310', 'C7'], ['x24342', 'Bmaj7'], ['xx2010', 'C/E'], ['x02200', 'Asus2'], ['133211', 'F'], ['355xxx', 'G5']];
    for (const [sh, name] of cases) { await tap('[data-act="idclear"]'); await place(sh); const got = await text('.idbig'); ok(got === name || got.startsWith(name), `${tag} ${sh} → ${name} (got "${got}")`); }
    // interval and unknown
    await tap('[data-act="idclear"]'); await place('x32xxx'); ok(/major 3rd/.test(await text('.idbig')), `${tag} two notes name the interval (${await text('.idbig')})`);
    ok(await q(() => /Could grow into/.test(document.querySelector('#idRes').textContent)), `${tag} an interval suggests chords`);
    await tap('[data-act="idclear"]'); await place('x3xx3x');
    ok(/No chord match|major|minor|interval|3rd|4th|5th|6th|7th|Csus|C5/i.test(await text('.idbig')), `${tag} odd two-note set still gets a title (${await text('.idbig')})`);
    // alternatives
    await tap('[data-act="idclear"]'); await place('x3221x'); ok(/Am\/C/.test(await text('.idbig')) && /C6/.test(await text('.idalt')), `${tag} ambiguous voicing lists the other name (${await text('.idbig')} | ${await text('.idalt')})`);

    /* ---- piano ---- */
    await tap('[data-act="idclear"]'); await place('x32010');
    await tap('[data-act="idpiano"]'); await sleep(200);
    ok(await q(() => document.querySelector('[data-act="idpiano"]').getAttribute('aria-pressed') === 'true'), `${tag} Show on piano is on`);
    ok(await q(() => document.querySelectorAll('#tab-play .pk.target, #tab-play .pk.hit, #tab-play .pk.on, #tab-play .pk.sel').length >= 3 || /from your fretboard/.test(document.querySelector('#tab-play .pianoblock, #tab-play').textContent)), `${tag} the piano shows the placed notes`);
    await tap('[data-act="idpiano"]');

    /* ---- reload restores from the hash and from localStorage ---- */
    const hash = await q(() => location.hash);
    await p.reload({ waitUntil: 'load' }); await sleep(300);
    ok(await q(() => !!document.querySelector('.idc')) && await text('.idbig') === 'C', `${tag} reload keeps the placement (${await text('.idbig')})`);
    await p.goto(URL + hash, { waitUntil: 'load' }); await sleep(300);
    ok(await shape() === 'x 3 2 0 1 0', `${tag} the hash link restores x32010`);
    ok(await q(() => JSON.parse(localStorage.getItem('bpgw.v3')).idFrets.join() === '-1,3,2,0,1,0'), `${tag} placement is saved in bpgw.v3`);
    ok(await q(() => JSON.parse(localStorage.getItem('bpgw.v3')).idOn === undefined || JSON.parse(localStorage.getItem('bpgw.v3')).idOn === false), `${tag} the mode itself is not persisted (app opens normally next time)`);

    /* ---- tuning change keeps the notes by fret and re-names them ---- */
    await q(() => { const s = document.querySelector('#tuningSel, select[data-sel="tuning"], #tunSel'); if (s) { s.value = 'dadgad'; s.dispatchEvent(new Event('change', { bubbles: true })); } else BPGW.S.tuning = 'dadgad', BPGW.render(); });
    await sleep(200);
    ok(await q(() => /DADGAD/.test(document.querySelector('.idpanel .hint').textContent)), `${tag} tuning is shown in the panel`);
    ok(await text('.idbig') !== 'C', `${tag} other tuning names the same frets differently (${await text('.idbig')})`);
    await q(() => { BPGW.S.tuning = 'standard'; BPGW.render(); });

    /* ---- exit ---- */
    await tap('[data-act="idexit"]'); await sleep(150);
    ok(await q(() => !document.querySelector('.idc') && !document.querySelector('#idPanel')), `${tag} Exit returns to the normal board`);
    ok(await q(() => !/id=/.test(location.hash)), `${tag} exit clears id= from the hash`);

    /* ---- Chord Quiz ---- */
    await fresh(); await tap('[data-act="quiztoggle"]'); await sleep(200);
    ok(await q(() => !!document.querySelector('#qName') && document.querySelector('#qName').textContent.length >= 1), `${tag} quiz shows a target chord`);
    ok(await q(() => document.querySelectorAll('.idc.on').length === 0), `${tag} quiz starts with a cleared fretboard`);
    ok(await q(() => !/id=/.test(location.hash)), `${tag} quiz does not write the answer-shaped hash`);
    ok(await q(() => ['C', 'A', 'G', 'E', 'D', 'Am', 'Em', 'Dm'].includes(document.querySelector('#qName').textContent)), `${tag} first level is open majors/minors`);
    // force a known target through the app's own test hook, then answer it with taps
    const setTarget = async (root, quality, bass) => q(([r, ql, bs]) => { BPGW.UI.quiz.target = BPGW.Theory.makeTarget(r, ql, bs); BPGW.UI.quiz.res = null; BPGW.UI.quiz.revealed = false; BPGW.UI.quiz.counted = false; BPGW.UI.qFrets = []; BPGW.render(); }, [root, quality, bass]);
    await setTarget('C', 'major'); ok(await text('#qName') === 'C', `${tag} target set to C`);
    await tap('[data-act="qcheck"]'); ok(/Nothing placed/.test(await text('#idRes')), `${tag} Check with nothing placed says so`);
    ok(await q(() => BPGW.S.quiz.total === 0), `${tag} an empty Check is not scored`);
    await place('x32010'); await tap('[data-act="qcheck"]'); await sleep(150);
    ok(/Correct/.test(await text('#idRes')), `${tag} correct answer is accepted`);
    ok(await q(() => BPGW.S.quiz.right === 1 && BPGW.S.quiz.total === 1 && BPGW.S.quiz.streak === 1), `${tag} score 1/1, streak 1`);
    ok(/1\/1/.test(await text('.idscore')), `${tag} score shown`);
    await tap('[data-act="qnext"]'); await sleep(100); ok(await q(() => document.querySelectorAll('.idc.on').length === 0), `${tag} Next clears the board`);
    await setTarget('A', 'minor'); await place('x02220'); await tap('[data-act="qcheck"]');
    ok(/Not quite/.test(await text('#idRes')) && /3rd|C/.test(await text('#idRes')), `${tag} wrong answer is explained (${(await text('#idRes')).replace(/\s+/g, ' ').slice(0, 100)})`);
    ok(await q(() => BPGW.S.quiz.right === 1 && BPGW.S.quiz.total === 2 && BPGW.S.quiz.streak === 0 && BPGW.S.quiz.best === 1), `${tag} a miss resets the streak, keeps the best`);
    await tap('[data-act="qcheck"]'); ok(await q(() => BPGW.S.quiz.total === 2), `${tag} checking the same target again is not double counted`);
    ok(await q(() => document.querySelectorAll('.idc .dot[data-tone="bad"]').length === 1), `${tag} the extra note is marked on the board`);
    await tap('[data-act="qshow"]'); await sleep(150);
    ok(/Answer: Am/.test(await text('#idRes')) && await q(() => document.querySelectorAll('.idc.on').length >= 4), `${tag} Show answer fills the board and names it`);
    await tap('[data-act="qnext"]');
    await setTarget('G', 'major', 'B'); ok(/lowest note you play must be B/.test(await text('.qtarget')), `${tag} slash target explains the bass`);
    await place('x20033'); await tap('[data-act="qcheck"]'); ok(/Correct/.test(await text('#idRes')), `${tag} G/B (x20033) is correct`);
    await tap('[data-act="idclear"]'); await place('320003'); await tap('[data-act="qcheck"]'); ok(/Not quite/.test(await text('#idRes')) && /lowest note/.test(await text('#idRes')), `${tag} G with G in the bass is not G/B`);
    // levels and position select
    await tap('[data-act="qlevel"][data-v="sevenths"]'); await sleep(100); ok(await q(() => BPGW.S.quiz.level === 'sevenths') && /7|maj7|m7/.test(await text('#qName')), `${tag} 7th level gives sevenths (${await text('#qName')})`);
    await tap('[data-act="qlevel"][data-v="all"]'); ok(await q(() => BPGW.S.quiz.level === 'all'), `${tag} all-qualities level`);
    await tap('[data-act="qlevel"][data-v="open"]');
    await setTarget('C', 'major'); await q(() => { const s = document.querySelector('#qPos'); s.value = '1'; s.dispatchEvent(new Event('change', { bubbles: true })); }); await sleep(100);
    ok(await q(() => BPGW.S.quiz.pos === '1') && /position 1/.test(await text('.qtarget')), `${tag} a specific position can be asked for`);
    await q(() => { BPGW.UI.quiz.target = BPGW.Theory.makeTarget('C', 'major'); BPGW.render(); });
    await place('x35553'); await tap('[data-act="qcheck"]'); ok(/Not quite/.test(await text('#idRes')) && /position/.test(await text('#idRes')), `${tag} right notes in the wrong position are not accepted for a position question (${(await text('#idRes')).replace(/\s+/g, ' ').slice(0, 120)})`);
    await q(() => { const s = document.querySelector('#qPos'); s.value = 'any'; s.dispatchEvent(new Event('change', { bubbles: true })); });
    // score persists
    const sc = await q(() => JSON.stringify(BPGW.S.quiz)); await p.reload({ waitUntil: 'load' }); await sleep(250);
    ok(await q(() => { const s = JSON.parse(localStorage.getItem('bpgw.v3')).quiz; return s.total >= 4 && s.best >= 1; }), `${tag} score and streak are saved in localStorage (${sc})`);
    ok(await q(() => !document.querySelector('.idc')), `${tag} reload leaves quiz mode (the app opens normally)`);
    // exit from quiz
    await tap('[data-act="quiztoggle"]'); await tap('[data-act="idexit"]'); ok(await q(() => !document.querySelector('#idPanel')), `${tag} quiz Exit`);

    /* ---- chord unlock gate ---- */
    await fresh(); ok(await q(() => document.querySelector('#gate').hidden && !document.body.classList.contains('gating')), `${tag} the gate is OFF by default`);
    ok(await q(() => JSON.parse(localStorage.getItem('bpgw.v3') || '{}').gateOn !== true), `${tag} gateOn is false by default`);
    await tap('#gateBtn'); ok(await q(() => !document.querySelector('#gatePanel').hidden && /not security/i.test(document.querySelector('#gatePanel').textContent)), `${tag} lock menu opens and says it is not security`);
    ok(await q(() => document.querySelector('#gateBtn').getAttribute('aria-expanded') === 'true'), `${tag} lock button aria-expanded`);
    await q(() => { const s = document.querySelector('#gRoot'); s.value = 'G'; s.dispatchEvent(new Event('change', { bubbles: true })); const t = document.querySelector('#gQ'); t.value = 'major'; t.dispatchEvent(new Event('change', { bubbles: true })); });
    ok(await text('#gTarget') === 'G', `${tag} choose the chord to play`);
    await tap('[data-act="gatetoggle"]'); ok(await q(() => BPGW.S.gateOn === true), `${tag} turned on`);
    ok(await q(() => document.querySelector('#gate').hidden), `${tag} turning on does not lock the current session`);
    await tap('[data-act="gatetry"]'); await sleep(150);
    ok(await q(() => !document.querySelector('#gate').hidden && /Play G to come in/.test(document.querySelector('#gateTitle').textContent) && /not security/.test(document.querySelector('#gate').textContent)), `${tag} preview shows the unlock card and its label`);
    ok(await q(() => document.querySelector('.wrap').inert === true), `${tag} the app behind it is inert`);
    ok(await noOverflow(), `${tag} gate has no page overflow`);
    await place('320003', 'gate'); await sleep(1300);
    ok(await q(() => document.querySelector('#gate').hidden), `${tag} playing G opens the gate`);
    ok(await q(() => sessionStorage.getItem('bpgw.gate.ok') === '1'), `${tag} session flag set`);
    // next visit in the same session: no gate; a new session: gate
    await p.reload({ waitUntil: 'load' }); await sleep(300); ok(await q(() => document.querySelector('#gate').hidden), `${tag} no gate again in the same session`);
    await q(() => sessionStorage.clear()); await p.reload({ waitUntil: 'load' }); await sleep(400);
    ok(await q(() => !document.querySelector('#gate').hidden && document.body.classList.contains('gating')), `${tag} a new session shows the gate`);
    // wrong chord: explained, stays shut
    await place('x32010', 'gate'); await sleep(200);
    ok(await q(() => !document.querySelector('#gate').hidden && /You are playing C/.test(document.querySelector('#gateRes').textContent)), `${tag} wrong chord stays locked and says what you played`);
    // the app is not reachable by keyboard while it is open
    await p.keyboard.press('Tab'); ok(await q(() => !!document.activeElement.closest('#gate')), `${tag} focus stays inside the gate`);
    await tap('[data-act="gateclear"]'); await tap('[data-act="gateshow"]'); await sleep(1300);
    ok(await q(() => document.querySelector('#gate').hidden), `${tag} "Show me" also lets you in (the gate never traps)`);
    // turn it off again
    await tap('#gateBtn'); await tap('[data-act="gatetoggle"]'); ok(await q(() => BPGW.S.gateOn === false), `${tag} turned off again`);
    await p.keyboard.press('Escape'); ok(await q(() => document.querySelector('#gatePanel').hidden), `${tag} Escape closes the lock menu`);
    await q(() => sessionStorage.clear()); await p.reload({ waitUntil: 'load' }); await sleep(300); ok(await q(() => document.querySelector('#gate').hidden), `${tag} off means no gate`);

    /* ---- every theme: identify board is readable and the page fits ---- */
    for (const th of ['minimal', 'silver', 'console', 'pedal', 'tube', 'minimal-dark', 'synth', 'wood']) {
      await fresh('#play', '?theme=' + th); await tap('[data-act="idtoggle"]'); await place('x32010'); await sleep(80);
      ok(await q(t => (document.documentElement.dataset.theme || 'silver') === t, th), `${tag} theme ${th} applied`);
      ok(await text('.idbig') === 'C' && await noOverflow(), `${tag} ${th}: identify works and fits`);
    }
    ok(await q(() => document.querySelectorAll('.idc.on').length === 5), `${tag} dots visible in last theme`);

    /* ---- keyboard: arrow keys move between cells, Enter places ---- */
    await fresh(); await tap('[data-act="idtoggle"]'); await q(() => document.querySelector('.idc[data-si="1"][data-f="3"]').focus());
    await p.keyboard.press('Enter'); ok(await shape() === 'x 3 x x x x', `${tag} Enter places a note (${await shape()})`);
    await p.keyboard.press('ArrowDown'); ok(await q(() => document.activeElement.dataset.si === '0'), `${tag} ArrowDown moves to the next lower string (the board draws the high string on top)`);
    await p.keyboard.press('ArrowUp'); await p.keyboard.press('ArrowUp'); ok(await q(() => document.activeElement.dataset.si === '2'), `${tag} ArrowUp moves up a string`);
    await p.keyboard.press('ArrowRight'); ok(await q(() => document.activeElement.dataset.f === '4'), `${tag} ArrowRight moves to the next fret`);
    await p.keyboard.press('Space'); ok((await shape()).startsWith('x 3 4'), `${tag} Space places too (${await shape()})`);
    ok(await q(() => document.activeElement.classList.contains('idc')), `${tag} focus stays on the board after placing`);
    await ctx.close();
  }
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  if (errs.length) bad++;
  console.log(`${bad ? '✗ FAILED' : '✓ ALL PASSED'} — ${checks - bad}/${checks} identify/quiz/gate checks`);
  await b.close(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
