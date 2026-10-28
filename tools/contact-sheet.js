#!/usr/bin/env node
/* Builds labelled contact sheets from tools/theme-shots.js output.
 *   node tools/contact-sheet.js [--in=/workspace/ts_fold (from theme-shots --fold=1)] [--out=/workspace]
 * Writes themes_play.png, themes_chord.png (desktop, 4 x 2) and themes_learn_phone.png (phone, 4 x 2). */
const puppeteer = require(process.env.PPTR || '/workspace/pt/node_modules/puppeteer-core');
const fs = require('fs');
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const IN = arg('in', '/workspace/ts_fold'), OUT = arg('out', '/workspace');
const T = [['silver', 'Silver Hi-Fi (default)'], ['console', 'Studio Console'], ['pedal', 'Boutique Pedal'], ['tube', 'Tube Amp'], ['minimal', 'Minimal Light'], ['minimal-dark', 'Minimal Dark'], ['synth', 'Modular Synth'], ['wood', 'Vintage Wood']];
const img = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
function sheet(scene, vp, cols, w, h, title) {
  const cells = T.map(([id, name]) => `<figure><figcaption><b>${name}</b><code>?theme=${id}</code></figcaption><div class="im" style="width:${w}px;height:${h}px"><img src="${img(`${IN}/${id}_${scene}_${vp}.png`)}" style="width:${w}px"></div></figure>`).join('');
  return `<!doctype html><meta charset=utf-8><style>body{margin:0;padding:20px;background:#222;color:#eee;font:14px/1.3 system-ui,sans-serif;width:max-content}h1{margin:0 0 14px;font:600 20px system-ui}.g{display:grid;grid-template-columns:repeat(${cols},auto);gap:16px}figure{margin:0}figcaption{display:flex;justify-content:space-between;gap:10px;margin-bottom:6px}figcaption code{color:#9ab}.im{overflow:hidden;border-radius:6px;box-shadow:0 0 0 1px #555}img{display:block}</style><h1>${title}</h1><div class="g">${cells}</div>`;
}
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  const jobs = [['themes_play.png', sheet('play', 'desktop', 4, 560, 617, 'PLAY tab, desktop: every theme (A Dorian, position 3, fingers on)'), 1200],
    ['themes_chord.png', sheet('chord', 'desktop', 4, 560, 617, 'CHORD tab, desktop: every theme (G maj7, position 2, fingers on)'), 1200],
    ['themes_learn_phone.png', sheet('learn', 'phone', 4, 390, 844, 'LEARN tab, phone 390px: every theme (first screen)'), 1700]];
  for (const [name, html, w] of jobs) {
    const p = await b.newPage(); await p.setViewport({ width: w, height: 800 }); await p.setContent(html, { waitUntil: 'load' });
    await p.screenshot({ path: `${OUT}/${name}`, fullPage: true }); await p.close(); console.log('wrote', `${OUT}/${name}`);
  }
  await b.close();
})();
