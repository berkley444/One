# themes/ - the theme system

`index.html` stays one file. The themes are written here as plain CSS, and `node tools/build-themes.js` pastes them into
`index.html` between `/*THEMES:BEGIN*/` and `/*THEMES:END*/` (inside `<style id="themes">`). `node tools/build-themes.js --check`
fails if the pasted copy is stale (`tests/browser/themes.js` runs it).

**Silver Hi-Fi is the default and is the base CSS of `index.html`, untouched.** It sets no `data-theme`. Every other theme is
`<html data-theme="id">`, set before first paint from `?theme=` or `localStorage['bpgw.theme']`.

## Files (assembled in filename order)

| File | What |
|---|---|
| `00-defaults.raw.css` | `:root,[data-theme]{...}` - every semantic variable with its Silver value, so an unset variable falls back to Silver |
| `10-engine.css` | Rules (all prefixed `html[data-theme]`) that read those variables: knobs, drums, buttons, panels, fretboard, piano, chips, positions, charts. This is where a theme gets its *structure*; the per-theme files mostly set variables plus a few structural overrides |
| `20-picker.raw.css` | The Theme picker panel and its preview chips (visible in every theme, including Silver) |
| `25-silver.css` | Silver's variables for `[data-theme="silver"]` only, so the picker's Silver preview chip can use them (the page itself never gets this attribute) |
| `30-console.css` ... `80-wood.css` | One theme each |
| `60-minimal.css` / `65-minimal-dark.css` | Minimal Light; Minimal Dark. The first line of `60-minimal.css`, `/*@also minimal-dark*/`, makes the build emit that file for both ids, then `65-` overrides only the colours |
| `art/*.svg` | Texture and knob artwork. `@art(name)` inside a CSS value is replaced by a data URI of `art/name.svg` |

Build rules: `*.raw.css` is copied as written. In any other file `:theme{...}` becomes `[data-theme="id"]{...}` (the id is the file name after `NN-`) and every other rule gets the `html[data-theme="id"]` prefix.

## Adding a theme

1. Copy `30-console.css` to `NN-name.css`; set the variables (`--bg --ink --dim --faint --card --key-* --hand-r --hand-l --root ...`).
   **Set every variable you rely on.** `--faint`, `--dim`, `--c-rel-fg`, `--c-t1`, `--c-t2`, `--cd-lab`, `--t-root-txt` are the usual
   contrast culprits.
2. Add structure rules (knob art on `.cap` / `.cap::before`, drum look, button look).
3. Add an entry to the `THEMES` array in `index.html` (id, name, blurb, fonts, `meter:true` for the LED meter).
4. `node tools/build-themes.js`, then `node tools/theme-shots.js --themes=name` and look at it; `node tests/browser/themes.js name`.

## Rules a theme must keep

- WCAG AA: axe 0 violations and the custom contrast pass in `tests/browser/themes.js` (text >= 4.5:1 incl. SVG labels on their shapes).
- Right hand, left hand and root stay clearly distinct (colour distance > 120) and the root is red or equivalent; the tests check it.
- No horizontal overflow at 390 px.
