# NEXT — done / next

Updated 2026-10-28 (Minimal Light default, Clear / Identify chord, Chord Quiz, optional chord unlock).

## Done
- [x] **Clear / Identify chord, Chord Quiz, chord unlock (2026-10-28):** `Theory.identifyChord` / `gradeChordAttempt` / `quizAnswer` (in the `<THEORY>` block), a shared note-placing fretboard (`id=` hash, `bpgw.v3`), identify panel with alternatives / intervals / piano, a graded quiz with score and streak, and an optional off-by-default "fun gate, not security" unlock pop-up. Tests: theory (every quality x root x inversion round-trip), `tests/browser/identify.js` (real clicks and touch taps, phone + desktop, all themes), axe and themes extended.
- [x] **Theme system (2026-10-28):** Theme picker + `?theme=` + eight themes (Minimal Light is now the default; Silver Hi-Fi, Studio Console, Boutique Pedal, Tube Amp, Minimal Light / Dark, Modular Synth, Vintage Wood); `tests/browser/themes.js` (axe + contrast + overflow + finger colours for every theme x phone/desktop x 8 views). See `themes/README.md`.
- [x] **Polish (2026-10-28, slice 4):** installable PWA + offline (manifest, service worker, icons, install button, 53-check browser test), axe-core 351 → 0, CLS 0.11 → 0.009, keyboard piano / fretboard, skip link / landmarks / live region, reduced-motion / contrast / forced-colors
- [x] **MIDI play-along + Practice (2026-10-28, slice 1):** Web MIDI input, on-screen/computer-key fallback, Practice toggle with live scoring; 168k theory checks
- [x] **Piano control panel (2026-10-27; reshaped 2026-10-28 into a guitar-style toolbar + position row + collapsible practice strip, see DECISIONS):** replaces the thumbnail grid; hands R/L/both, octave C2–C6, inversions / named 5+ note voicings / modes on each degree / pentatonic boxes, Match guitar, Play / Arpeggio / Scale, finger numbers on the keys (green RH, blue LH), "RH: C(1) E(3) G(5)" readout, follow-along highlighting; ~115k theory tests + 700-check browser smoke test
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
  - [x] **Position buttons (2026-10-27):** chords 1–6 generated voicings with finger diagrams, scales 7 mode positions / 5 pentatonic boxes, hash-linkable (`sp=`, `cp=`)
  - [x] **51 chord qualities** (m7 … 13♭9, altered 7ths, sus, 6/9, add9, mMaj7, ♭5 …) with one-tap root strip and quality grid
  - [x] 13,000+ theory tests (`node tests/theory.test.js`) incl. every voicing × 8 tunings and every scale position × 9 tunings
- [x] Docs: spec, decisions, postmortem, how to work with agents

## Next (in order)
**Identify / quiz follow-ups:** a rootless-voicing mode (guess the root from a shell), 'listen and name' (play a chord, pick its name), quiz by ear, a daily-chord streak, per-chord stats (which qualities you miss), MIDI-keyboard input into the identify panel, and a left-handed board. Test on a real phone.
**Theme follow-ups:** wait for Jeremy's pick after he has tried them for a day, then (a) ✅ done 2026-10-28: Minimal Light is the default for new visitors, Silver is one tap away, (b) delete or merge the losers rather than carry eight forever, (c) polish the winner on a real phone and on iOS Safari (the screenshots are headless Chrome), (d) self-host the fonts of the winner so the first paint is identical offline, (e) bring Silver's ~570 decorative low-contrast labels up to AA if Silver stays.
**Song generator follow-ups (v2):** note lengths in the tab; a bass line and a drum pattern; sevenths and borrowed chords; a 'lock this section, re-roll the melody' button; export to MIDI / MusicXML; lyrics syllable grid; a 'slow practice' mode that plays the melody with a count-in and lights the tab column.
**Lessons follow-ups:** timed (rhythm) exercises with a metronome count-in; more lessons (minor scales, seventh chords, the 12 major keys' fingerings, rhythm reading, a second song); a key signature on the staff; an 'ear' mode that plays a note and asks you to find it; a printable lesson sheet.
**Today's plan (2026-10-28):** 1 ✅ MIDI + Practice · 2 ✅ Song generator v1 · 3 ✅ Lessons tab (7 lessons, 33 practised parts) · 4 ✅ Polish (PWA/offline, performance, accessibility).
0. **Piano follow-ups:** have a piano teacher check the algorithmic fingerings for exotic scales; optional fingering view for common progressions (voice-leading between chords); optional on-screen hand drawing; optional metronome-synced playback.
1. **Add the Xcode project to this repo.** This is the real app. Copy the project folder into `/mac/` (or `/ios/`), commit, push. Until this is done the repo is not the single source of truth. (`.gitignore`: `xcuserdata/`, `DerivedData/`, `.DS_Store`.)
2. **Port the web theory tests to Swift** (or share test vectors as JSON) so both apps agree on spelling, key signatures and frequencies.
3. **Close the visual gap** between the web version and the Xcode app (or vice versa) — decide which is the reference.
4. Add a MATH-tab view of *cents* for tunings and a tuner-style readout.
5. ~~Fretboard: show position boxes for the chosen scale.~~ **Done 2026-10-27.** Still open: name the five CAGED shapes on the chord positions, and an optional 2-notes-per-string / 4-notes-per-string view of the scale positions.
6. Hash-link everything (time signature, tempo) so lessons can be shared by URL.
7. ~~Accessibility pass~~ **Done 2026-10-28** (slice 4). Still open: test with a real screen reader (VoiceOver / TalkBack) — axe cannot judge whether the spoken labels are *pleasant*; keyboard-only use of the drum knobs is by arrow keys but untested by a person.
8. **PWA follow-ups:** an "Update available — reload" toast when a new worker is waiting; Lighthouse CI in the repo; a screenshots entry in the manifest for richer install UI; a real-device check of Add to Home Screen on iPhone and Android.

## Next — positions follow-ups
- Tap a chord position, then step through the *next* position with a swipe (phone).
- Show the scale position that contains the chord when on the Song tab; link progression chords to their positions.
- Let the player filter chord positions by "no barre" or "root on the 5th/6th string".
- Chord tab: save a favourite voicing per chord (localStorage) and use it on the Song tab.
- Better fingerings for stretches (the finger number rule is proportional, not human-tested).
- Altered chords in open tunings sometimes have no ≤4-fret shape; consider allowing a 5-fret span as a fallback.
- Test the chord/scale pickers with a real screen reader.

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
