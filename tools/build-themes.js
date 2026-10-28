#!/usr/bin/env node
/* Assembles themes/*.css into the <style id="themes"> block of index.html.
 *
 *   node tools/build-themes.js          rewrite index.html
 *   node tools/build-themes.js --check  exit 1 if index.html is out of date (the test suite runs this)
 *
 * File conventions (see themes/README.md):
 *   NN-engine.css   generic rules; every selector is prefixed with  html[data-theme]
 *   NN-<id>.css     one theme; the rule  :theme{...}  holds its custom properties and becomes  [data-theme="<id>"]{...}
 *                   (so the picker's preview chips can use them too); every other selector is prefixed with  html[data-theme="<id>"]
 *   Files starting with "_" are skipped.
 */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), dir = path.join(root, 'themes'), idx = path.join(root, 'index.html');

function splitSel(s) { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(' || ch === '[') d++; if (ch === ')' || ch === ']') d--; if (ch === ',' && d === 0) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map(x => x.trim()).filter(Boolean); }
function prefixer(prefix, id) {
  const pre = sel => sel === ':theme' ? `[data-theme="${id}"]` : sel === ':root' || sel === 'html' ? prefix : /^html\b/.test(sel) ? sel.replace(/^html/, prefix) : prefix + ' ' + sel;
  return function walk(css) {
    let out = '', i = 0;
    while (i < css.length) {
      if (css.startsWith('/*', i)) { const e = css.indexOf('*/', i + 2); out += css.slice(i, e + 2); i = e + 2; continue; }
      if (/\s/.test(css[i])) { out += css[i++]; continue; }
      let j = i, d = 0, q = null;                                  // read the prelude up to '{'
      for (; j < css.length; j++) { const c = css[j]; if (q) { if (c === q) q = null; continue; } if (c === '"' || c === "'") { q = c; continue; } if (c === '(') d++; if (c === ')') d--; if (c === '{' && d === 0) break; }
      const prelude = css.slice(i, j).trim();
      let k = j + 1, depth = 1; q = null;                          // find the matching '}'
      for (; k < css.length && depth; k++) { const c = css[k]; if (q) { if (c === q) q = null; continue; } if (c === '"' || c === "'") { q = c; continue; } if (c === '{') depth++; if (c === '}') depth--; }
      const body = css.slice(j + 1, k - 1);
      if (/^@(media|supports)/.test(prelude)) out += prelude + '{' + walk(body) + '}';
      else if (prelude.startsWith('@')) out += prelude + '{' + body + '}';
      else out += splitSel(prelude).map(pre).join(',') + '{' + body + '}';
      i = k;
    }
    return out;
  };
}
function art(css) {                       // @art(name) -> url(inline data-URI SVG from themes/art/name.svg
  return css.replace(/@art\(([\w-]+)\)/g, (m, n) => {
    const svg = fs.readFileSync(path.join(dir, 'art', n + '.svg'), 'utf8').replace(/\s*\n\s*/g, '').trim();
    return 'url("data:image/svg+xml,' + svg.replace(/[%#<>"]/g, c => ({ '%': '%25', '#': '%23', '<': '%3C', '>': '%3E', '"': "'" }[c])) + '")';
  });
}
function build() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.css') && !f.startsWith('_')).sort();
  let out = '';
  for (const f of files) {
    const src = art(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (f.endsWith('.raw.css')) { out += `/* ===== ${f} ===== */\n` + src.replace(/\}\s*(?=\S)/g, '}\n') + '\n'; continue; }
    if (f.endsWith('engine.css')) { out += `/* ===== ${f} ===== */\n` + prefixer('html[data-theme]', null)(src).replace(/\}\s*(?=\S)/g, '}\n') + '\n'; continue; }
    const id = f.replace(/^\d+-/, '').replace(/\.css$/, '');
    out += `/* ===== ${f} ===== */\n` + prefixer(`html[data-theme="${id}"]`, id)(src).replace(/\}\s*(?=\S)/g, '}\n') + '\n';
    // "/*@also other-id*/" on the first line: the structural rules (everything except the :theme{} variable block) are repeated for those ids
    const also = /^\s*\/\*@also ([\w\s,-]+)\*\//.exec(src);
    if (also) for (const o of also[1].split(/[\s,]+/).filter(Boolean)) {
      const body = src;
      out += `/* ===== ${f} (shared with ${o}) ===== */\n` + prefixer(`html[data-theme="${o}"]`, o)(body).replace(/\}\s*(?=\S)/g, '}\n') + '\n';
    }
  }
  return out;
}
const html = fs.readFileSync(idx, 'utf8');
const re = /\/\*THEMES:BEGIN\*\/[\s\S]*?\/\*THEMES:END\*\//;
if (!re.test(html)) { console.error('markers not found in index.html'); process.exit(2); }
const next = html.replace(re, () => '/*THEMES:BEGIN*/\n' + build() + '/*THEMES:END*/');
if (process.argv.includes('--check')) { if (next !== html) { console.error('index.html is out of date: run node tools/build-themes.js'); process.exit(1); } console.log('themes in sync'); }
else { fs.writeFileSync(idx, next); console.log('themes written: ' + (next.length - html.length) + ' bytes change, ' + build().length + ' bytes of CSS'); }
