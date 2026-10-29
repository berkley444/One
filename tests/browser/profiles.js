/* On-device profiles (headless Chrome): migration of the pre-profiles keys, the first-visit welcome, isolation between musicians,
 * create / rename / recolour / delete-with-confirm / switch, export + import (incl. hostile files), the LocalStore interface on its own,
 * keyboard + focus + axe on the panel and the welcome, phone (390) and desktop (1280).
 *   BPGW_URL=http://localhost:8123/index.html node tests/browser/profiles.js */
const puppeteer = require('puppeteer-core'); const fs = require('fs'); const os = require('os'); const path = require('path');
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const URL0 = process.env.BPGW_URL || 'http://localhost:8123/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let checks = 0, bad = 0; const errs = [];
const ok = (c, l) => { checks++; if (!c) { bad++; console.log('  ✗', l); } };
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  for (const [w, mobile] of [[1280, false], [390, true]]) {
    const tag = `[${w}]`;
    const mk = async ({ human = false, seed = null } = {}) => {                    // human: navigator.webdriver is false, so the first-visit welcome is shown
      const ctx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
      const p = await ctx.newPage(); await p.setViewport({ width: w, height: 844, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
      p.on('pageerror', e => errs.push(tag + ' PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errs.push(tag + ' ' + m.text()); });
      if (human) await p.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
      if (seed) await p.evaluateOnNewDocument(sd => { if (!sessionStorage.getItem('__seeded')) { sessionStorage.setItem('__seeded', '1'); for (const k in sd) localStorage.setItem(k, sd[k]); } }, seed);
      await p.goto(URL0, { waitUntil: 'load' }); await sleep(450);
      return { ctx, p, q: (f, a) => p.evaluate(f, a) };
    };
    const nav = async (p, fn) => { await Promise.all([p.waitForNavigation({ waitUntil: 'load' }), fn()]); await sleep(450); };
    const openPanel = async (p) => { await p.click('#profileBtn'); await sleep(150); };

    /* ---------- 1. migration: existing data lands in a default profile, nothing lost ---------- */
    {
      const legacy = { quiz: { level: 'open', pos: 'any', right: 9, total: 12, streak: 3, best: 7 }, lessons: { 'l1/a': { acc: 90, ms: 5000, wrong: 1, perfect: false, at: 1 } }, gateOn: false, gateRoot: 'G', tempo: 133, scale: 'dorian', rootPc: 9, labels: 'intervals', vol: 0.4 };
      const seed = { 'bpgw.v3': JSON.stringify(legacy), 'bpgw.theme': 'tube' };
      const { ctx, p, q } = await mk({ human: true, seed });
      const ix = await q(() => BPGW.PS.index());
      ok(ix.list.length === 1 && ix.active === ix.list[0].id && ix.list[0].name === 'Musician 1', `${tag} migration: one default profile exists (${JSON.stringify(ix.list)})`);
      ok(ix.welcomed === true && await q(() => document.getElementById('welcome').hidden), `${tag} migration: an existing visitor is not asked "Who's playing?"`);
      const st = await q(() => BPGW.stored());
      ok(st.quiz.right === 9 && st.quiz.total === 12 && st.quiz.streak === 3 && st.quiz.best === 7, `${tag} migration keeps the quiz score / streak / best`);
      ok(st.lessons['l1/a'] && st.lessons['l1/a'].acc === 90, `${tag} migration keeps lesson progress`);
      ok(st.tempo === 133 && st.scale === 'dorian' && st.rootPc === 9 && st.labels === 'intervals' && st.vol === 0.4 && st.gateRoot === 'G', `${tag} migration keeps all saved settings`);
      ok(await q(() => BPGW.PS.readData(BPGW.ME.id).theme === 'tube') && await q(() => document.documentElement.dataset.theme === 'tube'), `${tag} migration keeps the theme and applies it before paint`);
      ok(await q(() => BPGW.S.quiz.best === 7 && BPGW.S.tempo === 133 && Object.keys(BPGW.S.lessons).length === 1), `${tag} the running app uses the migrated values`);
      ok(await q(() => localStorage.getItem('bpgw.v3') !== null && localStorage.getItem('bpgw.theme') === 'tube' && JSON.parse(localStorage.getItem('bpgw.v3')).quiz.best === 7), `${tag} the old keys are left untouched as a backup`);
      await q(() => { BPGW.S.tempo = 150; BPGW.S.quiz.best = 8; document.querySelector('#themeBtn').click(); });
      await q(() => document.querySelector('#themePanel [data-v="wood"]').click()); await sleep(150);
      await p.goto(URL0, { waitUntil: 'load' }); await sleep(400);
      ok(await q(() => BPGW.PS.index().list.length === 1 && document.documentElement.dataset.theme === 'wood'), `${tag} a second load reuses the profile (no second migration) and the new theme choice`);
      ok(await q(() => JSON.parse(localStorage.getItem('bpgw.v3')).tempo === 133 && JSON.parse(localStorage.getItem('bpgw.p.' + BPGW.ME.id)).theme === 'wood'), `${tag} new saves go to the profile, not the old keys`);
      await ctx.close();
    }

    /* ---------- 2. first visit: skippable welcome ---------- */
    {
      const { ctx, p, q } = await mk({ human: true });
      ok(await q(() => !document.getElementById('welcome').hidden && /Who's playing/.test(document.getElementById('welcome').textContent)), `${tag} first visit shows "Who's playing?"`);
      ok(await q(() => { const d = document.getElementById('welcome'); return d.getAttribute('role') === 'dialog' && d.getAttribute('aria-modal') === 'true' && document.activeElement.id === 'welcomeTitle' && document.querySelector('.wrap').inert; }), `${tag} the welcome is a modal dialog, focus is in it, the page behind is inert`);
      ok(await q(() => BPGW.PS.index().welcomed === false), `${tag} not marked as welcomed until dismissed`);
      await p.click('#welcome form button[type=submit]'); await sleep(100);
      ok(await q(() => !document.getElementById('welcome').hidden && /Type a name/.test(document.querySelector('#welcome .pfErr').textContent)), `${tag} Start without a name explains what to do`);
      await p.type('#pfName', 'jeremy'); await p.click('#welcome [data-pf=color][data-c="#0f766e"]'); await sleep(60);
      ok(await q(() => document.querySelector('#pfName').value === 'jeremy' && document.querySelector('#welcome .pfPrev .av').textContent === 'J'), `${tag} the name survives a colour change and the avatar shows its initial`);
      await p.click('#welcome form button[type=submit]'); await sleep(150);
      ok(await q(() => document.getElementById('welcome').hidden && !document.querySelector('.wrap').inert && !document.body.classList.contains('gating')), `${tag} Start closes the welcome and un-blocks the page`);
      ok(await q(() => { const m = BPGW.PS.active(); return m.name === 'jeremy' && m.color === '#0f766e' && BPGW.PS.index().welcomed === true; }), `${tag} Start names the default profile (no second profile created)`);
      ok(await q(() => { const b = document.querySelector('#profileBtn .av'); return b.textContent === 'J' && getComputedStyle(b).backgroundColor === 'rgb(15, 118, 110)'; }), `${tag} the header avatar shows J on teal`);
      await p.goto(URL0, { waitUntil: 'load' }); await sleep(300);
      ok(await q(() => document.getElementById('welcome').hidden), `${tag} the welcome does not come back`);
      await ctx.close();
      const s2 = await mk({ human: true });
      await s2.p.keyboard.press('Escape'); await sleep(100);
      ok(await s2.q(() => document.getElementById('welcome').hidden && BPGW.PS.index().welcomed === true && BPGW.PS.active().name === 'Musician 1' && document.activeElement.id === 'profileBtn'), `${tag} Escape skips: default "Musician 1" is kept, focus goes to the profile button`);
      await s2.ctx.close();
      const s3 = await mk({ human: true });
      await s3.p.click('#welcome [data-pf=skip]'); await sleep(100);
      ok(await s3.q(() => document.getElementById('welcome').hidden && BPGW.PS.index().list.length === 1), `${tag} "Skip for now" works`);
      await s3.ctx.close();
      const s4 = await mk();                                                                     // automated browsers (navigator.webdriver) are never asked
      ok(await s4.q(() => document.getElementById('welcome').hidden), `${tag} automated browsers skip the welcome`);
      await s4.ctx.close();
    }

    /* ---------- 3. header button + panel basics ---------- */
    {
      const { ctx, p, q } = await mk();
      const g = await q(() => { const r = s => { const e = document.querySelector(s).getBoundingClientRect(); return { l: e.left, r: e.right, t: e.top, b: e.bottom, w: e.width, h: e.height }; }; return { lock: r('#gateBtn'), prof: r('#profileBtn'), pal: r('#themeBtn'), h1: r('header h1') }; });
      ok(g.prof.l > g.lock.r && g.prof.r <= g.pal.l && Math.abs(g.prof.t - g.pal.t) < 2 && g.prof.w >= 36 && g.prof.h >= 36, `${tag} profile button sits between the lock and the palette, same row, tap-size (${JSON.stringify(g.prof)})`);
      ok(await q(() => { const s = document.querySelector('header h1').getBoundingClientRect(), t = document.querySelector('#profileBtn').getBoundingClientRect(); const r = document.createRange(); r.selectNodeContents(document.querySelector('header h1').firstChild); return [...r.getClientRects()].every(x => x.right <= t.left + 1 || x.top >= t.bottom - 1 || x.bottom <= t.top + 1); }), `${tag} the title text does not run under the profile button`);
      ok(await q(() => document.querySelector('#profileBtn').getAttribute('aria-haspopup') === 'dialog' && /Playing as Musician 1/.test(document.querySelector('#profileBtn').textContent) && document.querySelector('#profilePanel').getAttribute('aria-label') === 'Musicians'), `${tag} button name says who is playing; the panel is a labelled dialog`);
      await openPanel(p);
      ok(await q(() => !document.getElementById('profilePanel').hidden && document.getElementById('profileBtn').getAttribute('aria-expanded') === 'true' && document.activeElement.classList.contains('pfWho')), `${tag} the button opens the panel and focus moves into it`);
      ok(await q(() => document.querySelectorAll('#profilePanel .pfRow').length === 1 && !document.querySelector('#profilePanel [data-pf=del]')), `${tag} the only musician cannot be deleted (no Delete button)`);
      await p.keyboard.press('Escape'); await sleep(100);
      ok(await q(() => document.getElementById('profilePanel').hidden && document.activeElement.id === 'profileBtn'), `${tag} Escape closes the panel and returns focus`);
      await openPanel(p); await p.click('#themeBtn'); await sleep(150);
      ok(await q(() => document.getElementById('profilePanel').hidden && !document.getElementById('themePanel').hidden), `${tag} opening the theme picker closes the musicians panel`);
      await p.keyboard.press('Escape'); await openPanel(p); await p.mouse.click(w / 2, 700); await sleep(150);
      ok(await q(() => document.getElementById('profilePanel').hidden), `${tag} clicking outside closes the panel`);
      await ctx.close();
    }

    /* ---------- 4. create, isolation, rename, delete ---------- */
    {
      const { ctx, p, q } = await mk();
      const A = await q(() => BPGW.ME.id);
      const dirty = () => q(() => { BPGW.S.tempo = 144; BPGW.S.scale = 'dorian'; BPGW.S.quiz.right = 5; BPGW.S.quiz.total = 6; BPGW.S.quiz.streak = 4; BPGW.S.quiz.best = 5; BPGW.S.lessons = { 'x/y': { acc: 80, ms: 1000, wrong: 2, perfect: false, at: 5 } }; BPGW.S.gateOn = true; });
      await dirty(); await q(() => BPGW.setTheme('tube'));                                         // setTheme saves the theme; the switch itself saves S first (profileSwitch -> save())
      await openPanel(p);
      await p.click('#profilePanel [data-pf=new]'); await sleep(100);
      ok(await q(() => document.activeElement.id === 'pfName' && !!document.querySelector('#profilePanel form')), `${tag} "+ New musician" opens a form with the name field focused`);
      await p.click('#profilePanel form button[type=submit]'); await sleep(100);
      ok(await q(() => /name/i.test(document.querySelector('#profilePanel .pfErr').textContent)), `${tag} an empty name is refused with a message`);
      await p.type('#pfName', 'Sam'); await p.click('#profilePanel [data-pf=color][data-c="#d6336c"]');
      await nav(p, () => p.click('#profilePanel form button[type=submit]'));
      const B = await q(() => BPGW.ME.id);
      ok(B !== A && await q(() => BPGW.PS.active().name === 'Sam' && BPGW.PS.active().color === '#d6336c'), `${tag} creating a musician switches to them (page reloaded)`);
      ok(await q(() => BPGW.S.tempo === 100 && BPGW.S.scale === 'major' && BPGW.S.quiz.best === 0 && BPGW.S.quiz.total === 0 && Object.keys(BPGW.S.lessons).length === 0 && BPGW.S.gateOn === false && document.documentElement.dataset.theme === 'minimal'), `${tag} the new musician starts clean: defaults, quiz 0, no lessons, gate off, default theme`);
      ok(await q(() => !document.body.classList.contains('gating')), `${tag} the unlock gate (off for Sam) is not shown`);
      await q(() => { BPGW.S.tempo = 77; BPGW.S.quiz.best = 2; BPGW.S.lessons = { 'z/z': { acc: 50, ms: 1, wrong: 0, perfect: false, at: 1 } }; BPGW.setTheme('sheet'); });
      // switch back to the first musician
      await p.keyboard.press('Escape'); await openPanel(p);
      ok(await q(() => document.querySelectorAll('#profilePanel .pfRow').length === 2 && document.querySelector('#profilePanel .pfRow.on .pfName').textContent === 'Sam' && document.querySelectorAll('#profilePanel [data-pf=del]').length === 2), `${tag} the panel lists both musicians, Sam is marked "Playing"`);
      await nav(p, () => p.click(`#profilePanel [data-pf=switch][data-id="${A}"]`));
      ok(await q(a => BPGW.ME.id === a && document.documentElement.dataset.theme === 'tube', A), `${tag} switching back restores the first musician's theme`);
      ok(await q(() => BPGW.S.tempo === 144 && BPGW.S.scale === 'dorian' && BPGW.S.quiz.best === 5 && BPGW.S.quiz.streak === 4 && BPGW.S.lessons['x/y'] && BPGW.S.gateOn === true), `${tag} ...and their settings, quiz score / streak / best, lesson progress and unlock setting`);
      ok(await q(() => location.hash.length < 5 || !/tempo/.test(location.hash)), `${tag} the URL hash of the other musician did not leak`);
      ok(await q(B2 => { const d = BPGW.PS.readData(B2); return d.state.tempo === 77 && d.state.quiz.best === 2 && d.state.lessons['z/z'] && d.theme === 'sheet' && d.state.gateOn !== true; }, B), `${tag} Sam's stored data is untouched by the first musician's session`);
      // gate: the first musician's unlock setting applies on switch (session flag cleared)
      ok(await q(() => BPGW.S.gateOn === true && !document.getElementById('gate').hidden), `${tag} switching to a musician with the unlock on asks the chord question again`);
      await q(() => { BPGW.gateClose(); BPGW.S.gateOn = false; });
      // rename + recolour
      await openPanel(p); await p.click(`#profilePanel [data-pf=edit][data-id="${B}"]`); await sleep(100);
      ok(await q(() => document.getElementById('pfName').value === 'Sam' && document.querySelector('.pfSw[aria-checked=true]').dataset.c === '#d6336c'), `${tag} Edit opens the form with the current name and colour`);
      await p.click('#pfName', { clickCount: 3 }); await p.type('#pfName', 'Musician 1'); await p.click('#profilePanel form button[type=submit]'); await sleep(100);
      ok(await q(() => /already/.test(document.querySelector('#profilePanel .pfErr').textContent)), `${tag} a duplicate name is refused`);
      await p.click('#pfName', { clickCount: 3 }); await p.type('#pfName', 'Samira'); await p.keyboard.press('Tab'); await p.keyboard.press('ArrowRight'); await sleep(50);
      ok(await q(() => document.querySelector('.pfSw[aria-checked=true]').dataset.c !== '#d6336c' && document.activeElement.classList.contains('pfSw')), `${tag} arrow keys move through the colour swatches`);
      await p.click('#profilePanel form button[type=submit]'); await sleep(150);
      const sam = await q(b2 => BPGW.PS.get(b2), B);
      ok(sam.name === 'Samira' && sam.color !== '#d6336c', `${tag} rename + recolour are saved (${sam.name} ${sam.color})`);
      ok(await q(b2 => BPGW.PS.readData(b2).state.tempo === 77, B), `${tag} renaming keeps Samira's data`);
      // delete with confirm
      await p.click(`#profilePanel [data-pf=del][data-id="${B}"]`); await sleep(100);
      ok(await q(() => /Delete\s*Samira\?/.test(document.querySelector('#profilePanel .pfConfirm').textContent) && document.activeElement.dataset.pf === 'delno'), `${tag} Delete asks first, focus lands on "Keep"`);
      await p.click('#profilePanel [data-pf=delno]'); await sleep(100);
      ok(await q(b2 => BPGW.PS.get(b2) !== null && !document.querySelector('.pfConfirm'), B), `${tag} Keep cancels the delete`);
      await p.click(`#profilePanel [data-pf=del][data-id="${B}"]`); await sleep(100); await p.click('#profilePanel [data-pf=delyes]'); await sleep(150);
      ok(await q(b2 => BPGW.PS.get(b2) === null && localStorage.getItem('bpgw.p.' + b2) === null && BPGW.PS.index().list.length === 1, B), `${tag} confirmed delete removes the musician and their stored data`);
      ok(await q(() => BPGW.S.tempo === 144 && !document.querySelector('#profilePanel [data-pf=del]')), `${tag} the other musician is untouched; the last one cannot be deleted`);
      await ctx.close();
    }

    /* ---------- 5. deleting the musician you are playing as ---------- */
    {
      const { ctx, p, q } = await mk();
      const A = await q(() => BPGW.ME.id);
      const m = await q(() => BPGW.PS.create({ name: 'Kid', color: '#2f9e44', data: { state: { tempo: 90 }, theme: 'surf' } }));
      await nav(p, () => q(id => BPGW.profileSwitch(id), m.id));
      ok(await q(() => BPGW.S.tempo === 90 && document.documentElement.dataset.theme === 'surf'), `${tag} switching programmatically loads that musician's tempo and theme`);
      await openPanel(p); await p.click(`#profilePanel [data-pf=del][data-id="${m.id}"]`); await sleep(100);
      await nav(p, () => p.click('#profilePanel [data-pf=delyes]'));
      ok(await q(a => BPGW.ME.id === a && BPGW.PS.index().list.length === 1, A), `${tag} deleting the active musician falls back to the remaining one`);
      await ctx.close();
    }

    /* ---------- 6. export / import ---------- */
    {
      const { ctx, p, q } = await mk();
      await q(() => { BPGW.S.tempo = 123; BPGW.S.quiz.best = 6; BPGW.S.quiz.total = 8; BPGW.S.lessons = { 'a/b': { acc: 70, ms: 9, wrong: 1, perfect: false, at: 3 } }; BPGW.S.gateRoot = 'E'; });
      await p.evaluate(() => { document.querySelector('#themeBtn').click(); document.querySelector('#themePanel [data-v="rosewood"]').click(); });
      await q(() => { BPGW.S.tempo = 123; BPGW.S.quiz.best = 6; BPGW.S.quiz.total = 8; BPGW.S.lessons = { 'a/b': { acc: 70, ms: 9, wrong: 1, perfect: false, at: 3 } }; BPGW.S.gateRoot = 'E'; });
      await q(() => { window.__dl = null; const o = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { if (this.download) { window.__dl = { name: this.download, href: this.href }; fetch(this.href).then(r => r.text()).then(t => { window.__dlText = t; }); return; } return o.call(this); }; });
      await openPanel(p); await p.click('#profilePanel [data-pf=export]'); await sleep(300);
      const dl = await q(() => ({ d: window.__dl, t: window.__dlText }));
      ok(dl.d && /^bpgw-profile-musician-1\.json$/.test(dl.d.name), `${tag} export downloads a .json file named after the musician (${dl.d && dl.d.name})`);
      const file = JSON.parse(dl.t);
      ok(file.app === 'bpgw' && file.kind === 'profile' && file.v === 1 && file.profile.name === 'Musician 1' && file.data.theme === 'rosewood' && file.data.state.tempo === 123 && file.data.state.quiz.best === 6 && file.data.state.lessons['a/b'] && !('metro' in file.data.state) && !('idOn' in file.data.state), `${tag} the file holds the name, colour, theme, settings, quiz and lessons`);
      ok(await q(() => /Saved Musician 1/.test(document.querySelector('#profilePanel .pfMsg').textContent)), `${tag} the panel confirms the export`);
      const tmp = path.join(os.tmpdir(), 'bpgw-test-' + w + '.json'); fs.writeFileSync(tmp, dl.t);
      const inp = await p.$('#pfFile'); await inp.uploadFile(tmp); await sleep(400);
      ok(await q(() => BPGW.PS.index().list.length === 2 && BPGW.PS.index().list.some(x => x.name === 'Musician 1 (2)') && /Added Musician 1 \(2\)/.test(document.querySelector('#profilePanel .pfMsg').textContent)), `${tag} importing adds a NEW musician (same name gets "(2)"), the current one is not overwritten`);
      const imp = await q(() => BPGW.PS.index().list.find(x => x.name === 'Musician 1 (2)'));
      const impD = await q(id => BPGW.PS.readData(id), imp.id);
      ok(impD.state.tempo === 123 && impD.state.quiz.best === 6 && impD.state.lessons['a/b'] && impD.theme === 'rosewood' && impD.state.gateRoot === 'E', `${tag} the imported musician has all the exported data`);
      await nav(p, () => p.click(`#profilePanel [data-pf=switch][data-id="${imp.id}"]`));
      ok(await q(() => BPGW.S.tempo === 123 && document.documentElement.dataset.theme === 'rosewood' && BPGW.S.quiz.best === 6), `${tag} switching to the imported musician restores everything (as on a new device)`);
      // hostile / broken files
      const bads = {
        'notjson': 'this is not json',
        'wrongapp': JSON.stringify({ app: 'other', kind: 'profile', v: 1 }),
        'future': JSON.stringify({ app: 'bpgw', kind: 'profile', v: 9, profile: { name: 'x' }, data: {} }),
      };
      await openPanel(p);
      for (const [k, txt] of Object.entries(bads)) {
        const f = path.join(os.tmpdir(), `bpgw-bad-${k}.json`); fs.writeFileSync(f, txt);
        const n0 = await q(() => BPGW.PS.index().list.length);
        await (await p.$('#pfFile')).uploadFile(f); await sleep(300);
        ok(await q(n => BPGW.PS.index().list.length === n && document.querySelector('#profilePanel .pfMsg').textContent.length > 10, n0), `${tag} a ${k} file is refused with a message and adds nothing (${await q(() => document.querySelector('#profilePanel .pfMsg').textContent)})`);
      }
      const hostile = { app: 'bpgw', kind: 'profile', v: 1, profile: { name: '  <img src=x onerror=alert(1)>\n\tEvil name that is much too long to fit  ', color: 'url(javascript:1)' },
        data: { theme: '../../etc', state: { tempo: 'fast', scale: 'dorian', __proto__: { polluted: 1 }, constructor: 5, evil: '<script>', quiz: { best: 4 }, lessons: [], metro: true, idOn: true, tab: 'song', gateOn: 'yes' } } };
      const hf = path.join(os.tmpdir(), 'bpgw-hostile.json'); fs.writeFileSync(hf, JSON.stringify(hostile));
      await (await p.$('#pfFile')).uploadFile(hf); await sleep(400);
      const hp = await q(() => BPGW.PS.index().list.find(x => /^<img/.test(x.name)));
      ok(hp && hp.name.length <= 24 && !/[\n\t]/.test(hp.name) && (await q(c => BPGW.AVATAR_COLORS.some(x => x.c === c), hp.color)), `${tag} imported names are trimmed/limited and colours restricted to the palette (${hp && hp.name} ${hp && hp.color})`);
      const hd = await q(id => BPGW.PS.readData(id), hp.id);
      ok(hd.theme === null && hd.state.scale === 'dorian' && hd.state.tab === 'song' && hd.state.quiz.best === 4 && !('tempo' in hd.state) && !('evil' in hd.state) && !('metro' in hd.state) && !('idOn' in hd.state) && !('gateOn' in hd.state) && !Array.isArray(hd.state.lessons), `${tag} hostile file: unknown keys, wrong types and an unknown theme are dropped, valid values kept (${JSON.stringify(hd)})`);
      ok(await q(() => ({}).polluted === undefined), `${tag} no prototype pollution`);
      ok(await q(() => !document.querySelector('#profilePanel img') && !document.querySelector('#profilePanel script')), `${tag} names are escaped in the panel`);
      await ctx.close();
    }

    /* ---------- 7. welcome: import a file on a new device ---------- */
    {
      const { ctx, p, q } = await mk({ human: true });
      const file = JSON.stringify({ app: 'bpgw', kind: 'profile', v: 1, profile: { name: 'Mia', color: '#7e3fc4' }, data: { theme: 'surf', state: { tempo: 88 } } });
      const f = path.join(os.tmpdir(), 'bpgw-mia.json'); fs.writeFileSync(f, file);
      await Promise.all([p.waitForNavigation({ waitUntil: 'load' }), (async () => { await (await p.$('#pfFile')).uploadFile(f); })()]); await sleep(450);
      ok(await q(() => BPGW.PS.index().list.length === 1 && BPGW.PS.active().name === 'Mia' && BPGW.S.tempo === 88 && document.documentElement.dataset.theme === 'surf' && document.getElementById('welcome').hidden), `${tag} importing from the welcome makes that file the musician (the empty default is dropped) and skips the question`);
      await ctx.close();
    }

    /* ---------- 8. the store interface on its own (in-memory storage) ---------- */
    {
      const { ctx, q } = await mk();
      const r = await q(() => {
        const o = [], mem = BPGW.memStorage(), s = new BPGW.LocalStore(mem);
        o.push(s.kind === 'local' && s.index() === null);
        const ix = s.init(); o.push(ix.list.length === 1 && ix.welcomed === false && s.active().id === ix.active);
        const a = s.create({ name: 'A', color: '#c92a2a', data: { state: { tempo: 1 }, theme: 'wood' } }), b = s.create({ name: 'B', color: '#0f766e' });
        o.push(a.id !== b.id && s.index().list.length === 3 && s.readData(a.id).state.tempo === 1 && s.readData(b.id).state.tempo === undefined);
        s.writeData(a.id, { state: { tempo: 2 } }); o.push(s.readData(a.id).state.tempo === 2 && s.readData(a.id).theme === 'wood');
        s.writeData(a.id, { theme: 'sheet' }); o.push(s.readData(a.id).theme === 'sheet' && s.readData(a.id).state.tempo === 2);
        o.push(s.writeData('nope', { state: {} }) === false && mem.getItem('bpgw.p.nope') === null);
        o.push(s.setActive(b.id) && s.active().id === b.id && s.setActive('nope') === false && s.active().id === b.id);
        s.update(a.id, { name: 'A2', color: '#f2b705' }); o.push(s.get(a.id).name === 'A2' && s.get(a.id).color === '#f2b705');
        const na = s.remove(b.id); o.push(s.get(b.id) === null && mem.getItem('bpgw.p.' + b.id) === null && na === s.index().active && s.index().list.length === 2);
        const ex = s.exportProfile(a.id); o.push(ex.app === 'bpgw' && ex.profile.name === 'A2' && ex.data.theme === 'sheet' && s.exportProfile('nope') === null);
        s.remove(a.id); const last = s.remove(s.index().list[0].id); o.push(s.index().list.length === 1 && s.active().name === 'Musician 1' && s.index().active === last);
        mem.setItem('bpgw.profiles', '{broken'); o.push(s.index() === null && s.init().list.length === 1);                       // corrupt index: a fresh default, no crash
        mem.setItem('bpgw.profiles', JSON.stringify({ v: 1, active: 'gone', list: [{ id: 'q1', name: 'Q' }] })); o.push(s.index().active === 'q1');   // dangling active pointer repaired
        const fresh = new BPGW.LocalStore(BPGW.memStorage()); fresh.st.setItem('bpgw.v3', '{"tempo":99}'); const mi = fresh.init(); o.push(mi.welcomed === true && fresh.readData(mi.active).state.tempo === 99 && fresh.st.getItem('bpgw.v3') === '{"tempo":99}');
        const bad = new BPGW.LocalStore(BPGW.memStorage()); bad.st.setItem('bpgw.v3', 'not json'); o.push(bad.init().list.length === 1 && bad.readData(bad.active().id).state.tempo === undefined);
        return o;
      });
      r.forEach((v, i) => ok(v === true, `${tag} LocalStore interface check ${i + 1}`));
      await ctx.close();
    }

    /* ---------- 9. a11y: axe on the panel, the edit form and the welcome ---------- */
    {
      const run = async (p, label) => { await p.evaluate(axeSrc); const v = await p.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } })).violations.map(x => { if (x.id === 'label-content-name-mismatch') x.nodes = x.nodes.filter(n => !/^<(div|g) class="(pk|lcol|cdiag|idc)[ "]/.test(n.html)); return x; }).filter(x => x.nodes.length).map(x => x.id + ': ' + x.nodes.map(n => n.html.slice(0, 90)).join(' / '))); ok(!v.length, `${tag} axe: ${label}: ${v.join(' | ')}`); };
      const { ctx, p, q } = await mk({ human: true });
      await run(p, 'welcome');
      await p.click('#welcome [data-pf=skip]'); await sleep(100);
      await q(() => { BPGW.PS.create({ name: 'Sam', color: '#d6336c' }); }); await openPanel(p);
      await run(p, 'musicians panel'); await p.click('#profilePanel [data-pf=edit]'); await sleep(100); await run(p, 'edit form');
      await p.click('#profilePanel [data-pf=cancel]'); await sleep(100);
      await p.click('#profilePanel [data-pf=del]'); await sleep(100); await run(p, 'delete confirm');
      await ctx.close();
    }
  }
  ok(!errs.length, 'no console / page errors: ' + [...new Set(errs)].slice(0, 3).join(' | '));
  await b.close();
  console.log(`\nprofiles.js: ${checks - bad}/${checks} checks passed`); process.exit(bad ? 1 : 0);
})();
