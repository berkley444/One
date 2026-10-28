# NEXT — done / next

Updated 2026-10-27.

## Done
- [x] Original design captured (`screenshots/gm_original.png`) and written up (`SPEC.md`)
- [x] Piano-teaching market research + build prompt (`research/`)
- [x] Web app: `index.html`, single file, no dependencies
  - [x] Brushed-metal panel, drum knobs, tempo/volume knobs, glowing POWER light, black background
  - [x] Root, scale (12 scales/modes), tuning (10 tunings), time signature, tone, spelling
  - [x] Fretboard 0–15 frets, notes/intervals/off labels, root coloured
  - [x] 88-key piano showing the same notes, open-string markers
  - [x] Harmonised chords with roman numerals (triads / sevenths)
  - [x] Chord builder: 13 qualities, formula, notes, intervals, piano inversions, generated guitar shapes
  - [x] Circle of fifths: click to set key, relative minor, key signature, "walk the circle"
  - [x] MATH ƒ(x): worked example `440×2^(n/12)`, scale table with just-intonation comparison, every note, open strings, fret-by-fret math
  - [x] WebAudio: pluck / keys / synth tones, metronome, chord strum/arpeggio, scale playback
  - [x] Song tab: 4–8-bar progression generator (smart / pop / blues / jazz), plays with metronome, copy chart
  - [x] 3,200+ theory tests (`node tests/theory.test.js`)
- [x] Docs: spec, decisions, postmortem, how to work with agents

## Next (in order)
1. **Add the Xcode project to this repo.** This is the real app. Copy the project folder into `/mac/` (or `/ios/`), commit, push. Until this is done the repo is not the single source of truth. (`.gitignore`: `xcuserdata/`, `DerivedData/`, `.DS_Store`.)
2. **Port the web theory tests to Swift** (or share test vectors as JSON) so both apps agree on spelling, key signatures and frequencies.
3. **Close the visual gap** between the web version and the Xcode app (or vice versa) — decide which is the reference.
4. Add a MATH-tab view of *cents* for tunings and a tuner-style readout.
5. Fretboard: show CAGED / position boxes for the chosen scale.
6. Hash-link everything (time signature, tempo) so lessons can be shared by URL.
7. Accessibility pass: keyboard-only use of all drums, screen-reader labels on fretboard/piano.

## Pinned — piano-teacher ideas (parked on purpose)
These came from the KeyForge research. Not for now; do not lose them.
- **Camera posture check** — hand/wrist posture feedback using on-device pose detection.
- **Record & listen back** — record a take and hear it next to the target.
- **Teach the "why"** — every exercise explains the purpose and the technique behind it.
- **Song-to-exercise import** — turn a piece into targeted practice drills.
- **Pedal page-turn / watch metronome** — hands-free page turns; a haptic metronome on the wrist.
- **Trademark check on "KeyForge"** — verify the name is usable before any public use.

## Open questions for Jeremy
- Which is the reference build — the Mac app or the web app?
- Is the web version a teaching companion, or a prototype to be thrown away?
- App Store plans? (Affects the name check and whether this stays free.)
