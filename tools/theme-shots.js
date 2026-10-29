#!/usr/bin/env node
/* Headless screenshots of every theme × scene × viewport.
 *   node tools/theme-shots.js [--themes=a,b] [--scenes=play,chord,learn] [--vp=phone,desktop] [--out=/workspace/ts] [--dpr=1] [--fold=1]
 * Needs puppeteer-core + google-chrome (see tests/browser/README.md) and the repo served on BPGW_BASE (default http://localhost:8123/). */
const puppeteer = require(process.env.PPTR || '/workspace/pt/node_modules/puppeteer-core');
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const BASE = process.env.BPGW_BASE || 'http://localhost:8123/';
const THEMES = arg('themes', 'silver,console,pedal,tube,minimal,navy-light,minimal-dark,synth,wood,sunburst,surf,rosewood,sheet').split(',');
const SCENES = { play: '#play&root=A&scale=dorian&sp=2&pp=1&hd=B&po=4', chord: '#chord&chord=G&q=maj7&cp=2&pp=0&hd=B&po=4', learn: '#lessons&les=cscale&lp=4', circle: '#circle&root=D&scale=major', song: '#song&root=A&scale=minorPent&ss=7', math: '#math&root=A' };
const VPS = { phone: { width: 390, height: 844, deviceScaleFactor: +arg('dpr', 1), isMobile: true, hasTouch: true }, desktop: { width: 1180, height: 900, deviceScaleFactor: +arg('dpr', 1) } };
const FOLD = arg('fold', '0') === '1'; /* --fold=1: first screen only (dock at the bottom), taller desktop viewport: the contact-sheet look */
if (FOLD) VPS.desktop.height = 1300;
const out = arg('out', FOLD ? '/workspace/ts_fold' : '/workspace/ts');
(async () => {
  require('fs').mkdirSync(out, { recursive: true });
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  for (const t of THEMES) for (const sc of arg('scenes', 'play,chord,learn').split(',')) for (const vp of arg('vp', 'phone,desktop').split(',')) {
    const ctx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext()); const p = await ctx.newPage(); await p.setViewport(VPS[vp]);
    p.on('pageerror', e => console.log('PAGEERR', t, sc, vp, e.message));
    p.on('console', m => { if (m.type() === 'error' && !/fonts|net::ERR/.test(m.text())) console.log('CONSOLE', t, sc, vp, m.text()); });
    await p.goto(BASE + 'index.html?theme=' + t + SCENES[sc], { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
    await p.evaluate(() => document.fonts.ready); await new Promise(r => setTimeout(r, 500));
    await p.screenshot({ path: `${out}/${t}_${sc}_${vp}.png`, fullPage: !FOLD }); await p.close(); await ctx.close();
  }
  await b.close();
})();
