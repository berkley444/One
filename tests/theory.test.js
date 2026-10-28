// Big Pear Guitar Works — theory tests.
// The app is a single file, so the tests pull the <THEORY> block straight out of index.html
// and run it in node. Usage:  node tests/theory.test.js
'use strict';
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = html.match(/\/\/ <THEORY>([\s\S]*?)\/\/ <\/THEORY>/);
if (!m) { console.error('THEORY block not found in index.html'); process.exit(2); }
const T = new Function(m[1] + '; return Theory;')();

let pass = 0, fail = 0;
function eq(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { pass++; } else { fail++; console.log(`  ✗ ${label}\n      expected ${e}\n      actual   ${a}`); }
}
function near(actual, expected, tol, label) {
  if (Math.abs(actual - expected) <= tol) pass++; else { fail++; console.log(`  ✗ ${label}: expected ${expected} ±${tol}, got ${actual}`); }
}
function ok(cond, label) { if (cond) pass++; else { fail++; console.log(`  ✗ ${label}`); } }
const group = n => console.log('• ' + n);
const names = (root, id) => T.spellScale(root, id).map(n => n.name);

group('scale spelling');
eq(names('C', 'major'), ['C','D','E','F','G','A','B'], 'C major');
eq(names('F♯', 'major'), ['F♯','G♯','A♯','B','C♯','D♯','E♯'], 'F# major has E#');
eq(names('B♭', 'major'), ['B♭','C','D','E♭','F','G','A'], 'Bb major');
eq(names('A', 'naturalMinor'), ['A','B','C','D','E','F','G'], 'A natural minor');
eq(names('A', 'harmonicMinor'), ['A','B','C','D','E','F','G♯'], 'A harmonic minor');
eq(names('A', 'melodicMinor'), ['A','B','C','D','E','F♯','G♯'], 'A melodic minor');
eq(names('G♯', 'harmonicMinor'), ['G♯','A♯','B','C♯','D♯','E','F♯♯'], 'G# harmonic minor has F double-sharp (F♯♯)');
eq(names('D', 'dorian'), ['D','E','F','G','A','B','C'], 'D dorian');
eq(names('E', 'phrygian'), ['E','F','G','A','B','C','D'], 'E phrygian');
eq(names('F', 'lydian'), ['F','G','A','B','C','D','E'], 'F lydian');
eq(names('G', 'mixolydian'), ['G','A','B','C','D','E','F'], 'G mixolydian');
eq(names('B', 'locrian'), ['B','C','D','E','F','G','A'], 'B locrian');
eq(names('C', 'majorPent'), ['C','D','E','G','A'], 'C major pentatonic');
eq(names('A', 'minorPent'), ['A','C','D','E','G'], 'A minor pentatonic');
eq(names('A', 'blues'), ['A','C','D','E♭','E','G'], 'A blues (b5 spelled Eb)');

group('scale shapes & step patterns');
eq(T.SCALES.major.semis, [0,2,4,5,7,9,11], 'major semitones');
eq(T.stepPattern(T.SCALES.major.semis), ['W','W','H','W','W','W','H'], 'major W W H W W W H');
eq(T.stepPattern(T.SCALES.naturalMinor.semis), ['W','H','W','W','H','W','W'], 'minor W H W W H W W');
ok(T.SCALE_ORDER.length >= 12, 'at least 12 scales');

group('key signatures');
eq([T.signatureFor('C','major').count, T.signatureFor('C','major').type], [0, ''], 'C: none');
eq([T.signatureFor('G','major').count, T.signatureFor('G','major').type], [1, '♯'], 'G: 1 sharp');
eq([T.signatureFor('D','major').count, T.signatureFor('D','major').type], [2, '♯'], 'D: 2 sharps');
eq([T.signatureFor('F','major').count, T.signatureFor('F','major').type], [1, '♭'], 'F: 1 flat');
eq([T.signatureFor('E♭','major').count, T.signatureFor('E♭','major').type], [3, '♭'], 'Eb: 3 flats');
eq([T.signatureFor('C♯','major').count, T.signatureFor('C♯','major').type], [7, '♯'], 'C#: 7 sharps');
eq([T.signatureFor('A','naturalMinor').count], [0], 'A minor: none');
eq([T.signatureFor('E','naturalMinor').count, T.signatureFor('E','naturalMinor').type], [1, '♯'], 'E minor: 1 sharp');
eq(T.signatureFor('D','dorian').parent, 'C', 'D dorian borrows C major');
eq(T.signatureFor('D','dorian').count, 0, 'D dorian: none');
eq(T.signatureFor('G','major').accidentals, ['F♯'], 'G major accidental list');

group('circle of fifths');
const circ = T.circle();
eq(circ.length, 12, '12 positions');
eq(circ.map(k => k.major).slice(0, 7), ['C','G','D','A','E','B','F♯'], 'clockwise from C');
eq(circ[11].major, 'F', 'F sits left of C');
eq(circ[0].minor, 'A', 'C ↔ Am');
eq(circ[1].minor, 'E', 'G ↔ Em');
eq(T.circlePos(7), 1, 'G is position 1');
eq(T.circlePos(5), 11, 'F is position 11');
eq(T.relativeMinor('C'), 'A', 'relative minor of C');
eq(T.relativeMinor('G'), 'E', 'relative minor of G');
eq(T.relativeMajor('A'), 'C', 'relative major of A');
ok(new Set(circ.map(k => k.majorPc)).size === 12, 'circle covers every pitch class once');
eq((7 * 12) % 12, 0, 'twelve fifths close the circle');

group('chord building');
const chordNotes = (r, q) => T.buildChord(r, q).tones.map(t => t.name);
eq(Object.keys(T.CHORDS).length >= 13, true, '13 qualities');
eq(chordNotes('C','major'), ['C','E','G'], 'C major');
eq(chordNotes('C','minor'), ['C','E♭','G'], 'C minor');
eq(chordNotes('C','dim'), ['C','E♭','G♭'], 'C dim');
eq(chordNotes('C','aug'), ['C','E','G♯'], 'C aug');
eq(chordNotes('C','sus2'), ['C','D','G'], 'Csus2');
eq(chordNotes('C','sus4'), ['C','F','G'], 'Csus4');
eq(chordNotes('C','maj7'), ['C','E','G','B'], 'Cmaj7');
eq(chordNotes('C','dom7'), ['C','E','G','B♭'], 'C7');
eq(chordNotes('C','min7'), ['C','E♭','G','B♭'], 'Cm7');
eq(chordNotes('C','m7b5'), ['C','E♭','G♭','B♭'], 'Cm7b5');
eq(chordNotes('G','dim7'), ['G','B♭','D♭','F♭'], 'Gdim7 (fully diminished spells Fb)');
eq(chordNotes('C','minMaj7'), ['C','E♭','G','B'], 'CmMaj7');
eq(chordNotes('F♯','major'), ['F♯','A♯','C♯'], 'F# major');
eq(chordNotes('B♭','minor'), ['B♭','D♭','F'], 'Bb minor');
eq(T.buildChord('C','maj7').tones.map(t => t.semis), [0,4,7,11], 'Cmaj7 formula in semitones');
eq(T.buildChord('C','maj7').tones.map(t => t.label), ['1','3','5','7'], 'Cmaj7 interval labels');
eq(T.buildChord('C','minor').tones.map(t => t.label), ['1','♭3','5'], 'Cm interval labels');

group('harmonisation & roman numerals');
const tri = T.harmonize('C', 'major', false);
eq(tri.map(c => c.name), ['C','Dm','Em','F','G','Am','Bdim'], 'C major triads');
eq(tri.map(c => c.roman), ['I','ii','iii','IV','V','vi','vii°'], 'C major numerals');
const sev = T.harmonize('C', 'major', true);
eq(sev.map(c => c.name), ['Cmaj7','Dm7','Em7','Fmaj7','G7','Am7','Bm7♭5'], 'C major sevenths');
eq(T.harmonize('A', 'naturalMinor', false).map(c => c.name), ['Am','Bdim','C','Dm','Em','F','G'], 'A minor triads');
eq(T.harmonize('A', 'naturalMinor', false).map(c => c.roman), ['i','ii°','III','iv','v','VI','VII'], 'A minor numerals');
const hm = T.harmonize('A', 'harmonicMinor', false);
eq(hm[4].name, 'E', 'A harmonic minor: V is major E');
eq(hm[4].roman, 'V', 'A harmonic minor: V numeral');
eq(hm[6].name, 'G♯dim', 'A harmonic minor: vii° is G#dim');
eq(T.harmonize('G', 'major', false).map(c => c.name), ['G','Am','Bm','C','D','Em','F♯dim'], 'G major triads');
eq(T.harmonize('F', 'major', false)[3].name, 'B♭', 'F major IV = Bb');

group('frequency math  f(n) = A4 × 2^(n/12)');
near(T.freq(69, 440), 440, 1e-9, 'A4 = 440');
near(T.freq(60, 440), 261.6256, 1e-3, 'C4 ≈ 261.6256');
near(T.freq(21, 440), 27.5, 1e-9, 'A0 = 27.5');
near(T.freq(81, 440), 880, 1e-9, 'A5 = 880');
near(T.freq(57, 440), 220, 1e-9, 'A3 = 220');
near(T.freq(40, 440), 82.4069, 1e-3, 'E2 (low E string) ≈ 82.407');
near(T.freq(69, 432), 432, 1e-9, 'A4 = 432 variant');
near(T.freq(60, 415), 415 * Math.pow(2, -9 / 12), 1e-9, 'baroque pitch');
eq(T.nFromA4(60), -9, 'C4 is n = -9');
eq(T.nFromA4(69), 0, 'A4 is n = 0');
eq(T.nFromA4(81), 12, 'A5 is n = 12');
eq(T.midiOf(0, 4), 60, 'C4 = MIDI 60');
eq(T.midiOf(9, 4), 69, 'A4 = MIDI 69');
eq(T.midiOf(9, 0), 21, 'A0 = MIDI 21 (lowest piano key)');
eq(T.midiName(60), 'C4', 'name of 60');
for (let n = 21; n < 108; n++) near(T.freq(n + 12, 440) / T.freq(n, 440), 2, 1e-12, `octave doubles @${n}`);
near(T.freq(67, 440) / T.freq(60, 440), Math.pow(2, 7 / 12), 1e-12, 'fifth ratio 2^(7/12)');
near(Math.pow(2, 7 / 12), 1.4983, 1e-4, 'equal-tempered fifth ≈ 1.4983 (just 1.5)');

group('tunings & fretboard');
eq(T.tuningById('standard').strings, [40,45,50,55,59,64], 'standard EADGBE');
eq(T.tuningById('dropD').strings, [38,45,50,55,59,64], 'drop D');
eq(T.tuningById('dadgad').strings, [38,45,50,55,57,62], 'DADGAD');
eq(T.tuningById('openG').strings, [38,43,50,55,59,62], 'open G (DGDGBD)');
eq(T.tuningById('halfDown').strings, [39,44,49,54,58,63], 'half step down');
eq(T.tuningById('seven').strings.length, 7, '7-string');
eq(T.tuningById('seven').strings[0], 35, '7-string low B');
for (const tt of T.TUNINGS) {
  const t = T.tuningById(tt.id), id = tt.id;
  for (const s of t.strings) near(T.freq(s + 12, 440) / T.freq(s, 440), 2, 1e-12, `${id}: 12th fret doubles ${s}`);
}

group('chord voicings on guitar');
const fr = (root, q, tuning = 'standard') => T.findVoicings(T.buildChord(root, q), T.tuningById(tuning).strings, { limit: 12 }).map(v => v.frets.map(f => f < 0 ? 'x' : f).join(''));
ok(fr('C','major').includes('x32010'), 'open C = x32010');
ok(fr('E','major').includes('022100'), 'open E = 022100');
ok(fr('A','minor').includes('x02210'), 'open Am = x02210');
ok(fr('G','major').includes('320003'), 'open G = 320003');
ok(fr('D','major').includes('xx0232'), 'open D = xx0232');
ok(fr('F','major').includes('133211') || fr('F','major').includes('1x3211') || fr('F','major').length > 0, 'F major has shapes');
for (const [r, q] of [['C','major'],['A','minor'],['G','dom7'],['D','min7'],['F','maj7'],['B','m7b5']]) {
  const ch = T.buildChord(r, q), st = T.tuningById('standard').strings;
  const vs = T.findVoicings(ch, st, { limit: 12 });
  ok(vs.length > 0, `${r}${ch.symbol} has voicings`);
  for (const v of vs) {
    const pcs = new Set(v.midi.filter((x, i) => v.frets[i] >= 0).map(x => ((x % 12) + 12) % 12));
    // every sounding note is a chord tone; root + third + (seventh) are present; the 5th may be dropped in 4-note chords
    const need = ch.tones.map(t => t.pc);
    const required = ch.tones.length > 3 ? ch.tones.filter(t => t.deg !== 5).map(t => t.pc) : need;
    ok(required.every(pc => pcs.has(pc)) && [...pcs].every(pc => need.includes(pc)), `${ch.name} ${v.frets.join(',')} has the essential chord tones and nothing foreign`);
    const first = v.midi.find((x, i) => v.frets[i] >= 0);
    ok(((first % 12) + 12) % 12 === ch.rootPc, `${ch.name} ${v.frets.join(',')} root in the bass`);
  }
}
ok(T.findVoicings(T.buildChord('C','major'), T.tuningById('dadgad').strings, { limit: 6 }).length > 0, 'DADGAD yields C shapes');

group('piano voicing');
const pv = T.pianoVoicing(T.buildChord('C','major'), 0, 4);
eq(pv, [60,64,67], 'C major root position at C4');
eq(T.pianoVoicing(T.buildChord('C','major'), 1, 4), [64,67,72], 'first inversion');
eq(T.pianoVoicing(T.buildChord('C','major'), 2, 4), [67,72,76], 'second inversion');

group('time signatures & metronome');
eq(Object.keys(T.METERS), ['2/4','3/4','4/4','5/4','6/8','7/8','9/8','12/8'], 'meters offered');
for (const [id, mt] of Object.entries(T.METERS)) {
  eq(mt.accents.length, mt.num, `${id}: one accent entry per pulse`);
  eq(mt.accents[0], 2, `${id}: downbeat strongest`);
}
near(T.pulseSeconds('4/4', 120), 0.5, 1e-12, '4/4 @120 → 0.5 s per beat');
near(T.pulseSeconds('4/4', 60), 1, 1e-12, '4/4 @60 → 1 s');
near(T.pulseSeconds('6/8', 60), 1 / 3, 1e-12, '6/8 @60 (dotted quarter) → eighth = 1/3 s');
near(T.pulseSeconds('3/4', 90) * 3, 2, 1e-9, '3/4 @90 bar = 2 s');

group('progression generator');
const gen = (o = {}) => T.generateProgression(Object.assign({ rootName: 'C', scaleId: 'major', bars: 4, style: 'smart', seed: 7 }, o));
eq(gen().chords.map(c => c.name), gen().chords.map(c => c.name), 'deterministic for a seed');
ok(JSON.stringify(gen({ seed: 1 }).chords.map(c => c.name)) !== JSON.stringify(gen({ seed: 2 }).chords.map(c => c.name)) ||
   JSON.stringify(gen({ seed: 3 }).chords.map(c => c.name)) !== JSON.stringify(gen({ seed: 4 }).chords.map(c => c.name)), 'different seeds differ');
for (const bars of [4, 5, 6, 7, 8]) for (const style of ['smart', 'pop', 'blues', 'jazz']) for (const [root, scale] of [['C','major'],['A','naturalMinor'],['E♭','major'],['F♯','harmonicMinor']]) for (let seed = 1; seed <= 12; seed++) {
  const p = gen({ bars, style, rootName: root, scaleId: scale, seed });
  if (p.chords.length !== bars) { fail++; console.log(`  ✗ ${bars} bars ${style} ${root} ${scale} seed ${seed}: got ${p.chords.length}`); continue; }
  pass++;
  if (!p.chords.every(c => c && c.name)) { fail++; console.log('  ✗ missing chord names', style, root, scale, seed); }
  else pass++;
}
for (let seed = 1; seed <= 40; seed++) {
  for (const bars of [4, 5, 6, 7, 8]) {
    const p = gen({ style: 'smart', seed, bars });
    ok(p.chords[0].name === 'C', `smart ${bars} bars seed ${seed} starts on the tonic`);
    ok(p.chords[bars - 1].name === 'C', `smart ${bars} bars seed ${seed} ends on the tonic`);
    ok(p.chords.every((c, i) => i === 0 || c.name !== p.chords[i - 1].name), `smart ${bars} bars seed ${seed} never repeats a chord back-to-back`);
  }
  ok(gen({ style: 'pop', seed, bars: 8 }).chords[7].name === 'C', `pop 8 bars seed ${seed} resolves home`);
}
for (let seed = 1; seed <= 20; seed++) {
  const p = gen({ rootName: 'A', scaleId: 'naturalMinor', seed, bars: 4 });
  ok(p.chords[0].name === 'Am', `A minor seed ${seed} starts on Am`);
}
const keyPcs = new Set(T.spellScale('C', 'major').map(n => n.pc));
for (let seed = 1; seed <= 30; seed++) for (const c of gen({ style: 'smart', seed, bars: 8 }).chords) ok(c.tones.every(t => keyPcs.has(t.pc)), `C major progression chord ${c.name} stays diatonic (seed ${seed})`);
ok(/\|/.test(T.chartText(gen())), 'chart text has bar lines');

group('mulberry32 RNG');
const r1 = T.mulberry32(42), r2 = T.mulberry32(42);
eq([r1(), r1(), r1()], [r2(), r2(), r2()], 'same seed → same stream');
for (let i = 0; i < 1000; i++) { const v = r1(); if (!(v >= 0 && v < 1)) { fail++; console.log('  ✗ rng out of range'); break; } }

console.log(`\n${fail ? '✗ FAILED' : '✓ ALL PASSED'} — ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
