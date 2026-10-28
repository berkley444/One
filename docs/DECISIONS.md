# DECISIONS — dated log

Newest first. One entry per decision: what, why, and what it costs.

---

## 2026-10-28 — MIDI play-along and Practice mode (slice 1 of the 2026-10-28 plan)
**Decision:** The piano panel gets a **Practice** row: `● Practice` · `Exact octave` · (chords: `Together / One by one`) · `MIDI`.
- **Input, three ways, one code path (`inputNote`)**: (1) a MIDI keyboard through the Web MIDI API (`MIDI` button; remembered, auto-reconnects next visit); (2) taps/clicks on the on-screen keys — a tapped note counts as *held* for 1.5 s, so a chord can be tapped one key after another, which is what makes practice work on an iPhone; (3) the computer keyboard, `A W S E D F T G Y H U J K` = C…C (plus `O L P ;`), `Z`/`X` shift the octave. Incoming notes light the key **purple**.
- **iOS/unsupported:** if `navigator.requestMIDIAccess` is missing (all iPhone/iPad browsers, Firefox, Safari) or the page is not https, the MIDI button shows a plain-language message and everything else still works. Permission denied / no device / device hot-plug each have their own message.
- **Practice:** the matcher waits for the next step — one note (scales; both hands together = one pair), or the whole chord at once (or one note at a time). The target key pulses yellow with its finger number, held correct notes turn green, a wrong key flashes red, and the line under the keyboard says what to play ("RH 3 · A"), whether it was right, the step count, a clock and the score (correct, wrong, accuracy %, time). Scales go up then back down. At the end: "Finished — 15 of 15, 0 wrong, perfect!" and **Start over**.
- **Rules (all in the THEORY block, so node tests cover them):** a step is complete when every required note is **held at the same time**, each pressed during *that* step — so a note still held from the previous step doesn't count (legato playing works) and a block chord can't be cheated by arpeggiating it. Default = any octave counts (pitch classes); **Exact octave** = the very key. Extra notes in the chord are *wrong* but don't block. The second hand's copy of a note in "hands together" scales (same pitch class, other octave) arriving within 250 ms of the step completing is accepted as a partner, not scored wrong.
- **Sound:** MIDI keys are silent by default (the piano makes its own sound); `🔊 Echo` plays them through the device too. Taps and computer keys always sound (electric-keys voice).
**Why:** He has a MIDI-capable Williams digital piano, and the way he said he wants to learn is by *doing the fingerings*. Practice turns the fingering display into a loop he can check.
**Cost / limits:**
- Web MIDI needs Chrome/Edge (desktop or Android) over https; iOS cannot do MIDI at all. Bluetooth MIDI on desktop needs the OS to pair the piano first.
- Velocity is used only for the echo loudness; the sustain pedal is ignored. The timer starts at the first note, not at "Start".
- Computer-keyboard input can only reach one octave at a time: in "hands together" scales with *Exact octave* on, use MIDI or the on-screen keys.
- Practice state is not saved between sessions (slice 3 adds lesson progress).
**Tests:** 168k node checks now (≈53k new: the MIDI byte parser, the keyboard map, step building, the matcher through simulated MIDI streams — every scale × position × root × hand × both modes, every chord quality × root × voicing × hand × both modes, wrong-note scoring) and a 40-check browser test with a fake MIDI device (`prac.js`).

## 2026-10-27 — Separate piano control panel with hand + finger guidance (replaces the "All positions at a glance" thumbnails)
**Decision:** The chord tab's thumbnail grid is gone (it duplicated the 1–6 buttons). In its place — and on the PLAY tab for scales — the piano gets its **own metal control panel** that drives the keyboard independently of the guitar voicing.
- **Hand:** R / L / L+R (left hand bass, right hand chord; for scales, hands together an octave apart) / L=R (chords: both hands the same notes, an octave apart).
- **Octave:** drum selector C2–C6 for where the right hand starts (default C4 = middle C; the left hand sits one octave lower). Scales also get a 1- or 2-octave Length toggle.
- **Position buttons (one line, never wrap):** chords show inversions — Root / 1st / 2nd / 3rd; chords with 5+ tones show named voicings instead — *Root + upper* (LH root and 5th, RH colour tones), *Rootless A*, *Rootless B* (3rd- or 7th-on-bottom, jazz style) and *Shell* (root, 3rd, 7th). Scales show the **mode started on each degree** (Dorian … Ionian for 7-note scales; Box 1–5 for pentatonics, 1–6 for blues). The last button, **Match guitar**, lights exactly the pitches of the chosen guitar voicing / box, split between the hands (chords: ≤5 notes per hand; scales: split at middle C).
- **Play buttons:** Play chord / Arpeggio ↑↓, or Scale ↑↓ / Up / Arpeggio. Audio uses the electric-keys voice. While playing, each key lights in time with its finger number and a "Now: RH 3 · E" line.
- **Showing what to play with which finger:** every lit key carries a dot with a finger number 1–5 (1 = thumb … 5 = pinky); **green = right hand, blue = left hand**, a red ring marks the root, and the note name is above the dot. A readout under the buttons gives the same thing in words ("RH: C(1) E(3) G(5) · LH: C(5)") plus a legend. The other notes of the chord/scale are faint pips. Where two hands share a key, the dots stack.
**Fingering rules (so the numbers are not made up):**
- Scales use the standard conservatory tables (Hanon / ABRSM): one fingering per major and minor key, both hands, for as many octaves as shown. Natural and harmonic minor share a table; melodic minor uses it unless the thumb would land on a black key. G♯ minor LH uses its own table.
- **Modes borrow the parent major scale's fingering** (D Dorian = C major's notes, so it starts on finger 2). This is the usual teaching convention and keeps the fingers identical when the mode changes.
- Pentatonic, blues and the exotic scales have no standard table, so a small dynamic-programming search picks fingers: avoid the thumb (and pinky mid-run) on black keys, minimise stretches and crossings, prefer ending on 5 (RH) / 1 (LH).
- Chords: triads RH 1-3-5, LH 5-3-1; 1st inversion RH 1-2-5; 2nd inversion LH 5-2-1; 7ths RH 1-2-3-5, LH 5-3-2-1; if the thumb would fall on a black key an alternate pattern is used.
**Why:** He wants to *learn* the piano and could not tell which hand or finger to use; the thumbnails were redundant with the numbered buttons. A panel dedicated to the piano makes that the learning surface and removes the old "Piano shows" switch.
**Cost / limits:**
- Fingerings are **suggestions** for the standard way of playing, not the only way; the exotic-scale and Match-guitar-scale fingerings are algorithmic and should be checked by a teacher.
- The all-black-key F♯ major pentatonic must put the thumb on a black key — it is the one unavoidable case.
- Voicings with more than 5 notes per hand are folded or reduced; 5+ note chords therefore omit tones (the 5th first), and the labels say which.
- Storage key is now `bpgw.v3` (new piano state: hand, octave, positions); old saved settings are ignored once. Hash links carry `mode=`, `pp=` (piano position), `hd=` (hand), `po=` (octave), `pn=` (octaves).
**Implementation notes:** all piano maths (`pianoVoicings`, `pianoChordPlan`, `pianoScalePlan`, `ruleFingering`, `chordFingers`, `splitHands`, match plans) is inside the `<THEORY>` block, so node tests cover it (≈115k checks now). UI is `pianoPanelHTML` / `playPiano` with event delegation (`data-act="phand|poct|poctn|ppos|pplay"`).

## 2026-10-27 — Position buttons 1–6 for chords and 1–7 / 1–5 for scales (modelled on all-guitar-chords.com)
**Decision:** Under the fretboard, a single row of small buttons picks a *position*. The selected one is dark (amber edge); the row never wraps, even at 390 px.
- **Chords:** up to 6 real voicings up the neck, generated algorithmically for the *current tuning* (not a lookup table, so DADGAD, open G, 7-string and bass all work). Rules: ≤ 4-fret span, ≤ 4 fingers (a barre counts as one), strings muted only at the ends, open strings only when the hand is in the first position, root in the bass preferred, every essential tone present. The 5th may be dropped on 4+ note chords; a plain 9th is dropped when an 11th/13th is present; altered tones (♭5 ♯5 ♭9 ♯9 ♯11) are never dropped. Each position shows a numbered-finger diagram (root dot red, barre bar, × muted, ○ open), Strum / Arpeggio / Block buttons, a thumbnail of all six, and the same notes ringed on the fretboard and the piano ("Piano shows: GUITAR VOICING" by default).
- **Scales:** 7-note scales get **7 positions** (three notes per string), each button labelled with its mode — C major gives Ionian…Locrian, harmonic and melodic minor use their own mode names (Phrygian dominant, Altered, …). Pentatonics and blues get **5 boxes** (blues = minor-pentatonic boxes plus the ♭5 blue note). "All" stays the full-neck default. Picking a position dims everything outside it to faint pips, ringed notes are the ones to play, finger suggestions replace the labels, and a fret/finger-by-string table appears. "Play position N" plays it up and down.
**Why:** He liked that the 1–6 buttons make chord shapes learnable and that the scale positions make the *modes* visible — the same notes, played from a different start. This is the "tutorial, not engine" idea applied to the neck.
**Chord library:** 51 qualities (the 50 he listed plus the major-♭5 triad), as a one-tap root strip and a one-tap grouped quality grid (Triads, 6ths & add9, 7ths, Altered 7ths, 9ths, 11ths & 13ths). Formulas are checked against an independent table in the tests. Only the original 13 qualities are used when *harmonising* a scale and in `identifyQuality`, so Roman-numeral and progression behaviour did not change.
**Cost / limits:**
- Dense altered chords in open tunings (e.g. 7(♭5,♭9) in DADGAD) can have fewer than 4 comfortable shapes or none; the UI says so and still lights the chord's notes. Power chords have only ~4–5 root-in-bass shapes, so inversions fill the rest.
- Scale boxes near the end of the neck drop notes beyond fret 15; a ±12 copy of a box is drawn only if at least half of it fits.
- Finger numbers are *suggestions* (1 + proportional to the fret within the box), not a teaching method.
- Storage key is now `bpgw.v2` (new defaults: piano follows the guitar voicing, positions stored). Old saved settings are ignored once.
**Implementation notes:** theory (voicing search, positions, mode names) is inside the `<THEORY>` block so node tests cover it; the UI uses event delegation (`data-act="spos|cpos"`); hash links carry `sp=` (scale position) and `cp=` (chord position).

## 2026-10-27 — Ship a single-file web app, served by GitHub Pages
**Decision:** `index.html` at the repo root is a complete, dependency-free web version of Big Pear Guitar Works (HTML + CSS + JS in one file; fonts optional via CDN).
**Why:** The fastest way to make the project real, shareable by link, and testable. It runs on a phone browser today without Xcode. It is also a living specification of the design.
**Cost:** It is *not* the Mac app. See the next entry.

## 2026-10-27 — The Mac/Xcode project is the real app and must be added to this repo
**Decision:** The SwiftUI/Xcode project (the one that produced `screenshots/gm_original.png`) is the real product. It has to be committed here. Until it is, this repo is incomplete.
**Why:** Without it, the "single source of truth" claim is false — the true app would still live outside the repo, on one machine.
**Status:** **OPEN.** The assistant that built this web version could not reach his Mac files. Adding it is the first item in `NEXT.md`.

## 2026-10-27 — The repo is the single source of truth
**Decision:** Specs, decisions, research, screenshots and code live here. Chats are scratch space; anything that matters gets committed.
**Why:** He asked directly whether the app "needs to be in a folder somewhere." It does. The project had been living only in chat history, which is how context got lost (see `REBUILD_POSTMORTEM.md`).
**How:** Agents read `docs/` first, every time (`HOW_TO_WORK_WITH_AGENTS.md`).

## 2026-10-27 — Tutorial, not engine
**Decision:** The app teaches *why* (formulas, intervals, spellings, the math) rather than being a generator or player that hides the reasoning. The progression generator exists to *demonstrate* harmony in the chosen key, with roman numerals shown, not to be a song-writing tool.
**Why:** That's the original intent: scale/chord/tuning/circle/math — a learning instrument.
**Consequence:** Every readout shows its work (note spelling by degree, `n` in `440×2^(n/12)`, step patterns W/H).

## 2026-10-27 — Piano is layered on the guitar app, not a separate app
**Decision:** The piano keyboard sits under the fretboard and lights up the same notes. Open-string markers show where the guitar's strings live on the keyboard.
**Why:** The bridge *is* the idea — someone who knows the fretboard can see the piano. The KeyForge research (`research/`) is for a full piano teacher; this is the first slice of it, built on what already exists.
**Cost:** Two instrument views on one screen; the piano scrolls sideways on phones.

## 2026-10-27 — Theory logic is testable and lives in one block
**Decision:** All music theory is in a `// <THEORY> … // </THEORY>` block inside `index.html`; `tests/theory.test.js` extracts and runs it in node.
**Why:** Keeps the app a single file *and* testable. Spelling (E♯ in F♯ major, F♯♯ in G♯ harmonic minor) and frequency math are the things most likely to be silently wrong.
**Run:** `node tests/theory.test.js`

## 2026-10-27 — Key signatures and spelling come from scale degrees, not a lookup of names
**Decision:** Notes are spelled by letter-per-degree. Modes and pentatonics get a key signature from their parent major.
**Why:** Avoids the classic bug of showing G♭ where F♯ belongs, and keeps rare keys correct.

## 2026-10-26 — Compare the original to the rebuild
`screenshots/gm_original.png` vs `screenshots/gm_rebuild.png` was captured to show what the rebuild lost. See `REBUILD_POSTMORTEM.md`.

## 2026-10-25 — Research the piano-teaching market before building
Top-100 piano-app research and a full build prompt for a native piano app were written (`research/`). The trademark status of the name "KeyForge" has **not** been checked (listed in `NEXT.md`).
