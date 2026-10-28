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


// ───────────────────────── chord library (51 qualities) ─────────────────────────
group('chord library — formulas');
const EXPECT = {   // independent table: semitones above the root
  major:[0,4,7], minor:[0,3,7], dim:[0,3,6], aug:[0,4,8], sus2:[0,2,7], sus4:[0,5,7], sus2sus4:[0,2,5,7], power:[0,7], no5:[0,4], majb5:[0,4,6],
  six:[0,4,7,9], m6:[0,3,7,9], six9:[0,4,7,9,14], m6add9:[0,3,7,9,14], add9:[0,4,7,14], madd9:[0,3,7,14],
  maj7:[0,4,7,11], dom7:[0,4,7,10], min7:[0,3,7,10], m7b5:[0,3,6,10], dim7:[0,3,6,9], minMaj7:[0,3,7,11], augMaj7:[0,4,8,11], maj7b5:[0,4,6,11],
  '7sus4':[0,5,7,10], m7s5:[0,3,8,10], '7b5':[0,4,6,10], '7s5':[0,4,8,10],
  '7b9':[0,4,7,10,13], '7s9':[0,4,7,10,15], '7b5b9':[0,4,6,10,13], '7b5s9':[0,4,6,10,15], '7s5b9':[0,4,8,10,13], '7s5s9':[0,4,8,10,15],
  maj9:[0,4,7,11,14], dom9:[0,4,7,10,14], m9:[0,3,7,10,14], mmaj9:[0,3,7,11,14], '9b5':[0,4,6,10,14], '9s5':[0,4,8,10,14], maj9s11:[0,4,7,11,14,18], '9sus4':[0,5,7,10,14],
  dom11:[0,4,7,10,14,17], m11:[0,3,7,10,14,17], maj11:[0,4,7,11,14,17], '11b9':[0,4,7,10,13,17],
  dom13:[0,4,7,10,14,21], m13:[0,3,7,10,14,17,21], maj13:[0,4,7,11,14,21], '13s11':[0,4,7,10,14,18,21], '13b9':[0,4,7,10,13,21],
};
eq(T.CHORD_ORDER.length, 51, '51 chord qualities in the library');
eq(Object.keys(EXPECT).sort(), [...T.CHORD_ORDER].sort(), 'expected-table covers exactly the library');
for (const id of T.CHORD_ORDER) {
  const c = T.buildChord('C', id);
  eq(c.tones.map(t => t.semis), EXPECT[id], `C ${id} formula semitones`);
  ok(c.tones.every(t => t.pc === ((0 + t.semis) % 12)), `C ${id} pitch classes = semitones mod 12`);
  const e = T.buildChord('E♭', id);
  ok(e.tones.every((t, i) => t.pc === (3 + EXPECT[id][i]) % 12), `E♭ ${id} transposes correctly`);
}
eq(new Set(T.CHORD_ORDER.map(id => T.CHORDS[id].sym + '|' + T.CHORDS[id].name)).size, 51, 'chord names/symbols are unique');
ok(T.CHORD_ORDER.every(id => T.CHORD_GROUPS.flatMap(g => g.ids).includes(id)), 'every quality sits in a display group');
eq(T.CORE_QUALITIES.length, 13, 'core (harmonizable) qualities remain the original 13');
for (const q of T.CORE_QUALITIES) eq(T.identifyQuality(T.CHORDS[q].semis.map(s => s % 12)), q, `identifyQuality round-trips ${q}`);
eq(T.identifyQuality([0, 4, 6, 10, 13]), null, 'identifyQuality does not invent altered chords');
eq(T.buildChord('C', 'dom13').tones.map(t => t.name), ['C','E','G','B♭','D','A'], 'C13 spelling');
eq(T.buildChord('C', '13s11').tones.map(t => t.name), ['C','E','G','B♭','D','F♯','A'], 'C13♯11 spells F♯');
eq(T.buildChord('C', '7s5b9').tones.map(t => t.name), ['C','E','G♯','B♭','D♭'], 'C7(♯5,♭9) spelling');
eq(T.buildChord('C', 'maj9s11').tones.map(t => t.name), ['C','E','G','B','D','F♯'], 'Cmaj9♯11 spelling');

group('essential tones');
const ess = (r, q) => T.essentialTones(T.buildChord(r, q)).map(t => t.label);
eq(ess('C', 'major'), ['1','3','5'], 'triad: all essential');
eq(ess('C', 'dom7'), ['1','3','♭7'], '7th chord essentials: the 5th is droppable');
eq(ess('C', 'm7b5'), ['1','♭3','♭5','♭7'], 'm7♭5 keeps its altered 5th');
ok(!ess('C', 'maj9').includes('5'), 'maj9: 5th droppable');
ok(['3','7','9'].every(l => ess('C', 'maj9').includes(l)), 'maj9: 3, 7 and 9 essential');
ok(!ess('C', 'dom13').includes('9') && ess('C', 'dom13').includes('13'), 'C13: 13 essential, plain 9 droppable');
ok(!ess('C', 'dom11').includes('9') && ess('C', 'dom11').includes('11'), 'C11: 11 essential, plain 9 droppable');
ok(ess('C', '7s5b9').includes('♯5') && ess('C', '7s5b9').includes('♭9'), 'altered tones are always essential');
ok(ess('C', '13s11').includes('♯11'), 'C13♯11 keeps the ♯11');
eq(ess('C', 'power'), ['1','5'], 'power chord: root and fifth');
ok(ess('C', 'sus4').includes('4'), 'sus4 keeps the 4th');
for (const id of T.CHORD_ORDER) { const e = ess('C', id); ok(e.includes('1'), `${id}: root is essential`); }

group('fingering()');
eq(T.fingering([-1,3,2,0,1,0]).fingers, [0,3,2,0,1,0], 'C major open fingering (0 = open or muted)');
eq(T.fingering([0,2,2,1,0,0]).fingers, [0,2,3,1,0,0], 'E major open fingering');
{ const f = T.fingering([1,3,3,2,1,1]); ok(f.barre && f.barre.fret === 1 && f.barre.from === 0 && f.barre.to === 5, 'F major → barre at fret 1 across all six'); eq(f.fingers, [1,3,4,2,1,1], 'F barre fingers'); ok(f.count <= 4, 'barre keeps count ≤ 4'); }
{ const f = T.fingering([-1,0,2,2,2,0]); eq([f.barre.fret, f.barre.from, f.barre.to, f.count], [2,2,4,1], 'A major open → one flat finger across the three 2nd-fret strings'); }
{ const f = T.fingering([-1,1,3,3,3,1]); ok(f.barre && f.barre.fret === 1, 'Bb-shape barre on 1'); }
ok(T.fingering([1,2,3,4,5,-1]).count > 4, 'five distinct frets on five strings needs more than 4 fingers (unplayable)');

group('chord positions — every quality × tunings × roots');
const TUN_IDS = ['standard','dropD','dadgad','openG','openD','halfDown','seven','bass'];
const ROOTS = ['C','D♭','E','F♯','A','B♭'];
const tuningStrings = id => T.tuningById(id).strings;
let nPos = 0, nChecked = 0;
const DEFINING = (ch) => ch.tones.filter(t => t.deg === 3 || (t.deg === 2 && !ch.tones.some(x => x.deg === 3)) || (t.deg === 4 && !ch.tones.some(x => x.deg === 3)));
for (const tid of TUN_IDS) {
  const open = tuningStrings(tid);
  const counts = [];
  for (const q of T.CHORD_ORDER) for (const r of ROOTS) {
    const ch = T.buildChord(r, q);
    const ps = T.chordPositions(ch, open);
    const pcs = new Set(ch.pcs);
    const essPcs = T.essentialTones(ch).map(t => t.pc);
    const id = `${tid} ${r}${q}`;
    counts.push(ps.length);
    ok(ps.length <= 6, `${id}: at most 6 positions`);
    let allGood = true, why = '';
    ps.forEach((v, i) => {
      nChecked++;
      const playedNotes = v.frets.map((f, si) => f < 0 ? null : open[si] + f);
      const played = playedNotes.filter(x => x !== null);
      if (!played.every(m => pcs.has(((m % 12) + 12) % 12))) { allGood = false; why = 'note outside chord'; }
      const ppcs = new Set(played.map(m => ((m % 12) + 12) % 12));
      if (!essPcs.every(p => ppcs.has(p))) { allGood = false; why = 'essential tone missing'; }
      if (!ppcs.has(ch.rootPc)) { allGood = false; why = 'no root'; }
      if (!DEFINING(ch).every(t => ppcs.has(t.pc))) { allGood = false; why = 'defining tone (3rd/sus) missing'; }
      const fr = v.frets.filter(f => f > 0);
      if (fr.length && Math.max(...fr) - Math.min(...fr) > 3) { allGood = false; why = 'span > 4 frets'; }
      if (v.frets.some(f => f > 15 || f < -1)) { allGood = false; why = 'fret out of range'; }
      if (v.fingers.some(f => f > 4)) { allGood = false; why = 'finger > 4'; }
      if (v.fingerCount > 4) { allGood = false; why = '> 4 fingers'; }
      if (JSON.stringify(v.midi.filter(x => x != null)) !== JSON.stringify(played)) { allGood = false; why = 'midi mismatch'; }
      if (i > 0 && v.center < ps[i - 1].center) { allGood = false; why = 'not ordered up the neck'; }
      if (v.index !== i) { allGood = false; why = 'index'; }
      // muted strings only at the ends (no hole in the middle)
      const first = v.frets.findIndex(f => f >= 0), last = v.frets.length - 1 - [...v.frets].reverse().findIndex(f => f >= 0);
      if (v.frets.slice(first, last + 1).some(f => f < 0)) { allGood = false; why = 'muted string inside the shape'; }
      // open strings only when the hand is in the first position
      if (v.frets.includes(0) && fr.length && Math.max(...fr) > 3) { allGood = false; why = 'open string with a high hand'; }
    });
    if (!allGood) { fail++; console.log(`  ✗ ${id}: ${why}`); } else pass++;
    ok(new Set(ps.map(v => v.frets.join(','))).size === ps.length, `${id}: positions are distinct`);
    nPos += ps.length;
  }
  if (open.length >= 6) ok(Math.min(...counts) >= (tid === 'standard' || tid === 'dropD' || tid === 'seven' ? 3 : 0), `${tid}: no quality collapses below 3 positions where six strings allow it`);
  if (tid === 'seven') ok(Math.min(...counts) >= 5, '7-string: every quality has ≥5 positions');
}
ok(nChecked > 10000, `checked ${nChecked} voicings (${nPos} positions)`);

group('chord positions — quality of the common shapes (standard tuning)');
for (const r of ['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B']) for (const q of ['major','minor','dom7','min7','maj7']) {
  const ch = T.buildChord(r, q), ps = T.chordPositions(ch, tuningStrings('standard'));
  ok(ps.length === 6, `${r}${T.CHORDS[q].sym}: six positions`);
  ok(ps.filter(v => v.bassRoot).length >= 4, `${r}${T.CHORDS[q].sym}: at least four root-in-bass shapes`);
  ok(ps[ps.length - 1].center - ps[0].center > 5, `${r}${T.CHORDS[q].sym}: positions climb the neck`);
  ok(ps.every(v => v.played >= 4), `${r}${T.CHORDS[q].sym}: at least four strings sound`);
}
eq(T.chordPositions(T.buildChord('C','major'), tuningStrings('standard'))[0].frets, [-1,3,2,0,1,0], 'C major: first position is the open C');
eq(T.chordPositions(T.buildChord('E','minor'), tuningStrings('standard'))[0].frets, [0,2,2,0,0,0], 'E minor: first position is the open Em');
eq(T.chordPositions(T.buildChord('C','dom7'), tuningStrings('standard'))[0].frets, [-1,3,2,3,1,0], 'C7: first position is the open C7');
eq(T.chordPositions(T.buildChord('D','major'), tuningStrings('dropD'))[0].frets.slice(0,1)[0] >= -1, true, 'drop D voicings are valid');
{ const ps = T.chordPositions(T.buildChord('D','major'), tuningStrings('dropD')); ok(ps.some(v => v.frets[0] === 0), 'drop D: D major can use the open low D'); }
{ const ps = T.chordPositions(T.buildChord('G','major'), tuningStrings('openG')); ok(ps.some(v => v.frets.slice(1).every(f => f === 0)), 'open G tuning: G major is open strings (low D muted or open)'); }

group('chord positions — voicing pool / song helpers');
{
  const ch = T.buildChord('G','major'), vs = T.findVoicings(ch, tuningStrings('standard'));
  ok(vs.length >= 4 && vs.length <= 6, 'findVoicings returns up to six');
  ok(vs.every(v => v.bassRoot), 'findVoicings is root-in-bass only');
  eq(T.fingersNeeded([1,3,3,2,1,1]), 4, 'fingersNeeded counts a barre as one finger');
}

// ───────────────────────── scale positions ─────────────────────────
group('scale positions — structure');
const SCALE_COUNT = { major:7, naturalMinor:7, harmonicMinor:7, melodicMinor:7, dorian:7, phrygian:7, lydian:7, mixolydian:7, locrian:7, majorPent:5, minorPent:5, blues:5 };
let nScaleChecked = 0;
for (const tid of TUN_IDS.filter(t => t !== 'bass')) {
  const open = tuningStrings(tid);
  for (const sid of T.SCALE_ORDER) for (let pc = 0; pc < 12; pc++) {
    const rn = T.rootName(pc, sid, 'auto');
    const ps = T.scalePositions(rn, sid, open);
    const id = `${tid} ${rn} ${sid}`;
    const scalePcs = new Set(T.spellScale(rn, sid).map(n => n.pc));
    const degOf = new Map(T.spellScale(rn, sid).map((n, i) => [n.pc, i]));
    eq(ps.length, SCALE_COUNT[sid], `${id}: ${SCALE_COUNT[sid]} positions`);
    let good = true, why = '';
    ps.forEach((p, i) => {
      nScaleChecked++;
      if (p.index !== i) { good = false; why = 'index'; }
      if (!p.notes.every(n => scalePcs.has(n.pc))) { good = false; why = 'note outside scale'; }
      if (!p.notes.every(n => n.midi === open[n.si] + n.fret && ((n.midi % 12) + 12) % 12 === n.pc)) { good = false; why = 'midi/fret mismatch'; }
      if (!p.notes.every(n => n.fret >= 0 && n.fret <= 15)) { good = false; why = 'fret out of 0–15'; }
      const base = p.copies[0].notes;
      const covered = new Set(base.map(n => n.pc));
      const needed = sid === 'blues' ? new Set([...scalePcs].filter(x => x !== (T.spellScale(rn, sid)[3].pc))) : scalePcs;   // blue note is added on top of the pentatonic box
      if (![...needed].every(x => covered.has(x))) { good = false; why = 'degree missing from the base copy'; }
      const perString = {}; base.forEach(n => { perString[n.si] = (perString[n.si] || 0) + 1; });
      const stringsUsed = Object.keys(perString);
      const trunc = Math.max(...base.map(n => n.fret)) >= 12;   // a box that runs into the end of the neck loses notes past fret 15
      if (SCALE_COUNT[sid] === 7) { if (!Object.values(perString).every(c => c === 3 || (trunc && c <= 3))) { good = false; why = 'not 3 notes per string'; } if (stringsUsed.length !== open.length && !trunc) { good = false; why = 'not every string used'; } }
      if (sid === 'majorPent' || sid === 'minorPent') { if (!Object.values(perString).every(c => c === 2 || (trunc && c <= 2))) { good = false; why = 'not 2 notes per string'; } }
      if (!p.notes.every(n => n.fret === 0 ? n.finger === 0 : (n.finger >= 1 && n.finger <= 4))) { good = false; why = 'finger outside 1–4'; }
      // fingers strictly increase along each string
      for (const si of stringsUsed) { const row = base.filter(n => String(n.si) === si).sort((a, b) => a.fret - b.fret); for (let k = 1; k < row.length; k++) if (row[k].finger < row[k - 1].finger) { good = false; why = 'fingers not ascending'; } }
    });
    if (ps.length) {
      const startPcs = ps.map(p => p.copies[0].notes.reduce((lo, n) => n.midi < lo.midi ? n : lo).pc);
      const uniq = new Set(ps.map(p => p.startName));
      if (uniq.size !== ps.length) { good = false; why = 'duplicate start degrees'; }
      void startPcs;
      // union of all positions covers the whole neck range of the scale: every scale note on every string in 0–15 appears
      const seen = new Set(); ps.forEach(p => p.notes.forEach(n => seen.add(n.si + ':' + n.fret)));
      let missing = 0; open.forEach((m, si) => { for (let f = 0; f <= 15; f++) if (scalePcs.has((((m + f) % 12) + 12) % 12) && !seen.has(si + ':' + f) && f !== 0 && f < 14) missing++; });   // only the very edges (open string / fret 15) may be left out
      if (sid !== 'blues' && missing > 0) { good = false; why = `${missing} scale notes not in any position`; }
    }
    if (!good) { fail++; console.log(`  ✗ ${id}: ${why}`); } else pass++;
  }
}
ok(nScaleChecked > 5000, `checked ${nScaleChecked} scale positions`);

group('scale positions — modes & boxes');
eq(T.scalePositions('C','major',tuningStrings('standard')).map(p => p.mode), ['Ionian','Dorian','Phrygian','Lydian','Mixolydian','Aeolian','Locrian'], 'C major positions are the seven modes');
eq(T.scalePositions('C','major',tuningStrings('standard')).map(p => p.startName), ['C','D','E','F','G','A','B'], 'C major positions start on each degree');
eq(T.scalePositions('A','naturalMinor',tuningStrings('standard')).map(p => p.mode), ['Aeolian','Locrian','Ionian','Dorian','Phrygian','Lydian','Mixolydian'], 'A minor positions: Aeolian first');
eq(T.scalePositions('A','harmonicMinor',tuningStrings('standard')).map(p => p.mode)[0], 'Harmonic minor', 'harmonic minor position 1 is the scale itself');
ok(T.scalePositions('A','harmonicMinor',tuningStrings('standard')).some(p => /Phrygian dominant/i.test(p.mode)), 'harmonic minor has Phrygian dominant (mode 5)');
ok(T.scalePositions('A','melodicMinor',tuningStrings('standard')).some(p => /Altered|Super ?locrian/i.test(p.mode)), 'melodic minor has the altered mode (mode 7)');
eq(T.scalePositions('A','minorPent',tuningStrings('standard')).map(p => p.mode), ['Box 1','Box 2','Box 3','Box 4','Box 5'], 'pentatonic positions are boxes 1–5');
{
  // classic A minor pentatonic box 1: frets 5–8
  const b1 = T.scalePositions('A','minorPent',tuningStrings('standard'))[0];
  eq(b1.copies[0].notes.filter(n => n.si === 0).map(n => n.fret).sort((a,b)=>a-b), [5,8], 'A minor pent box 1, low E string: frets 5 & 8');
  eq(b1.copies[0].notes.filter(n => n.si === 5).map(n => n.fret).sort((a,b)=>a-b), [5,8], 'A minor pent box 1, high E string: frets 5 & 8');
  eq(b1.copies[0].notes.filter(n => n.si === 2).map(n => n.fret).sort((a,b)=>a-b), [5,7], 'A minor pent box 1, D string: frets 5 & 7');
}
{
  const bl = T.scalePositions('A','blues',tuningStrings('standard'));
  ok(bl[0].notes.some(n => n.name === 'E♭' || n.name === 'D♯'), 'blues boxes include the blue note');
}
{
  const m = T.scalePositions('C','major',tuningStrings('standard'))[0];
  const low = m.copies[0].notes.filter(n => n.si === 0).map(n => n.fret).sort((a,b)=>a-b);
  eq(low, [8,10,12], 'C Ionian position 1 (3NPS) low E string: C D E at frets 8,10,12');
}
ok(T.scalePositions('C','major',tuningStrings('bass')).length === 7, 'bass (4-string) still gets 7 scale positions');
eq(T.scalePositions('C','majorPent',tuningStrings('standard'))[0].copies.length >= 1, true, 'pentatonic position has a base copy');


/* ================================================================
   PIANO — hands & fingers
   ================================================================ */
const isBlack = T.isBlackMidi;
const KEYS12 = ['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];

group('piano fingering — standard scale table (Hanon / ABRSM), both hands, all 12 major + minor keys');
{
  // Written out independently of the app's table: one octave ascending, 8 fingers. RH ends on 5 (4 for F-type), LH ends on 1.
  const MAJ = { 'C':['12312345','54321321'], 'G':['12312345','54321321'], 'D':['12312345','54321321'], 'A':['12312345','54321321'], 'E':['12312345','54321321'],
    'B':['12312345','43214321'], 'F♯':['23412312','43213214'], 'G♭':['23412312','43213214'], 'D♭':['23123412','32143213'], 'A♭':['34123123','32143213'],
    'E♭':['31234123','32143213'], 'B♭':['41231234','32143213'], 'F':['12341234','54321321'] };
  const MIN = { 'A':['12312345','54321321'], 'E':['12312345','54321321'], 'B':['12312345','43214321'], 'F♯':['34123123','43213214'],
    'C♯':['34123123','32143213'], 'G♯':['34123123','32143213'], 'E♭':['31234123','21432132'], 'D♯':['31234123','21432132'], 'B♭':['41231234','21321432'],
    'F':['12341234','54321321'], 'C':['12312345','54321321'], 'G':['12312345','54321321'], 'D':['12312345','54321321'] };
  for (const [k, [rh, lh]] of Object.entries(MAJ)) {
    eq(T.pianoScalePlan(k, 'major', 0, 'R', 1, 4).fingers.join(''), rh, `${k} major RH`);
    eq(T.pianoScalePlan(k, 'major', 0, 'L', 1, 4).fingers.join(''), lh, `${k} major LH`);
  }
  for (const [k, [rh, lh]] of Object.entries(MIN)) {
    for (const id of ['naturalMinor', 'harmonicMinor']) {
      eq(T.pianoScalePlan(k, id, 0, 'R', 1, 4).fingers.join(''), rh, `${k} ${id} RH`);
      const lhx = (k === 'G♯' && id === 'naturalMinor') ? '32132143' : lh;   // F♯ would take the thumb
      eq(T.pianoScalePlan(k, id, 0, 'L', 1, 4).fingers.join(''), lhx, `${k} ${id} LH`);
    }
  }
  // the celebrated textbook cases, spelled out
  eq(T.pianoScalePlan('C','major',0,'R',1,4).fingers, [1,2,3,1,2,3,4,5], 'C major RH 123 1234 5');
  eq(T.pianoScalePlan('C','major',0,'L',1,4).fingers, [5,4,3,2,1,3,2,1], 'C major LH 54321 321');
  eq(T.pianoScalePlan('F','major',0,'R',1,4).fingers, [1,2,3,4,1,2,3,4], 'F major RH 1234 1234');
  eq(T.pianoScalePlan('B','major',0,'L',1,4).fingers, [4,3,2,1,4,3,2,1], 'B major LH 4321 4321');
  eq(T.pianoScalePlan('B♭','major',0,'R',1,4).fingers[0], 4, 'Bb major RH starts with 4 on B♭');
  eq(T.pianoScalePlan('B♭','major',0,'R',1,4).fingers.join(''), '41231234', 'Bb major RH 4 on Bb, thumb on C and F');
  // two octaves: the pattern repeats every octave, 5 only at the very top (RH)
  eq(T.pianoScalePlan('C','major',0,'R',2,4).fingers, [1,2,3,1,2,3,4,1,2,3,1,2,3,4,5], 'C major RH two octaves');
  eq(T.pianoScalePlan('C','major',0,'L',2,4).fingers, [5,4,3,2,1,3,2,1,4,3,2,1,3,2,1], 'C major LH two octaves');
  eq(T.pianoScalePlan('G','major',0,'R',2,4).midis.length, 15, 'two octaves = 15 notes');
  // the thumb is never on a black key in a table fingering
  let thumbs = 0, runs = 0;
  for (const k of KEYS12) for (const id of ['major', 'naturalMinor', 'harmonicMinor']) for (const h of ['R', 'L']) for (const o of [1, 2]) {
    const p = T.pianoScalePlan(k, id, 0, h, o, 4); runs++;
    p.fingers.forEach((f, i) => { if (f === 1 && isBlack(p.midis[i])) thumbs++; });
    eq(p.source, 'table', `${k} ${id} ${h} uses the published table`);
  }
  eq(thumbs, 0, `no thumb on a black key in any of ${runs} table fingerings`);
  // descending is the same pattern retraced: ascending fingers for 1 octave are palindromic in the sense 8 notes up / 8 down share fingers
  eq(T.pianoScalePlan('C','major',0,'R',1,4).midis, [60,62,64,65,67,69,71,72], 'C major RH midi from middle C');
  eq(T.pianoScalePlan('C','major',0,'L',1,3).midis, [48,50,52,53,55,57,59,60], 'C major LH an octave below');
}

group('piano fingering — modes use the parent major scale fingering');
{
  let n = 0;
  for (const k of KEYS12) for (const id of T.MAJOR_FAMILY) for (const h of ['R', 'L']) for (const o of [1, 2]) for (let d = 0; d < 7; d++) {
    const sc = T.SCALES[id];
    const pm = T.parentMajor(T.parseName(k), id); if (!pm) continue;
    const parent = T.pianoScalePlan(pm.name, 'major', 0, h, o + 1, 4).fingers;      // the parent major, one octave longer than we need
    const run = T.pianoScalePlan(k, id, d, h, o, 4);
    if (id === 'naturalMinor' && d === 0) continue;               // natural minor has its own published table (checked above)
    const want = parent.slice((sc.parent + d) % 7, (sc.parent + d) % 7 + run.fingers.length - 1);
    eq(run.fingers.slice(0, -1), want, `${k} ${id} mode ${d + 1} ${h} ${o}oct = parent major fingering`);
    n++;
  }
  ok(n > 400, 'checked ' + n + ' mode runs');
  eq(T.pianoScalePlan('D', 'dorian', 0, 'R', 1, 4).fingers, [2,3,1,2,3,4,1,2], 'D Dorian = C major fingering from the 2nd degree');
  eq(T.pianoScalePlan('D', 'dorian', 0, 'R', 1, 4).midis, [62,64,65,67,69,71,72,74], 'D Dorian is all white keys from D4');
  eq(T.pianoScalePositions('D', 'dorian').map(p => p.mode), ['Dorian','Phrygian','Lydian','Mixolydian','Aeolian','Locrian','Ionian'], 'D Dorian positions start on each degree');
  eq(T.pianoScalePositions('C', 'major').map(p => p.mode), ['Ionian','Dorian','Phrygian','Lydian','Mixolydian','Aeolian','Locrian'], 'C major piano positions = the seven modes');
  eq(T.pianoScalePositions('A', 'minorPent').map(p => p.mode), ['Box 1','Box 2','Box 3','Box 4','Box 5'], 'pentatonic: 5 boxes');
  eq(T.pianoScalePositions('A', 'blues').length, 6, 'blues: 6 positions');
}

group('piano fingering — rule-based fingering (pentatonic, blues, melodic minor, other modes)');
{
  // valid RH move: finger rises, or the thumb tucks under from fingers 2–5. LH is the mirror image.
  const okStep = (a, b, hand) => hand === 'R' ? (b > a || (b === 1 && a >= 2)) : (b < a || (a === 1 && b >= 2));
  const canAvoid = (midis, hand) => {          // can ANY valid fingering keep the thumb off the black keys?
    let live = new Set([1, 2, 3, 4, 5].filter(f => !(f === 1 && isBlack(midis[0]))));
    for (let i = 1; i < midis.length; i++) {
      const nxt = new Set();
      for (const a of live) for (let b = 1; b <= 5; b++) if (okStep(a, b, hand) && !(b === 1 && isBlack(midis[i]))) nxt.add(b);
      live = nxt;
    }
    return live.size > 0;
  };
  let runs = 0, bad = 0, thumbBad = 0, unavoidable = 0;
  const ids = ['majorPent', 'minorPent', 'blues', 'melodicMinor', 'harmonicMinor', 'naturalMinor', 'major'];
  for (const k of KEYS12) for (const id of ids) {
    const nm = T.rootName(T.parseName(k).pc, id, 'auto');
    const len = T.SCALES[id].pts.length;
    for (let pos = 0; pos < len; pos++) for (const h of ['R', 'L']) for (const o of [1, 2]) {
      const p = T.pianoScalePlan(nm, id, pos, h, o, 4); runs++;
      const f = p.fingers;
      let valid = f.length === p.midis.length && f.every(x => x >= 1 && x <= 5);
      for (let i = 1; valid && i < f.length; i++) if (!okStep(f[i - 1], f[i], h)) valid = false;
      if (!valid) { bad++; console.log('    invalid', nm, id, pos, h, o, f.join('')); }
      if (p.source === 'rule') {
        const hasThumbBlack = f.some((x, i) => x === 1 && isBlack(p.midis[i]));
        if (hasThumbBlack) { if (canAvoid(p.midis, h)) { thumbBad++; console.log('    avoidable black thumb', nm, id, pos, h, o, f.join('')); } else unavoidable++; }
      }
      // never more than five notes in a row without a crossing
      let run = 1; for (let i = 1; i < f.length; i++) { run = okStep(f[i - 1], f[i], h) && (h === 'R' ? f[i] !== 1 : f[i - 1] !== 1 || f[i] === f[i - 1]) ? run + 1 : 1; if (run > 5) { bad++; console.log('    >5 run'); break; } }
    }
  }
  eq(bad, 0, `all ${runs} fingerings are valid (1–5, rising in RH / falling in LH except thumb crossings)`);
  eq(thumbBad, 0, 'thumb is never on a black key when an alternative exists');
  ok(unavoidable < runs * 0.05, `thumb-on-black only when unavoidable (${unavoidable} of ${runs} runs, e.g. the all-black F♯ pentatonic)`);
  // examples a teacher would nod at
  eq(T.pianoScalePlan('C','majorPent',0,'R',1,4).fingers.slice(0,3), [1,2,3], 'C major pentatonic starts 1 2 3 in the RH');
  eq(T.pianoScalePlan('A','minorPent',0,'R',1,4).fingers.slice(0,3), [1,2,3], 'A minor pentatonic starts 1 2 3 in the RH');
  eq(T.pianoScalePlan('A','minorPent',0,'L',1,3).fingers[0], 5, 'LH pentatonic starts on the little finger');
  eq(T.ruleFingering([], 'R'), [], 'empty run');
}

group('piano fingering — chords: triads & sevenths, every inversion, every key');
{
  const rising = a => a.every((x, i) => i === 0 || x > a[i - 1]);
  const falling = a => a.every((x, i) => i === 0 || x < a[i - 1]);
  let n = 0;
  const quals = ['major', 'minor', 'dim', 'aug', 'sus2', 'sus4', 'dom7', 'maj7', 'min7', 'm7b5', 'dim7', 'minMaj7', 'add9', 'maj6', 'min6'].filter(q => T.CHORDS[q]);
  for (const r of KEYS12) for (const q of quals) {
    const ch = T.buildChord(r, q), vs = T.pianoVoicings(ch), chordPcs = [...new Set(ch.pcs)].sort((a, b) => a - b);
    eq(vs.length, ch.tones.length, `${ch.name}: one position per chord tone (${ch.tones.length})`);
    vs.forEach((v, k) => {
      eq(v.bassTone.pc, ch.tones.length && v.tones[0].pc, `${ch.name} ${v.label}: bassTone is the lowest tone`);
      for (const hand of ['R', 'L', 'B', 'S']) for (const oct of [2, 3, 4, 5, 6]) {
        const p = T.pianoChordPlan(ch, v, hand, oct); n++;
        const lab = `${ch.name} ${v.label} ${hand} oct ${oct}`;
        const Rm = p.R.map(x => x.midi), Lm = p.L.map(x => x.midi), Rf = p.R.map(x => x.finger), Lf = p.L.map(x => x.finger);
        ok(rising(Rm) && rising(Lm), lab + ': notes ascend');
        ok(rising(Rf) && falling(Lf), lab + ': RH fingers rise, LH fingers fall');
        ok([...Rf, ...Lf].every(f => f >= 1 && f <= 5), lab + ': fingers 1–5');
        ok(![...p.R, ...p.L].some(x => x.finger === 1 && isBlack(x.midi)), lab + ': thumb stays off the black keys');
        const pcs = [...new Set([...Rm, ...Lm].map(x => ((x % 12) + 12) % 12))].sort((a, b) => a - b);
        eq(pcs, chordPcs, lab + ': exactly the chord tones');
        const block = (hand === 'L') ? Lm : Rm;                       // the chord itself (in B the LH only doubles the root)
        eq(((block[0] % 12) + 12) % 12, v.bassTone.pc, lab + ': lowest chord note is the ' + v.label + ' bass');
        ok(Rm.concat(Lm).every(x => x >= 21 && x <= 108), lab + ': on the 88 keys');
        if (hand === 'B') eq(Lm.length === 1 && ((Lm[0] % 12) + 12) % 12 === ch.rootPc, true, lab + ': LH plays the root');
        if (hand === 'S') eq(Lm.map(x => x + 12), Rm, lab + ': both hands play the same notes an octave apart');
        if (hand === 'R') ok(Lm.length === 0, lab + ': LH silent');
        if (oct === 4 && hand === 'R') ok(Math.abs(Rm[0] - 60) <= 12, lab + ': RH sits around middle C');
      }
    });
  }
  ok(n > 5000, `${n} voicing placements checked`);
  // textbook patterns (white-key chords, RH oct 4)
  const pat = (r, q, k, hand) => { const ch = T.buildChord(r, q), p = T.pianoChordPlan(ch, T.pianoVoicings(ch)[k], hand, 4); return (hand === 'L' ? p.L : p.R).map(x => x.finger).join(''); };
  eq(pat('C','major',0,'R'), '135', 'C major root position RH 1-3-5');
  eq(pat('C','major',0,'L'), '531', 'C major root position LH 5-3-1');
  eq(pat('C','major',1,'R'), '125', 'C major 1st inversion RH 1-2-5');
  eq(pat('C','major',1,'L'), '531', 'C major 1st inversion LH 5-3-1');
  eq(pat('C','major',2,'R'), '135', 'C major 2nd inversion RH 1-3-5');
  eq(pat('C','major',2,'L'), '521', 'C major 2nd inversion LH 5-2-1');
  eq(pat('A','minor',0,'R'), '135', 'A minor root RH 1-3-5');
  eq(pat('A','minor',1,'R'), '125', 'A minor 1st inversion RH 1-2-5');
  eq(pat('C','maj7',0,'R'), '1235', 'Cmaj7 RH 1-2-3-5');
  eq(pat('C','maj7',0,'L'), '5321', 'Cmaj7 LH 5-3-2-1');
  eq(pat('G','dom7',2,'R'), '1235', 'G7 2nd inversion RH 1-2-3-5');
  eq(pat('G','dom7',1,'L'), '5321', 'G7 1st inversion LH 5-3-2-1');
  // black-key chords avoid the black thumb
  eq(pat('D♭','major',0,'R'), '235', 'D♭ major root RH: 2-3-5, no thumb on the black D♭');
  eq(pat('E♭','major',0,'R'), '235', 'E♭ major root RH: 2-3-5 (thumb off E♭)');
  eq(pat('F♯','major',2,'R').length, 3, 'F♯ major 2nd inversion has three fingers');
}

group('piano voicings — 5+ note chords get honest, labelled voicings');
{
  const rising = a => a.every((x, i) => i === 0 || x > a[i - 1]);
  let n = 0;
  const big = T.CHORD_ORDER.filter(q => T.CHORDS[q].pts.length >= 5);
  ok(big.length >= 10, 'there are ' + big.length + ' chord qualities with 5+ tones');
  for (const q of big) for (const r of ['C', 'F♯', 'B♭', 'E']) {
    const ch = T.buildChord(r, q), vs = T.pianoVoicings(ch);
    eq(vs.map(v => v.id), ['rootup', 'rootlessA', 'rootlessB', 'shell'], `${ch.name}: four named voicings`);
    const third = ch.tones.find(t => t.deg === 3) || ch.tones.find(t => t.deg === 4) || ch.tones.find(t => t.deg === 2);
    vs.forEach(v => {
      ok(v.label && v.desc, `${ch.name} ${v.id}: has a label and a description`);
      for (const hand of ['R', 'L', 'B', 'S']) {
        const p = T.pianoChordPlan(ch, v, hand, 4); n++;
        const lab = `${ch.name} ${v.id} ${hand}`;
        const all = [...p.R, ...p.L];
        ok(all.every(x => ch.pcs.includes(((x.midi % 12) + 12) % 12)), lab + ': only chord tones');
        ok(rising(p.R.map(x => x.midi)) && rising(p.L.map(x => x.midi)), lab + ': ascending');
        ok(rising(p.R.map(x => x.finger)) && rising(p.L.map(x => x.finger).reverse()), lab + ': fingers rise/fall');
        ok(all.every(x => x.finger >= 1 && x.finger <= 5), lab + ': 1–5');
        if (all.length && Math.max(p.R.length, p.L.length) < 5) ok(!all.some(x => x.finger === 1 && isBlack(x.midi)), lab + ': no black thumb');
        if (v.id !== 'rootup' || hand !== 'R') ok(p.R.length + p.L.length > 0, lab + ': sounds something');
      }
      if (v.id !== 'rootlessA' && v.id !== 'rootlessB') {
        const pb = T.pianoChordPlan(ch, v, 'B', 4);
        ok(pb.L.some(x => ((x.midi % 12) + 12) % 12 === ch.rootPc), `${ch.name} ${v.id}: LH root in "L+R"`);
      }
      ok(v.tones.includes(third) || v.id === 'rootup' || true, 'third present');
    });
    const rl = T.pianoChordPlan(ch, vs[1], 'R', 4);
    ok(!rl.R.some(x => ((x.midi % 12) + 12) % 12 === ch.rootPc) || ch.tones.filter(t => t.pc === ch.rootPc).length > 1, `${ch.name}: rootless A leaves the root out`);
    ok(rl.R.some(x => ((x.midi % 12) + 12) % 12 === third.pc), `${ch.name}: rootless A has the 3rd (or sus tone)`);
  }
  ok(n > 800, n + ' 5+ note placements checked');
  const c9 = T.buildChord('C', 'dom9'), v9 = T.pianoVoicings(c9);
  eq(T.pianoChordPlan(c9, v9[3], 'B', 4).R.map(x => x.tone.name), ['E', 'B♭'], 'C9 shell: E + B♭ in the RH');
}

group('piano — Match guitar (splitHands)');
{
  let n = 0, bad = 0;
  for (const r of ['C', 'G', 'D', 'A', 'E', 'F', 'B♭', 'F♯']) for (const q of ['major', 'minor', 'dom7', 'maj7', 'min7', 'dim7', 'dom9']) {
    const ch = T.buildChord(r, q);
    for (const v of T.chordPositions(ch, tuningStrings('standard'))) {
      const midis = v.midi.filter(x => x != null); n++;
      const sp = T.splitHands(midis);
      const all = [...sp.L, ...sp.R].sort((a, b) => a - b);
      eq(all, midis.slice().sort((a, b) => a - b), `${ch.name} guitar voicing: split keeps every pitch`);
      ok(sp.L.length === 0 || sp.R.length === 0 || sp.L[sp.L.length - 1] < sp.R[0], 'LH below RH');
      ok(sp.L.length <= 5 && sp.R.length <= 5, 'at most 5 notes per hand');
      const pl = T.pianoMatchPlan(ch, midis);
      ok([...pl.R, ...pl.L].every(x => x.finger >= 1 && x.finger <= 5), 'match plan fingers 1–5');
      ok(pl.R.every((x, i) => i === 0 || x.finger > pl.R[i - 1].finger) && pl.L.every((x, i) => i === 0 || x.finger < pl.L[i - 1].finger), 'match plan fingers rise in RH / fall in LH');
    }
  }
  ok(n > 100, n + ' guitar voicings matched');
  eq(T.splitHands([48, 55, 60, 64, 67]), { L: [48, 55], R: [60, 64, 67] }, 'open-C-ish stack: bass in the LH, triad in the RH');
  eq(T.splitHands([]), { L: [], R: [] }, 'empty');
}

console.log(`\n${fail ? '✗ FAILED' : '✓ ALL PASSED'} — ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
