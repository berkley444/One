# HOW TO WORK WITH AGENTS — the recipe

This is the process that avoids the "rebuild that looked nothing like the original" failure (`REBUILD_POSTMORTEM.md`). Paste it into the first message of any agent session.

## The recipe

1. **Agent reads the docs first.** Before touching anything: `README.md`, `docs/SPEC.md`, `docs/DECISIONS.md`, `docs/NEXT.md`, and look at `docs/screenshots/`. If the agent can't summarise the look and the intent back to you in a few lines, it isn't ready.
2. **Small slices.** One slice = one thing you can name in a sentence ("add the 7-string tuning"). No "rebuild the app."
3. **Every slice has a testable "done".** Before building, the agent writes down the check:
   - logic → a test that fails first, passes after (`node tests/theory.test.js`)
   - UI → a screenshot at desktop and phone width, compared against the reference
4. **Mockup before build.** For anything visual, the agent shows a mockup or a screenshot of a rough version **before** the full build. You approve or redirect. Cheap to change now, expensive later.
5. **Build the slice.** Touch only what the slice names. Say what you are *not* changing.
6. **Review and fix.** The agent looks at its own output (screenshots, test run), lists what is ugly or wrong, and fixes it *before* reporting back.
7. **Commit and log.** Commit with a clear message. If a decision was made, add a dated entry to `DECISIONS.md`. Update `NEXT.md`.
8. **Report briefly:** what changed, how it was checked, what's next, what needs a human decision.

## Rules of thumb

- **The repo is the memory.** If it isn't committed, it doesn't exist. Chats get lost; files don't.
- **Narrow complaint → narrow fix.** "Scrolling is annoying" is a scrolling fix.
- **Show, don't claim.** Screenshots and test output, not "it should work."
- **Ask for the missing context** rather than guessing from a single screenshot.
- **Keep the look.** This project's identity is the brushed-metal panel, knobs, POWER light and black background. Never replace them with defaults.
- **One agent, one branch, one slice.** Merge small.

## Starter prompt

> Read `README.md` and everything in `docs/` first, including the screenshots. Tell me in five lines what Big Pear Guitar Works is and what it must look like. Then propose the next slice from `NEXT.md` with a testable "done" and, if it's visual, a mockup. Don't build until I say go.
