# REBUILD POSTMORTEM — what the rebuild dropped, and why

Compare the two screenshots side by side:

| Original (`screenshots/gm_original.png`) | Rebuild (`screenshots/gm_rebuild.png`) |
|---|---|
| Black background | White iOS default |
| Brushed-metal `MUSIC CONTROL` panel | No panel |
| Knob-like drum selectors (PITCH / ROOT / SCALE / TUNING / MODE) | Small blue text buttons (Key, Scale) |
| Glowing orange **POWER** light | Gone |
| Gold-bordered fretboard, green notes, red roots | Brown fretboard, blue notes, orange roots |
| `CHORD` section with formula (1 3 5) and notes (C E G) and a chord-shape diagram | Segmented `Scale / Chord` switch |
| Bottom bar: **PLAY** and **ƒ(x) MATH** | A strip of triads; no MATH tab |
| Electric / acoustic pager dots under the fretboard | Gone |

## What happened

The rebuild produced working music logic (see the Swift files and tests it generated: theory engine, fretboard geometry, voicing generator) but **threw away the product's identity**. It looks like a stock settings screen with a fretboard on it.

## Why

1. **The prompt was built from one screenshot and a complaint about scrolling.** A single PLAY-tab screenshot shows maybe a third of the app. Nothing in it says what the drums *do*, what the MATH tab contains, or that the panel look is the point.
2. **The context lived in chats.** The original design intent — brushed metal, knobs, POWER light, black background, tutorial-not-engine — was never written down anywhere an agent would be forced to read. A fresh agent can only honour what it is shown.
3. **"Fix scrolling" was read as "re-layout everything."** The complaint was about one behaviour; the rebuild treated it as licence to rewrite the whole UI, including the parts that were fine.
4. **Nobody saw a mockup before the build.** The first time the look was visible was *after* the entire app existed, when changing it was expensive.
5. **No acceptance test for "looks like the original."** The tests covered logic (fret positions, voicings). Nothing checked the visual identity.
6. **Instructions ranked logic above feel.** "Correct note placement" was specified in detail; "this must look like brushed metal with a glowing power light" was not specified at all.

## What to do differently (and where it's written down)

- Put the design in `SPEC.md`, with a screenshot, **before** any code. ✔ done in this repo.
- Agents read `docs/` first. ✔ `HOW_TO_WORK_WITH_AGENTS.md`.
- Mockup first, approve, then build. ✔ same.
- Work in slices with a testable "done"; for UI, "done" includes a screenshot compared with the reference.
- When a complaint is narrow, the fix is narrow. State what you are *not* touching.

## Salvage

The rebuild's logic is not worthless: fretboard geometry (orientation-aware layout) and the voicing generator are worth reading when the Xcode project is added. Port the **logic**, restore the **look**.
