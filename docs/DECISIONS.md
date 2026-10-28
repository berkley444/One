# DECISIONS — dated log

Newest first. One entry per decision: what, why, and what it costs.

---

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
