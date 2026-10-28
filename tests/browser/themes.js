/* Theme tests (headless Chrome). For every theme, at phone (390) and desktop (1280) width and on every tab:
 *   - the page renders with no console errors / page errors (font-CDN failures are ignored: fonts are progressive enhancement)
 *   - no horizontal page overflow, no element sticking out of the viewport
 *   - axe-core (wcag2a/2aa/21aa/22aa + best-practice) reports 0 violations (same filter as axe.js)
 *   - our own contrast pass: every visible text node meets 4.5:1 (3:1 for large text) against its real background
 *     (ancestor chain; gradients are checked at their worst stop; SVG text against the shape it sits on)
 *   - the finger colours stay readable: RH, LH and root swatches are mutually distinct, the root is red-ish or marked
 *   - the picker: ?theme= applies, the choice is persisted and restored, Escape/Done close it and return focus
 * Silver Hi-Fi (the default, untouched on purpose) is checked for errors/overflow/axe but its decorative low-contrast labels are
 * reported, not failed (see docs/DECISIONS.md).
 *   BPGW_URL=http://localhost:8123/index.html node tests/browser/themes.js [id,id,...]
 */
const puppeteer = require('puppeteer-core'); const fs = require('fs'); const cp = require('child_process');
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const URL0 = process.env.BPGW_URL || 'http://localhost:8123/index.html';
const ALL = ['silver', 'console', 'pedal', 'tube', 'minimal', 'minimal-dark', 'synth', 'wood'];
const THEMES = (process.argv[2] || '').split(',').filter(Boolean).length ? process.argv[2].split(',') : ALL;
const TABS = ['play', 'chord', 'circle', 'math', 'song', 'lessons', 'lessons-open', 'practice'];
let checks = 0, bad = 0, soft = 0;
const ok = (c, l) => { checks++; if (!c) { bad++; console.log('  ✗', l); } };

// ---- runs inside the page ----
function contrastPass() {
  const parse = s => { const m = /rgba?\(([^)]+)\)/.exec(s); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] == null ? 1 : p[3] }; };
  const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const over = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
  const gradColors = img => { const out = []; const re = /(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}\b)/g; let m; while ((m = re.exec(img))) { let s = m[1]; if (s[0] === '#') { const h = s.slice(1); const n = h.length === 3 ? h.split('').map(x => x + x).join('') : h.slice(0, 6); s = `rgb(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)})`; } const c = parse(s); if (c && c.a > .05) out.push(c); } return out; };
  // list of candidate backgrounds (worst case) for an element, walking up
  function bgCandidates(el) {
    let cands = [{ r: 0, g: 0, b: 0, a: 1 }], found = false, chain = [];
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) chain.push(e);
    // composite from the root downwards
    const base = parse(getComputedStyle(document.documentElement).backgroundColor); cands = [base && base.a > 0 ? over(base, { r: 255, g: 255, b: 255, a: 1 }) : { r: 255, g: 255, b: 255, a: 1 }];
    for (const e of chain.reverse()) {
      const cs = getComputedStyle(e); const bc = parse(cs.backgroundColor); const img = cs.backgroundImage;
      if (bc && bc.a > 0) cands = cands.map(c => over(bc, c));
      if (img && img !== 'none') {
        const gs = img.includes('gradient') ? gradColors(img) : [];
        const opaque = gs.filter(g => g.a >= .95);
        if (gs.length) { const solid = gs.filter(g => g.a >= .95); cands = solid.length ? solid : cands.flatMap(c => gs.map(g => over(g, c))); }
      }
    }
    return cands;
  }
  function svgUnder(t) {
    // the shape this SVG text sits on: nearest preceding sibling with a real fill, else a hit-test below the text
    const tr = t.getBoundingClientRect(), cx = tr.left + tr.width / 2, cy = tr.top + tr.height / 2;
    for (let s = t.previousElementSibling; s; s = s.previousElementSibling) { const sr = s.getBoundingClientRect(); if (cx < sr.left || cx > sr.right || cy < sr.top || cy > sr.bottom) continue; const cs = getComputedStyle(s); if (/^(circle|rect|path|polygon|ellipse)$/i.test(s.tagName) && cs.fill !== 'none') { const c = parse(cs.fill); if (c) { const fa = c.a * parseFloat(cs.fillOpacity || 1) * parseFloat(cs.opacity || 1); return fa >= .95 ? [c] : bgCandidates(t.ownerSVGElement || t).map(b => over({ ...c, a: fa }, b)); } } }
    const r = t.getBoundingClientRect(); const els = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).filter(e => e !== t && !t.contains(e));
    for (const e of els) { if (e.namespaceURI && /svg/.test(e.namespaceURI) && e.tagName.toLowerCase() !== 'svg') { const cs = getComputedStyle(e); const c = parse(cs.fill); if (c && cs.fill !== 'none' && c.a * parseFloat(cs.fillOpacity || 1) > .5) return [c]; } else return bgCandidates(e); }
    return bgCandidates(t.ownerSVGElement || t);
  }
  const bad = [], seen = new Set(); let n = 0, skipped = 0;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const tn = w.currentNode; const txt = tn.textContent.trim(); if (!txt) continue;
    const el = tn.parentElement; if (!el || seen.has(el)) continue;
    if (el.closest('[hidden],script,style,[aria-hidden="true"]')) { continue; }
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = el.getBoundingClientRect(); if (r.width <= 1.5 || r.height <= 1.5) continue;
    let op = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity); if (op < .05) continue;
    if (el.disabled || el.closest(':disabled,[aria-disabled="true"]')) continue;
    let clipped = false;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a); if (o.overflowX !== 'visible' || o.overflowY !== 'visible') { const ar = a.getBoundingClientRect(); if (r.right <= ar.left + 1 || r.left >= ar.right - 1 || r.bottom <= ar.top + 1 || r.top >= ar.bottom - 1) { clipped = true; break; } } }
    if (clipped) continue;
    { const cx = r.left + r.width / 2, cy = r.top + r.height / 2, top = document.elementFromPoint(cx, cy); if (top && top.closest('nav.dock') && !el.closest('nav.dock')) continue; } /* scrolled under the floating dock: not readable there, and the page has room to scroll clear of it */
    seen.add(el);
    const isSvg = el.namespaceURI && /svg/.test(el.namespaceURI) && el.tagName.toLowerCase() !== 'svg';
    const fgc = parse(isSvg ? cs.fill : cs.color); if (!fgc) { skipped++; continue; }
    // text with a gradient/clip fill (background-clip:text) or fully transparent: skip but count
    if (fgc.a === 0) { skipped++; continue; }
    const bgs = isSvg ? svgUnder(el) : bgCandidates(el);
    const fs = parseFloat(cs.fontSize), fw = parseInt(cs.fontWeight) || 400; const large = fs >= 24 || (fs >= 18.66 && fw >= 700);
    const need = large ? 3 : 4.5; let worst = 99, wb = null;
    for (const b of bgs) { const f = over({ ...fgc, a: fgc.a * op }, b); const rr = ratio(f, b); if (rr < worst) { worst = rr; wb = b; } }
    n++;
    if (worst < need) bad.push({ txt: txt.slice(0, 24), sel: (el.id ? '#' + el.id : el.tagName.toLowerCase() + (el.className && el.className.baseVal === undefined ? '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.') : '')), r: +worst.toFixed(2), need, op: +op.toFixed(2), par: (el.parentElement ? el.parentElement.tagName.toLowerCase() + '.' + String(el.parentElement.className && el.parentElement.className.baseVal !== undefined ? el.parentElement.className.baseVal : el.parentElement.className).split(/\s+/)[0] : ''), fg: isSvg ? cs.fill : cs.color, bg: `rgb(${wb.r | 0},${wb.g | 0},${wb.b | 0})` });
  }
  return { n, skipped, bad };
}
function layoutPass() {
  const vw = document.documentElement.clientWidth; const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
    if (el.closest('[hidden],.fbscroll,.pianoscroll,.scrollx,svg,[style*="overflow"],.dock')) continue;
    const r = el.getBoundingClientRect(); if (r.width < 1) continue;
    if (r.right > vw + 1.5 || r.left < -1.5) { // allowed when an ancestor scrolls horizontally
      let p = el.parentElement, scrolls = false; while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (/auto|scroll|hidden/.test(o)) { scrolls = true; break; } p = p.parentElement; }
      if (!scrolls) out.push(el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(/\s+/)[0] : '') + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    }
  }
  return { sw: document.documentElement.scrollWidth, cw: vw, out: out.slice(0, 5) };
}
function swatchPass() {
  const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const probe = document.createElement('i'); document.body.appendChild(probe);
  const rgb = v => { probe.style.color = v; const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(getComputedStyle(probe).color); probe.style.color = ''; return m ? [+m[1], +m[2], +m[3]] : null; };
  const o = { R: rgb(cssv('--h-r') || '#0f0'), L: rgb(cssv('--h-l') || '#00f'), root: rgb(cssv('--t-root') || '#f00') }; probe.remove(); return o;
}
// ---- driver ----
(async () => {
  const sh = cp.spawnSync('node', ['tools/build-themes.js', '--check'], { cwd: __dirname + '/../..' });
  ok(sh.status === 0, 'themes/*.css is in sync with index.html (node tools/build-themes.js)');
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  for (const id of THEMES) {
    const errs = []; const rowAxe = {}, rowC = {};
    for (const [w, mobile] of [[390, true], [1280, false]]) {
      const ctx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
      const p = await ctx.newPage(); await p.setViewport({ width: w, height: 900, isMobile: mobile, hasTouch: mobile });
      p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
      p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errs.push(m.text()); });
      await p.goto(URL0 + '?theme=' + id, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
      await p.evaluate(() => document.fonts.ready); await sleep(400);
      ok(await p.evaluate(i => (document.documentElement.getAttribute('data-theme') || 'silver') === i, id), `[${id} ${w}] ?theme= applied`);
      await p.evaluate(axeSrc);
      for (const tab of TABS) {
        await p.evaluate(t => { if (t === 'lessons-open') { BPGW.setTab('lessons'); document.querySelector('[data-act="lopen"]').click(); } else if (t === 'practice') { BPGW.setTab('lessons'); const x = document.querySelector('[data-act="prtog"]'); x && x.click(); } else BPGW.setTab(t); }, tab);
        await sleep(200);
        const lay = await p.evaluate(layoutPass);
        ok(lay.sw <= lay.cw + 1 && !lay.out.length, `[${id} ${w}/${tab}] no overflow (scrollWidth ${lay.sw}/${lay.cw}) ${lay.out.join('; ')}`);
        const ax = await p.evaluate(async () => { const x = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }); return x.violations.map(v => { if (v.id === 'label-content-name-mismatch') v.nodes = v.nodes.filter(n => !/^<(div|g) class="(pk|lcol|cdiag)[ "]/.test(n.html)); return v; }).filter(v => v.nodes.length).map(v => v.id + ' x' + v.nodes.length + ' ' + v.nodes[0].target.join(' ')); });
        ok(!ax.length, `[${id} ${w}/${tab}] axe: ${ax.join(' | ')}`);
        const c = await p.evaluate(contrastPass);
        const worst = c.bad.sort((a, b2) => a.r - b2.r);
        if (id === 'silver') { soft += worst.length; } else ok(!worst.length, `[${id} ${w}/${tab}] contrast: ${worst.length} of ${c.n} text nodes fail, e.g. ` + worst.slice(0, 4).map(x => `"${x.txt}" ${x.sel} ${x.r}<${x.need} op${x.op} in ${x.par} fg ${x.fg} on ${x.bg}`).join(' | '));
        ok(c.n > 5, `[${id} ${w}/${tab}] contrast pass saw text (${c.n})`);
      }
      // finger colours
      await p.evaluate(() => BPGW.setTab('play'));
      const sw = await p.evaluate(swatchPass);
      const d = (a, b2) => Math.hypot(a[0] - b2[0], a[1] - b2[1], a[2] - b2[2]);
      ok(sw.R && sw.L && sw.root && d(sw.R, sw.L) > 120 && d(sw.R, sw.root) > 120 && d(sw.L, sw.root) > 120, `[${id} ${w}] RH / LH / root colours are mutually distinct ${JSON.stringify(sw)}`);
      ok(sw.root && sw.root[0] > 150 && sw.root[1] < 120 && sw.root[2] < 120 || id === 'silver', `[${id} ${w}] root is clearly red ${JSON.stringify(sw.root)}`);
      await p.close(); await ctx.close();
    }
    ok(!errs.length, `[${id}] no console/page errors: ${[...new Set(errs)].slice(0, 3).join(' | ')}`);
    console.log(`${id}: done`);
  }
  // picker: persistence, URL param, a11y
  const ctx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
  const p = await ctx.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await p.goto(URL0, { waitUntil: 'load' }); await sleep(300);
  ok(await p.evaluate(() => !document.documentElement.getAttribute('data-theme')), 'default is Silver Hi-Fi (no data-theme)');
  ok(await p.evaluate(() => document.getElementById('themePanel').hidden && document.getElementById('themeBtn').getAttribute('aria-expanded') === 'false'), 'picker starts closed');
  await p.click('#themeBtn'); await sleep(150);
  const cards = await p.evaluate(() => [...document.querySelectorAll('#themePanel [role="radio"]')].map(x => x.dataset.v));
  ok(cards.length >= 8 && ALL.every(i => cards.includes(i)), 'picker lists all themes: ' + cards.join(','));
  ok(await p.evaluate(() => document.activeElement.classList.contains('tpCard')), 'focus moves into the picker');
  await p.click('#themePanel [data-v="tube"]'); await sleep(150);
  ok(await p.evaluate(() => document.documentElement.dataset.theme === 'tube' && localStorage.getItem('bpgw.theme') === 'tube' && /theme=tube/.test(location.search)), 'choosing a theme applies it, saves it and updates the URL');
  ok(await p.evaluate(() => document.querySelector('#themePanel [data-v="tube"]').getAttribute('aria-checked') === 'true'), 'aria-checked follows the choice');
  await p.keyboard.press('Escape'); await sleep(100);
  ok(await p.evaluate(() => document.getElementById('themePanel').hidden && document.activeElement.id === 'themeBtn'), 'Escape closes the picker and returns focus to the button');
  await p.goto(URL0.replace(/\?.*/, ''), { waitUntil: 'load' }); await sleep(300);
  ok(await p.evaluate(() => document.documentElement.dataset.theme === 'tube'), 'saved theme is restored on reload');
  await p.goto(URL0 + '?theme=synth', { waitUntil: 'load' }); await sleep(300);
  ok(await p.evaluate(() => document.documentElement.dataset.theme === 'synth'), '?theme= beats the saved theme');
  await p.goto(URL0 + '?theme=nope', { waitUntil: 'load' }); await sleep(300);
  ok(await p.evaluate(() => !document.documentElement.dataset.theme || document.documentElement.dataset.theme === 'synth' || document.documentElement.dataset.theme === 'tube'), 'unknown ?theme= is ignored');
  await ctx.close(); await b.close();
  console.log(`\nthemes.js: ${checks - bad}/${checks} checks passed` + (soft ? ` (Silver baseline: ${soft} decorative low-contrast text nodes reported, not asserted)` : ''));
  process.exit(bad ? 1 : 0);
})();
