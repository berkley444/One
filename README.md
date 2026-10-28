# 🍐 Big Pear Guitar Works

**A guitar theory tutorial that shows the math under every note — and bridges the fretboard to the piano.**

### ▶ Live app: **https://berkley444.github.io/One/**

*(Single file, no install, works on a phone. If the link 404s, GitHub Pages isn't switched on yet: Settings → Pages → Deploy from branch → `main` / root.)*

![Desktop](docs/screenshots/web_desktop_play.png)

<p align="center"><img src="docs/screenshots/web_phone_play.png" width="260" alt="Phone view"></p>

## What's in it

| Tab | What it shows |
|---|---|
| **PLAY** | Pick a root, scale/mode and tuning on the brushed-metal panel. See the notes, formula, W/H step pattern and key signature; the same notes on a 0–15-fret fretboard **and** an 88-key piano; the harmonised chords with roman numerals. Tap anything to hear it. |
| **CHORD** | 13 chord qualities on any root. Formula, notes, intervals, piano inversions, and guitar shapes *generated* for the current tuning. |
| **CIRCLE** | Interactive circle of fifths — tap a key to set it; relative minor, key signature, neighbours, and "walk the circle". |
| **ƒ(x) MATH** | `f(n) = 440 × 2^(n/12)` with `n` worked out step by step; every note of the scale vs. just intonation; open strings; fret-by-fret frequencies. |
| **SONG** | Time signature + tempo + metronome, and a **Generate progression** button: 4–8 bars in the key, played back. |

Panel controls: `PITCH` (A4 415–450) · `ROOT` · `SCALE` (major, natural/harmonic/melodic minor, major/minor pentatonic, blues, 5 more modes) · `TUNING` (standard, drop D, DADGAD, open G/D/E, half-step down, full-step down, 7-string, bass) · `MODE` · `TIME SIG` · `TONE` · `SPELLING` · tempo and volume knobs · metronome switch.

## Run it

Open `index.html` in a browser. That's it. No build step, no dependencies (fonts are optional via CDN).

```bash
node tests/theory.test.js     # theory + math tests (spelling, key signatures, chords, frequencies, voicings, progressions)
```

## Repository layout

```
index.html                     the entire app (HTML + CSS + JS; theory lives in a <THEORY> block)
tests/theory.test.js           node tests; extracts the <THEORY> block from index.html
.nojekyll                      serve as plain static files on GitHub Pages
docs/
  SPEC.md                      the vision, in his words
  DECISIONS.md                 dated decision log
  REBUILD_POSTMORTEM.md        why the rebuild lost the look, and how to avoid it
  NEXT.md                      done / next / pinned ideas
  HOW_TO_WORK_WITH_AGENTS.md   the recipe: read docs → small slices → mockup → build → review
  screenshots/                 original app, the rebuild, and the web version
  research/                    piano-teaching market research + build prompt (md + pdf)
```

## Status

The web app is complete and tested. **The Mac/Xcode project — the real app — still needs to be added to this repo** (first item in [`docs/NEXT.md`](docs/NEXT.md)).

---
*Equal temperament: f(n) = A4 × 2^(n/12). No tracking, no accounts.*
