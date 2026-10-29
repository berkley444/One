# SPEC — Big Pear Guitar Works

> The vision, in Jeremy's words where we have them, and in plain restatement where we don't.
> If this file and the code disagree, this file wins until someone changes it on purpose (and logs why in `DECISIONS.md`).

## What it is

A guitar app that **teaches the theory under the notes** — and, as a second act, **bridges guitar to piano**.
It is *not* a song engine, not a tab player, and not a game (the Chord Quiz is practice with feedback, not points-chasing; the chord unlock is a toy that is off by default). It is a tutorial: pick a key, a scale, a tuning, and *see and hear* what it is made of.

## The look

**Default (since 2026-10-28): Minimal Light** — flat, airy, iOS-style segmented controls on a light page. Jeremy picked it from eight themes. Every other theme, including the original below, is one tap away in the Theme picker or via `?theme=` (`silver`, `console`, `pedal`, `tube`, `minimal`, `minimal-dark`, `synth`, `wood`). A saved choice always wins over the default.

### The original look (Silver Hi-Fi, `?theme=silver`; non-negotiable *as a theme*)

Taken from the original app (see `screenshots/gm_original.png`):

- **Black background.**
- A **brushed-metal control panel** at the top, titled `MUSIC CONTROL`.
- **Knob-like selectors** on the panel — drum faces with knurled step edges on both sides: `PITCH` (440), `ROOT` (C), `SCALE` (Major), `TUNING` (Standard), `MODE` (Scale).
- A **glowing orange POWER light** in the corner of the panel.
- A gold-bordered **fretboard** with green scale notes and **red root notes**.
- A two-tab bottom bar: **PLAY** and **ƒ(x) MATH**.
- Section headings in a condensed grey display face (`GUITAR`, `CHORD`) with a small context line (`C MAJOR — STANDARD`).

## What it does

1. **Root picker** with sensible sharps/flats (F♯ vs G♭ chosen by key, not at random).
2. **Scale picker** — major, natural / harmonic / melodic minor, major & minor pentatonic, blues, and the modes.
3. **Harmonised diatonic chords** with roman numerals (I ii iii IV V vi vii°), triads or sevenths.
4. **Chord builder** — 13 qualities; shows the *formula*, the *notes*, and the *intervals*.
5. **Interactive circle of fifths** — click a key to set it; shows the relative minor and the key signature.
6. **Tuning picker** — standard, drop D, DADGAD, open G (plus a few more), half-step down, 7-string.
7. **Fretboard**, frets 0–15, highlighting scale or chord notes with the root coloured.
8. **Piano** — at least three octaves (this build: full 88 keys) showing *the same notes*. This is the guitar-to-piano bridge.
9. **MATH ƒ(x) tab** — the frequency of every note, `f(n) = 440 × 2^(n/12)`, with `n` worked out step by step.
10. **Sound** — notes, chords and scales play through WebAudio.
11. **Rhythm** — time signature and tempo, a metronome, and a **Generate progression** button that writes 4–8 bars in the current key and plays them.
12. **MIDI play-along & Practice** (2026-10-28) — connect a digital piano by Web MIDI (or tap the on-screen keys / use the computer keyboard); incoming notes light the keys; Practice waits for the next note or chord of the chosen scale position / chord, shows the fingering, scores right/wrong/time.
13. **Song generator** (2026-10-28) — key + scale + time signature + tuning + idea number → intro/verse/chorus/bridge with chords, strum patterns by meter, a scale-tone melody, guitar tab, piano fingering and playback.
14. **Lessons** (2026-10-28) — the LEARN tab: 7 lessons / 33 short parts that teach the guitar-to-piano bridge (finger numbers, five-finger position, C major scale, triads and inversions, reading the staff from tab, Wheel in the Sky intro simplified and full). Each part has text, a guitar-bridge note, the exercise on a staff with tab, **Hear it**, and Practice (MIDI / on-screen keys / computer keys) with progress saved on the device.
15. **Installable & accessible** (2026-10-28) — works offline after the first visit and can be installed to a home screen / desktop (manifest + service worker); keyboard-operable piano and fretboard, skip link, landmarks, screen-reader names, live announcements, reduced-motion / high-contrast support; zero axe-core violations.
16. **Clear / Identify chord** (2026-10-28) — `✎ Clear / Identify` on the fretboard toolbar clears the board and lets you place notes yourself (tap frets; the left column cycles open ○ / muted ×; one note per string; tap again to remove). The app names the chord live: root, quality, and bass / inversion / slash, with other honest names and a note-and-interval breakdown on the dots; two notes give the interval; unmatched notes are listed. **Show on piano** and **▶ Hear it** work on what you placed. Works in every tuning, with mouse, touch and keyboard, in every theme; the placement is shareable in the URL hash (`id=`) and remembered in `bpgw.v3`.
17. **Chord Quiz** (2026-10-28) — a target chord name (open majors/minors → sevenths → slash chords → all 50 qualities), any voicing or a chosen position; you place the notes and press Check. Graded on pitch classes (plus the bass for slash chords and the position if asked), with the missing and extra notes explained, Hint, Show answer, Next, and a score / streak / best streak kept in localStorage.
18. **Chord unlock** (2026-10-28, optional, **off by default**) — a pop-up fretboard that asks the visitor to play a chosen chord to come in, once per browser session. **A fun gate, not security**: the site is a public static page, so it only asks a question; it is switched on and off from the lock icon in the header, and "Show me" always lets you in.
19. **Profiles** (2026-10-29) — on-device players with no password or server: header avatar button → Players panel (switch / new / edit name + colour / delete with confirm / export / import a JSON file), a skippable first-visit "Who's playing?", and per-player settings, theme, quiz score, lesson progress and chord-unlock setting. See DECISIONS 2026-10-29 and the cloud plan in NEXT.

## In his words

These are verbatim from the conversations that produced this repo:

> "I need you to look at the top 100 piano teaching apps… Do NOT come back with the minimum amount of information."

> "I was iterating in ChatGPT with very slow progress. When I did the first version here, the result wasn't even close."

> "Important question here. At the moment this app lives completely in these chats. Does it need to be in a folder somewhere?"

> "you should do something that is really impressive right now. I don't know what it is. Pick something"

What those four lines say about how he wants to work: **depth over minimum effort**, **fast visible progress**, **the project must live somewhere real (this repo)**, and **the agent should take initiative and show something**.

## Principles

- **Tutorial, not engine.** Every screen should answer "why is that note there?"
- **One source of truth.** The repo, not a chat.
- **Looks like the original.** If a change makes it look like a default settings screen, it's wrong.
- **Honest numbers.** Equal temperament shown with its work; just intonation shown next to it so the compromise is visible.
- **No dependencies, no accounts, no tracking.** Works offline from one file.

## Out of scope (for now)

Song import, tab/notation rendering, accounts, payments. (MIDI input was out of scope until 2026-10-28; it is now in — see DECISIONS.) The piano-teacher product (KeyForge) is researched in `research/` but is a separate effort; this app is its first stepping stone.
