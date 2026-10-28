# Browser tests (headless Chrome)

These drive the real page with `puppeteer-core` and need Google Chrome at `/usr/bin/google-chrome`.

```bash
npm i puppeteer-core axe-core          # once, anywhere on NODE_PATH (or in this folder)
python3 -m http.server 8123 &          # from the repo root: the service worker needs http(s)
export BPGW_URL=http://localhost:8123/index.html
for t in smoke prac song lessons; do node tests/browser/$t.js; done
node tests/browser/polish.js           # PWA + offline + keyboard + reduced motion (uses http://localhost:8123/)
node tests/browser/axe.js $BPGW_URL    # axe-core on every tab, phone + desktop widths
node tests/browser/frame.js            # render → next frames, 4× CPU throttle (edit the two URLs to compare builds)
node tests/browser/cls.js              # layout-shift entries on load
node tests/browser/mkicons.js          # regenerate icons/*.png from icons/*.svg
```

The pure-logic tests are separate: `node tests/theory.test.js`.
`axe.js` skips one rule on three diagram-like controls (piano keys, staff steps, chord diagrams) where the visible
text is several separate glyphs; see docs/DECISIONS.md (slice 4).
