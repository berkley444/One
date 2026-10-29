# Browser tests (headless Chrome)

These drive the real page with `puppeteer-core` and need Google Chrome at `/usr/bin/google-chrome`.

```bash
npm i puppeteer-core axe-core          # once, anywhere on NODE_PATH (or in this folder)
python3 -m http.server 8123 &          # from the repo root: the service worker needs http(s)
export BPGW_URL=http://localhost:8123/index.html
for t in smoke prac song lessons identify; do node tests/browser/$t.js; done
node tests/browser/polish.js           # PWA + offline + keyboard + reduced motion (uses http://localhost:8123/)
node tests/browser/identify.js         # Clear / Identify, Chord Quiz and the chord-unlock pop-up: real mouse clicks (1280) and touch taps (390), keyboard, URL hash, localStorage, 8 themes
node tests/browser/layout.js           # CHORD/PLAY order: root + position row directly above the fretboard, Chord Builder below it, nothing under the tab bar; 8 themes, 1280 + 390
node tests/browser/axe.js $BPGW_URL    # axe-core on every tab and on the identify / quiz / unlock views, phone + desktop widths
node tests/browser/themes.js [id,id]   # every theme x 390/1280 x 12 views (incl. identify, quiz, unlock, lock menu): axe, overflow, contrast pass, finger colours, picker (~6 min for all)
node tests/browser/frame.js            # render → next frames, 4× CPU throttle (edit the two URLs to compare builds)
node tests/browser/cls.js              # layout-shift entries on load
node tests/browser/mkicons.js          # regenerate icons/*.png from icons/*.svg
```

The pure-logic tests are separate: `node tests/theory.test.js`.
`axe.js` skips one rule on four diagram-like controls (piano keys, staff steps, chord diagrams, note-placing board cells) where the visible
text is several separate glyphs; see docs/DECISIONS.md (slice 4).
