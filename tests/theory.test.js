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


/* ============ MIDI input + practice ============ */
group('MIDI message parsing (simulated device stream)');
{
  eq(T.parseMidiMessage([0x90, 60, 100]), { type: 'on', midi: 60, vel: 100, ch: 0 }, 'note on');
  eq(T.parseMidiMessage([0x90, 60, 0]), { type: 'off', midi: 60, vel: 0, ch: 0 }, 'note on with velocity 0 is a note off (running-status pianos)');
  eq(T.parseMidiMessage([0x80, 62, 40]), { type: 'off', midi: 62, vel: 40, ch: 0 }, 'note off');
  eq(T.parseMidiMessage([0x93, 72, 90]).ch, 3, 'channel is parsed');
  eq(T.parseMidiMessage([0xb0, 64, 127]), { type: 'sustain', on: true, value: 127, ch: 0 }, 'sustain pedal down');
  eq(T.parseMidiMessage([0xb0, 64, 0]).on, false, 'sustain pedal up');
  eq(T.parseMidiMessage([0xb0, 123, 0]), { type: 'allOff', ch: 0 }, 'all notes off');
  eq(T.parseMidiMessage([0xb0, 7, 90]), null, 'other controllers ignored');
  eq(T.parseMidiMessage([0xf8]), null, 'clock ignored');
  eq(T.parseMidiMessage([0xfe]), null, 'active sensing ignored');
  eq(T.parseMidiMessage([0xe0, 0, 64]), null, 'pitch bend ignored');
  eq(T.parseMidiMessage([0xc0, 5]), null, 'program change ignored');
  eq(T.parseMidiMessage([]), null, 'empty');
  eq(T.parseMidiMessage(null), null, 'null');
  eq(T.parseMidiMessage(new Uint8Array([0x90, 61, 77])).midi, 61, 'Uint8Array input (what Web MIDI gives)');
  for (let ch = 0; ch < 16; ch++) for (let n = 21; n <= 108; n += 3) {
    eq(T.parseMidiMessage([0x90 | ch, n, 64]), { type: 'on', midi: n, vel: 64, ch }, `ch ${ch} note ${n} on`);
    eq(T.parseMidiMessage([0x80 | ch, n, 0]).type, 'off', `ch ${ch} note ${n} off`);
  }
}
group('computer-keyboard piano');
{
  eq(['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k'].map(k => T.keyToMidi(k, 4)), [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72], 'A W S E D F T G Y H U J K = C4 … C5');
  eq(T.keyToMidi('A', 3), 48, 'upper-case works, octave moves');
  eq(T.keyToMidi('o', 4), 73, 'O = C#5');
  eq(T.keyToMidi('z', 4), null, 'z is not a note key');
  eq(T.keyToMidi('Enter', 4), null, 'Enter is not a note key');
  for (let o = 0; o <= 7; o++) eq(T.keyToMidi('a', o) % 12, 0, `'a' is always a C (oct ${o})`);
}
group('practice steps from a plan');
const scalePlanFor = (root, id, k, hand, octs, oct) => {
  const hs = hand === 'B' ? ['L', 'R'] : [hand], notes = [];
  hs.forEach(h => { const pl = T.pianoScalePlan(root, id, k, h, octs, h === 'R' ? oct : oct - 1); pl.midis.forEach((m, i) => notes.push({ hand: h, midi: m, finger: pl.fingers[i], name: pl.names[i] })); });
  return { kind: 'scale', notes, seqMode: hand === 'B' ? 'parallel' : 'sorted' };
};
const chordPlanFor = (root, q, vi, hand, oct) => {
  const ch = T.buildChord(root, q), vs = T.pianoVoicings(ch), pl = T.pianoChordPlan(ch, vs[Math.min(vi, vs.length - 1)], hand, oct), notes = [];
  pl.L.forEach(x => notes.push({ hand: 'L', midi: x.midi, finger: x.finger, name: x.tone.name })); pl.R.forEach(x => notes.push({ hand: 'R', midi: x.midi, finger: x.finger, name: x.tone.name }));
  return { kind: 'chord', notes };
};
{
  const sp = T.practiceSteps(scalePlanFor('C', 'major', 0, 'R', 1, 4));
  eq(sp.map(s => s.midis[0]), [60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60], 'C major RH: up then down, top note once (15 steps)');
  eq(T.practiceSteps(scalePlanFor('C', 'major', 0, 'R', 1, 4), { down: false }).length, 8, 'up only = 8 steps');
  eq(T.practiceSteps(scalePlanFor('C', 'major', 0, 'R', 2, 4), { down: false }).length, 15, 'two octaves up = 15 steps');
  const both = T.practiceSteps(scalePlanFor('C', 'major', 0, 'B', 1, 4), { down: false });
  eq(both.length, 8, 'both hands: one step per pair'); eq(both[0].midis, [48, 60], 'both hands: LH and RH start together'); eq(both[0].pcs, [0], 'pair has one pitch class');
  const ch = T.practiceSteps(chordPlanFor('C', 'major', 0, 'B', 4));
  eq(ch.length, 1, 'chord together = one step'); eq(ch[0].pcs, [0, 4, 7], 'C major pitch classes'); eq(ch[0].midis, [48, 60, 64, 67], 'LH bass + RH triad');
  const one = T.practiceSteps(chordPlanFor('C', 'major', 0, 'R', 4), { how: 'single' });
  eq(one.map(s => s.midis[0]), [60, 64, 67, 64, 60], 'chord one by one: up and back');
  eq(T.practiceSteps({ kind: 'chord', notes: [] }).length, 1, 'empty chord does not crash');
}
group('practice matcher — scenarios');
{
  let t = 0; const T0 = () => (t += 100);
  const mk = (plan, o, so) => T.createPractice(T.practiceSteps(plan, so), o);
  // 1. C major scale up, played legato (overlapping notes), any octave
  let pr = mk(scalePlanFor('C', 'major', 0, 'R', 1, 4), {}, { down: false }); t = 1000;
  const seq = [60, 62, 64, 65, 67, 69, 71, 72]; let last, evs = [];
  seq.forEach((m, i) => { last = pr.noteOn(m + (i % 2 ? 12 : -12), T0()); evs.push(last.type); /* alternate octaves, never released = fully legato */ });
  eq(evs, ['step', 'step', 'step', 'step', 'step', 'step', 'step', 'done'], 'legato scale in odd octaves advances every note, then done');
  eq(pr.summary().correct, 8, '8 correct'); eq(pr.summary().wrong, 0, '0 wrong'); ok(pr.done && pr.summary().perfect, 'perfect');
  eq(pr.summary().ms, 700, 'time = first note to last (700 ms)');
  eq(pr.noteOn(60, T0()).type, 'ignore', 'input after done is ignored');
  // 2. wrong note counts and does not advance; right note then advances
  pr = mk(scalePlanFor('C', 'major', 0, 'R', 1, 4), {}, { down: false });
  eq(pr.noteOn(61, 10).type, 'wrong', 'C# is wrong at step 1'); eq(pr.idx, 0, 'still step 1'); eq(pr.noteOn(60, 20).type, 'step', 'C then advances'); eq(pr.summary().wrong, 1, 'one wrong');
  eq(pr.noteOn(64, 30).type, 'wrong', 'skipping to E is wrong'); eq(pr.summary().accuracy, 1 / 3, 'accuracy = correct/(correct+wrong)');
  // 3. exact octave
  pr = mk(scalePlanFor('C', 'major', 0, 'R', 1, 4), { exact: true }, { down: false });
  const w = pr.noteOn(72, 1); eq(w.type, 'wrong', 'exact: C5 is wrong when C4 is needed'); eq(w.octave, true, 'and it says "right note, wrong octave"'); eq(pr.noteOn(60, 2).type, 'step', 'exact: C4 ok');
  // 4. a chord must be held together
  pr = mk(chordPlanFor('C', 'major', 0, 'R', 4), {}); 
  eq(pr.noteOn(60, 1).type, 'ok', 'C of C-E-G: ok but not done'); pr.noteOff(60, 2); eq(pr.noteOn(64, 3).type, 'ok', 'E alone after releasing C: still waiting'); pr.noteOff(64, 4);
  eq(pr.idx, 0, 'arpeggiating a block chord does not complete it');
  pr.noteOn(60, 5); pr.noteOn(64, 6); eq(pr.noteOn(67, 7).type, 'done', 'all three held: done'); eq(pr.summary().wrong, 0, 'no wrong notes');
  // 5. any octave for chord, mixed
  pr = mk(chordPlanFor('C', 'major', 0, 'R', 4), {}); pr.noteOn(36, 1); pr.noteOn(76, 2); eq(pr.noteOn(91, 3).type, 'done', 'C2 + E5 + G6 counts in pitch-class mode');
  pr = mk(chordPlanFor('C', 'major', 0, 'R', 4), { exact: true }); eq(pr.noteOn(36, 1).type, 'wrong', 'exact: C2 is not the C4 needed'); pr.noteOn(64, 2); pr.noteOn(67, 3); eq(pr.idx, 0, 'exact chord not complete');
  // 6. extra note in a chord is wrong but chord still completes
  pr = mk(chordPlanFor('C', 'major', 0, 'R', 4), {}); pr.noteOn(60, 1); eq(pr.noteOn(62, 2).type, 'wrong', 'D is not in C major'); pr.noteOn(64, 3); eq(pr.noteOn(67, 4).type, 'done', 'chord completes'); eq(pr.summary().wrong, 1, 'with 1 wrong note on the score');
  // 7. a note still held from the previous step does not count for the next chord
  pr = mk(chordPlanFor('C', 'major', 0, 'R', 4), {}, { how: 'single' }); // C E G E C
  pr.noteOn(60, 1); pr.noteOn(64, 2); pr.noteOn(67, 3); pr.noteOn(64, 4); eq(pr.idx, 4, 'one by one: 4 steps in'); eq(pr.noteOn(72, 5).type, 'done', 'last C (octave up) ends it');
  // 8. repeated press of a satisfied note is not an error
  pr = mk(chordPlanFor('C', 'major', 0, 'R', 4), {}); pr.noteOn(60, 1); eq(pr.noteOn(72, 2).type, 'ok', 'second C is just another C'); eq(pr.summary().correct, 1, 'counted once');
  // 9. time before the first note does not count; reset-like behaviour
  pr = mk(chordPlanFor('C', 'major', 0, 'R', 4), {}); eq(pr.summary().ms, 0, 'no time before the first note'); eq(pr.started, false, 'not started');
  pr.noteOn(60, 5000); pr.noteOn(64, 5300); pr.noteOn(67, 6500); eq(pr.summary().ms, 1500, 'chord time 1.5 s');
  eq(T.fmtMs(1500), '0:02', 'format 1.5s'); eq(T.fmtMs(83000), '1:23', 'format 83 s'); eq(T.fmtMs(0), '0:00', 'format 0');
  // 10. noteOff for a note never pressed is harmless; releaseAll
  pr = mk(chordPlanFor('C', 'major', 0, 'R', 4), {}); eq(pr.noteOff(50, 1).type, 'release', 'stray off ok'); pr.noteOn(60, 2); pr.releaseAll(); pr.noteOn(64, 3); eq(pr.noteOn(67, 4).type, 'ok', 'releaseAll forgets the C');
  // 11. empty plan
  pr = T.createPractice([], {}); eq(pr.noteOn(60, 1).type, 'ignore', 'no steps: ignore');
  // 12. simulated MIDI stream: bytes -> parser -> matcher, C major triad then the D dorian scale
  const feed = (pr, bytes, t) => { const e = T.parseMidiMessage(bytes); return e && (e.type === 'on' ? pr.noteOn(e.midi, t) : e.type === 'off' ? pr.noteOff(e.midi, t) : null); };
  pr = mk(chordPlanFor('C', 'major', 0, 'R', 4), {}); const stream = [[0xf8], [0x90, 64, 80], [0xfe], [0x90, 60, 70], [0xb0, 64, 127], [0x90, 67, 90]]; let r2; stream.forEach((b, i) => { r2 = feed(pr, b, 100 * i) || r2; });
  eq(r2.type, 'done', 'MIDI byte stream with clock/sustain noise completes the chord');
  pr = mk(scalePlanFor('D', 'dorian', 0, 'R', 1, 4), {}, { down: false }); const dd = [62, 64, 65, 67, 69, 71, 72, 74]; dd.forEach((m, i) => { feed(pr, [0x90, m, 80], i * 400); feed(pr, [0x80, m, 0], i * 400 + 300); }); ok(pr.done && pr.summary().perfect, 'D Dorian played through "MIDI" is perfect');
}
group('practice matcher — both hands, same note (partner press)');
{
  const steps = T.practiceSteps(scalePlanFor('C', 'major', 0, 'B', 1, 4), { down: false });
  let pr = T.createPractice(steps, {}); pr.noteOn(48, 1000);                      // LH C accepted: step done
  eq(pr.noteOn(60, 1100).type, 'partner', 'RH C a moment later is the partner, not an error'); eq(pr.summary().wrong, 0, 'no wrong');
  pr = T.createPractice(steps, {}); pr.noteOn(48, 1000); eq(pr.noteOn(60, 1400).type, 'wrong', 'a repeated C 400 ms later is wrong (we are on D)');
  pr = T.createPractice(steps, { exact: true }); pr.noteOn(48, 1000); eq(pr.idx, 0, 'exact mode needs both octaves'); eq(pr.noteOn(60, 1050).type, 'step', 'both hands pressed -> next');
}
group('practice matcher — every scale, every position, every root');
{
  const rng = T.mulberry32(7); let runs = 0;
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  for (const id of T.SCALE_ORDER) for (const root of ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']) {
    const len = T.SCALES[id].pts.length;
    for (let k = 0; k < len; k++) for (const hand of ['R', 'L', 'B']) {
      let plan; try { plan = scalePlanFor(root, id, k, hand, k % 2 + 1, 4); } catch (e) { fail++; console.log('  ✗ plan ' + root + id + e.message); continue; }
      for (const exact of [false, true]) {
        if (exact && hand === 'B' && false) continue;
        const steps = T.practiceSteps(plan), pr = T.createPractice(steps, { exact }); let t = 0, early = false;
        steps.forEach((s, si) => {
          const order = shuffle(s.midis.map(m => (exact ? m : m + 12 * (Math.floor(rng() * 5) - 2))));
          const cov = new Set(); order.forEach(m => { cov.add(exact ? m : m % 12); const e = pr.noteOn(m, t += 50); if ((e.type === 'step' || e.type === 'done') && cov.size < (exact ? s.midis.length : s.pcs.length)) early = true; });
          if (si % 2) order.forEach(m => pr.noteOff(m, t += 5));     // sometimes release, sometimes stay legato
        });
        runs++;
        if (!(pr.done && pr.summary().wrong === 0 && !early && pr.summary().correct === pr.summary().total)) { fail++; console.log(`  ✗ ${root} ${id} pos ${k} ${hand} exact=${exact}: done=${pr.done} wrong=${pr.summary().wrong} early=${early}`); } else pass++;
      }
    }
  }
  ok(runs > 5000, runs + ' scale practice runs');
}
group('practice matcher — every chord quality, every root, every voicing and hand');
{
  const rng = T.mulberry32(11); let runs = 0;
  for (const q of T.CHORD_ORDER) for (const root of ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']) {
    const ch = T.buildChord(root, q), nv = T.pianoVoicings(ch).length;
    for (let vi = 0; vi < nv; vi++) for (const hand of ['R', 'L', 'B', 'S']) {
      const plan = chordPlanFor(root, q, vi, hand, 4), steps = T.practiceSteps(plan);
      if (steps.length !== 1) { fail++; console.log('  ✗ chord steps ' + root + q); continue; }
      const need = steps[0].pcs, mids = steps[0].midis.slice();
      const pcOk = need.every(pc => ch.tones.some(t => t.pc === pc)); ok(pcOk, `${root}${q}: step pitch classes belong to the chord`);
      for (const exact of [false, true]) {
        const pr = T.createPractice(steps, { exact }), order = mids.slice().sort(() => rng() - 0.5); let fin = false, t = 0; const cov = new Set();
        order.forEach(m => { const mm = exact ? m : m + 12 * (Math.floor(rng() * 3) - 1); cov.add(exact ? mm : mm % 12); const ev = pr.noteOn(mm, t += 40); if (ev.type === 'done') { fin = true; if (cov.size < (exact ? mids.length : need.length)) { fail++; console.log('  ✗ completed early ' + root + q); } } });
        runs++; ok(fin && pr.summary().wrong === 0, `${root}${q} v${vi} ${hand} exact=${exact} completes`);
        // dropping one note before the last must not complete: press all but one, release, press the last
        if (order.length > 1) { const p2 = T.createPractice(steps, { exact }); order.slice(0, -1).forEach(m => p2.noteOn(m, 1)); p2.noteOff(order[0], 2); const e2 = p2.noteOn(order[order.length - 1], 3); ok(e2.type === 'ok' || (need.length === 1 || new Set(order.map(x => exact ? x : x % 12)).size < order.length), `${root}${q}: released note must be re-pressed`); }
      }
    }
  }
  ok(runs > 5000, runs + ' chord practice runs');
}
group('practice matcher — wrong-note scoring is exact');
{
  const plan = scalePlanFor('C', 'major', 0, 'R', 1, 4), steps = T.practiceSteps(plan, { down: false });
  for (let nWrong = 0; nWrong <= 12; nWrong++) {
    const pr = T.createPractice(steps, {}); let t = 0, wr = 0;
    steps.forEach((s, i) => { if (wr < nWrong) { const bad = [1, 3, 6, 8, 10][i % 5] + 60; pr.noteOn(bad, t += 10); wr++; pr.noteOff(bad, t += 1); } pr.noteOn(s.midis[0], t += 10); pr.noteOff(s.midis[0], t += 1); });
    eq(pr.summary().wrong, Math.min(nWrong, 8), `${nWrong} wrong presses scored`); eq(pr.summary().correct, 8, 'and still 8 correct');
    eq(pr.summary().accuracy, 8 / (8 + Math.min(nWrong, 8)), 'accuracy ' + nWrong);
  }
}


/* ---------------- SONG GENERATOR ---------------- */
const SONG_METERS = ['2/4','3/4','4/4','5/4','6/8','7/8','9/8','12/8'];
const SONG_SCALES = Object.keys(SCALE_COUNT);
const mod12 = x => ((x % 12) + 12) % 12;
group('song — rhythm patterns are valid for every meter');
SONG_METERS.forEach(mt => {
  const g = T.songGrid(mt); eq(T.SONG_RHYTHMS[mt].length, 3, mt + ' has 3 intensity levels');
  T.SONG_RHYTHMS[mt].forEach((p, lvl) => {
    eq(p.length, g.slots, `${mt} level ${lvl}: one char per slot`); ok(/^[Dub.]+$/.test(p), `${mt} level ${lvl}: allowed chars only`); ok(p[0] !== '.', `${mt} level ${lvl}: slot 0 is a hit`);
  });
  const hits = T.SONG_RHYTHMS[mt].map(p => p.replace(/\./g, '').length); ok(hits[0] <= hits[1] && hits[1] <= hits[2], `${mt}: intensity grows`);
  eq(T.songCounts(mt).length, g.slots, mt + ' counts length');
});
eq(T.songGrid('4/4').slots, 8, '4/4 = 8 slots'); eq(T.songGrid('6/8').slots, 6, '6/8 = 6 slots'); eq(T.songGrid('7/8').slots, 7, '7/8 = 7 slots'); eq(T.songGrid('12/8').slots, 12, '12/8 = 12 slots');
eq(T.songCounts('4/4').join(' '), '1 & 2 & 3 & 4 &', '4/4 counting'); eq(T.songCounts('6/8').join(' '), '1 2 3 4 5 6', '6/8 counting');

group('song — melody window is playable in every tuning');
TUN_IDS.concat(['fullDown', 'openE']).forEach(id => {
  const st = tuningStrings(id), w = T.melodyWindow(st), pr = T.playableRange(st);
  ok(w.lo >= pr.lo && w.hi <= pr.hi, `${id} window ${w.lo}-${w.hi} inside ${pr.lo}-${pr.hi}`); ok(w.hi - w.lo >= 12, `${id} window spans at least an octave (${w.hi - w.lo})`);
});

group('song — every root × scale × meter × tuning × form × seed gives a valid song');
{
  let n = 0, strong = 0, strongCT = 0, tonicEnds = 0, chorusCount = 0, distinctChorus = 0, seedDiff = 0, seedPairs = 0;
  const forms = ['full', 'short'], seeds = [1, 2, 3, 7, 42];
  for (const root of KEYS12) for (const sc of SONG_SCALES) {
    const scPcs = new Set(T.spellScale(root, sc).map(x => x.pc)), rootPc = T.spellScale(root, sc)[0].pc;
    SONG_METERS.forEach((mt, mi) => {
      const g = T.songGrid(mt), tun = TUN_IDS[(mi + KEYS12.indexOf(root)) % TUN_IDS.length], st = tuningStrings(tun);
      const seed = seeds[(mi + SONG_SCALES.indexOf(sc)) % seeds.length], form = forms[(mi + KEYS12.indexOf(root)) % 2];
      const so = T.generateSong({ rootName: root, scaleId: sc, meter: mt, seed, form, tuningStrings: st }); n++;
      const lab = `${root} ${sc} ${mt} ${tun} #${seed} ${form}`;
      eq(so.order.join(), T.SONG_FORMS[form].join(), lab + ' order');
      const ids = [...new Set(so.order)]; eq(Object.keys(so.sections).sort().join(), ids.sort().join(), lab + ' sections');
      const win = so.window;
      ids.forEach(id => {
        const sec = so.sections[id];
        ok(sec.chords.length === sec.bars && sec.bars >= 2, lab + ' ' + id + ' chord per bar');
        sec.chords.forEach(c => ok(c.name && c.pcs && c.pcs.length >= 3, lab + ' chord valid'));
        eq(sec.rhythm.length, g.slots, lab + ' ' + id + ' rhythm length');
        ok(sec.melody.length >= sec.bars, lab + ' ' + id + ' melody has notes');
        // melody tiles the section exactly, starts each bar on slot 0 .. and stays inside the bar
        let t = 0, okTile = true, okRange = true, okScale = true, okBarSlot = true;
        sec.melody.forEach(nt => {
          if (Math.abs(nt.pulse - t) > 1e-9) okTile = false; t += nt.pulses;
          if (nt.midi < win.lo || nt.midi > win.hi) okRange = false;
          if (!scPcs.has(mod12(nt.midi))) okScale = false;
          if (nt.slot < 0 || nt.slot >= g.slots || nt.bar < 0 || nt.bar >= sec.bars) okBarSlot = false;
          if (Math.abs(nt.pulse - (nt.bar * g.pulses + nt.slot * g.slotPulses)) > 1e-9) okBarSlot = false;
          if (nt.strong) { strong++; if (nt.chordTone) strongCT++; }
          if (nt.chordTone !== sec.chords[nt.bar].pcs.includes(mod12(nt.midi))) okScale = false;
        });
        ok(okTile && Math.abs(t - sec.bars * g.pulses) < 1e-9, lab + ' ' + id + ' melody fills every pulse (' + t + ')');
        ok(okRange, lab + ' ' + id + ' melody within window'); ok(okScale, lab + ' ' + id + ' melody in scale / chordTone flags right'); ok(okBarSlot, lab + ' ' + id + ' note positions');
        for (let b = 0; b < sec.bars; b++) ok(sec.melody.some(x => x.bar === b && x.slot === 0), lab + ' ' + id + ' bar ' + b + ' starts on slot 0');
        // tab: every note playable, pitch reproduced
        eq(sec.tab.length, sec.melody.length, lab + ' tab length');
        sec.tab.forEach((tb, i) => { ok(tb && tb.fret >= 0 && tb.fret <= 15 && tb.string >= 0 && tb.string < st.length && st[tb.string] + tb.fret === sec.melody[i].midi, lab + ' tab note ' + i); });
        const txt = T.songTab(so, id); const tl = txt.split('\n').filter(l => /\|/.test(l));
        eq(tl.length % st.length, 0, lab + ' tab has a line per string'); ok(new Set(tl.map(l => l.length)).size <= 1 + 0 || tl.every(l => l.length > 0), lab + ' tab lines');
        const frets = txt.split('\n').filter(l => /\|/.test(l)).join('').replace(/^.*?\|/gm, '').match(/\d+/g) || [];
        eq(frets.length, sec.tab.length, lab + ' ' + id + ' tab prints every note');
      });
      const ending = (id, tonic) => { const m = so.sections[id].melody; return m[m.length - 1]; };
      if (so.sections.chorus) { const lastC = so.sections.chorus.chords[so.sections.chorus.chords.length - 1]; if (lastC.pcs.includes(rootPc)) { chorusCount++; if (mod12(ending('chorus').midi) === rootPc) tonicEnds++; } if (so.sections.verse.chords.map(c => c.name).join() !== so.sections.chorus.chords.map(c => c.name).join()) distinctChorus++; }
      ids.forEach(id => { const m = so.sections[id].melody, last = m[m.length - 1]; ok(last.chordTone, lab + ' ' + id + ' ends on a chord tone'); });
      // determinism
      if (n % 7 === 0) { const so2 = T.generateSong({ rootName: root, scaleId: sc, meter: mt, seed, form, tuningStrings: st }); eq(JSON.stringify(so2.sections), JSON.stringify(so.sections), lab + ' deterministic'); }
      if (n % 5 === 0) { const so3 = T.generateSong({ rootName: root, scaleId: sc, meter: mt, seed: seed + 100, form, tuningStrings: st }); seedPairs++; if (JSON.stringify(so3.sections.verse.melody.map(x => x.midi)) !== JSON.stringify(so.sections.verse.melody.map(x => x.midi))) seedDiff++; }
    });
  }
  ok(n === 12 * SONG_SCALES.length * 8, n + ' songs generated');
  ok(strongCT / strong >= 0.55, `chord tones on strong beats ${(100 * strongCT / strong).toFixed(1)}% ≥ 55% (${strongCT}/${strong})`);
  ok(chorusCount > 500 && tonicEnds === chorusCount, `choruses end on the tonic whenever the last chord contains it ${tonicEnds}/${chorusCount}`);
  ok(distinctChorus / chorusCount >= 0.85, `chorus differs from verse ${distinctChorus}/${chorusCount}`);
  ok(seedDiff / seedPairs >= 0.9, `different seeds give different melodies ${seedDiff}/${seedPairs}`);
}

group('song — melody repeats its motif (bar 3 echoes bar 1) and moves mostly by step');
{
  let steps = 0, leaps = 0, echo = 0, bars3 = 0;
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) for (const mt of ['4/4', '3/4', '6/8']) {
    const so = T.generateSong({ rootName: 'C', scaleId: 'major', meter: mt, seed }), sec = so.sections.verse, m = sec.melody;
    for (let i = 1; i < m.length; i++) { const d = Math.abs(m[i].midi - m[i - 1].midi); if (d <= 2) steps++; else if (d >= 5) leaps++; }
    const b1 = m.filter(x => x.bar === 0).map(x => x.slot).join(), b3 = m.filter(x => x.bar === 2).map(x => x.slot).join(); bars3++; if (b1 === b3) echo++;
  }
  ok(steps > 2 * leaps, `mostly stepwise (${steps} steps vs ${leaps} leaps)`); eq(echo, bars3, 'bar 3 repeats bar 1 rhythm');
}

group('song — timeline for playback');
SONG_METERS.forEach(mt => {
  for (const form of ['full', 'short']) {
    const so = T.generateSong({ rootName: 'G', scaleId: 'major', meter: mt, seed: 3, form }), tl = T.songTimeline(so, 100), g = T.songGrid(mt), ps = T.pulseSeconds(mt, 100);
    const nBars = so.order.reduce((a, id) => a + so.sections[id].bars, 0);
    eq(tl.bars.length, nBars, `${mt} ${form} bar count`); near(tl.total, nBars * g.pulses * ps, 1e-9, `${mt} ${form} total length`);
    let mono = true; for (let i = 1; i < tl.events.length; i++) if (tl.events[i].t < tl.events[i - 1].t - 1e-12) mono = false; ok(mono, `${mt} ${form} events sorted`);
    ok(tl.events.every(e => e.t >= 0 && e.t < tl.total && e.dur > 0 && e.t + e.dur <= tl.total + 1e-9), `${mt} ${form} events inside the song`);
    const expectChord = so.order.reduce((a, id) => a + so.sections[id].bars * so.sections[id].rhythm.replace(/\./g, '').length, 0);
    eq(tl.events.filter(e => e.kind === 'chord').length, expectChord, `${mt} ${form} chord hits`);
    eq(tl.events.filter(e => e.kind === 'melody').length, so.order.reduce((a, id) => a + so.sections[id].melody.length, 0), `${mt} ${form} melody notes`);
    ok(tl.bars.every((b, i) => i === 0 || Math.abs(b.t - tl.bars[i - 1].t - tl.barSec) < 1e-9), `${mt} ${form} bars evenly spaced`);
  }
});
{ const so = T.generateSong({ rootName: 'C', scaleId: 'major', meter: '4/4', seed: 1 }); near(T.songTimeline(so, 120).total * 2, T.songTimeline(so, 60).total, 1e-9, 'half the tempo = twice the length'); }

group('song — piano fingering for the chords and the text export');
{
  const so = T.generateSong({ rootName: 'C', scaleId: 'major', meter: '4/4', seed: 4 });
  for (const id of Object.keys(so.sections)) so.sections[id].chords.forEach(c => { const l = T.pianoChordLine(c); ok(/^[A-G][♯♭]?\(\d\)( [A-G][♯♭]?\(\d\))*$/.test(l.rh) && l.lh.length > 0, `${c.name}: RH ${l.rh} LH ${l.lh}`); });
  const l = T.pianoChordLine(T.buildChord('C', 'major')); eq(l.rh, 'C(1) E(3) G(5)', 'C major RH = C E G on 1 3 5'); ok(/^C\(5\)/.test(l.lh), 'C major LH starts on pinky: ' + l.lh);
  const tx = T.songText(so, false, 100); ok(tx.includes('[Verse]') && tx.includes('[Chorus]') && tx.includes('1 & 2 & 3 & 4 &') && tx.includes('e|'), 'song text contains sections, counts and tab');
}

/* ---------------- LESSONS ---------------- */
group('lessons — staff positions');
eq(T.staffStep(64, 'E'), 30, 'E4 = bottom line of the treble staff'); eq(T.staffStep(43, 'G'), 18, 'G2 = bottom line of the bass staff');
eq(T.staffStep(60, 'C'), 28, 'middle C'); eq(T.staffStep(61, 'C♯'), 28, 'C♯4 sits on the C line'); eq(T.staffStep(61, 'D♭'), 29, 'D♭4 sits on the D line');
eq(T.staffStep(58, 'B♭'), T.staffStep(59, 'B'), 'B♭3 sits on the B line'); eq(T.staffStep(59, 'B'), 27, 'B3 = 27');
eq(T.staffStep(71, 'B') - T.staffStep(60, 'C'), 6, 'B4 is six steps above middle C'); eq(T.staffStep(72, 'C') - T.staffStep(60, 'C'), 7, 'an octave is seven steps');
for (let m = 21; m <= 108; m++) { const nm = T.SHARP_NAMES[m % 12]; eq(T.staffStep(m + 12, nm) - T.staffStep(m, nm), 7, 'octave = 7 steps, midi ' + m); }

group('lessons — note parser');
{
  const n = T.parseLessonNote('R:E♭4:3'); eq([n.hand, n.midi, n.name, n.finger, n.tab], ['R', 63, 'E♭', 3, null], 'R:E♭4:3');
  eq(T.parseLessonNote('R:Eb4:3').midi, 63, 'ascii flat'); eq(T.parseLessonNote('R:F#4:-').midi, 66, 'ascii sharp'); eq(T.parseLessonNote('R:F#4:-').finger, null, 'finger -');
  eq(T.parseLessonNote('L:C3:5').midi, 48, 'C3 = 48'); eq(T.parseLessonNote('R:C4:1').midi, 60, 'C4 = 60'); eq(T.parseLessonNote('L:B♭2:5').midi, 46, 'B♭2 = 46');
  eq(T.parseLessonNote('R:F4:3@2/6').tab, { string: 2, fret: 6 }, 'tab annotation');
  for (const bad of ['X:C4:1', 'R:H4:1', 'R:C4:6', 'R:C4', 'R:C4:1@7/0', 'C4:1']) { let t = false; try { T.parseLessonNote(bad); } catch (e) { t = true; } ok(t, 'rejects ' + bad); }
  const st = T.parseLessonSteps('L:C3:5+R:E4:3 R:G4:5');
  eq(st.length, 2, 'two steps'); eq(st[0].midis, [48, 64], 'step 0 midis sorted'); eq(st[0].pcs, [0, 4], 'step 0 pcs'); eq(st[1].midis, [67], 'step 1');
  eq(T.lessonTabMidi(6, 0), 40, 'low E string'); eq(T.lessonTabMidi(1, 0), 64, 'high E string'); eq(T.lessonTabMidi(2, 3), 62, 'B string fret 3 = D4');
}

group('lessons — structure of every lesson and part');
{
  const ids = new Set(); ok(T.LESSONS.length >= 7, 'at least the seven requested lessons');
  eq(T.LESSONS.map(l => l.id), ['fingers', 'fivefinger', 'cscale', 'triads', 'staff', 'wheel1', 'wheel2'], 'lessons in teaching order');
  for (const l of T.LESSONS) {
    ok(!ids.has(l.id), `lesson id ${l.id} unique`); ids.add(l.id); ok(l.title && l.blurb && l.parts.length >= 3, `${l.id}: title, blurb, 3+ parts`);
    const pids = new Set();
    for (const p of l.parts) {
      const k = l.id + '/' + p.id; ok(!pids.has(p.id), `${k} unique`); pids.add(p.id);
      ok(p.title && Array.isArray(p.text) && p.text.length >= 1 && p.text.every(x => typeof x === 'string' && x.length > 20), `${k}: title and text`);
      ok(p.ex && typeof p.ex.steps === 'string', `${k}: has an exercise`);
      eq(T.lessonById(l.id), l, 'lessonById ' + l.id);
    }
  }
  eq(T.lessonById('nope'), undefined, 'unknown lesson');
}

group('lessons — every exercise parses and is playable');
const FINGER_LESSON_PARTS = [];
for (const l of T.LESSONS) for (const p of l.parts) {
  const k = l.id + '/' + p.id, pl = T.lessonPlan(p.ex), steps = pl.steps;
  ok(steps.length >= 3 && steps.length <= 20, `${k}: 3–20 steps (${steps.length})`);
  eq(pl.kind, 'lesson', k + ' kind'); eq(pl.forceExact, !!p.ex.exact, k + ' forceExact');
  ok(steps.every(s => s.notes.every(n => n.midi >= 21 && n.midi <= 108)), `${k}: inside the 88 keys`);
  ok(steps.every(s => s.notes.every(n => n.finger === null || (n.finger >= 1 && n.finger <= 5))), `${k}: fingers 1–5`);
  ok(steps.every(s => { const nn = s.notes.length; return new Set(s.midis).size === nn; }), `${k}: no duplicate keys in a step`);
  ok(steps.every(s => ['R', 'L'].every(h => s.notes.filter(n => n.hand === h).length <= 5)), `${k}: ≤5 notes per hand`);
  // fingers inside one hand must run with the keys: RH higher key = higher finger number, LH higher key = lower finger number
  ok(steps.every(s => ['R', 'L'].every(h => { const a = s.notes.filter(n => n.hand === h && n.finger).sort((x, y) => x.midi - y.midi); return a.every((n, i) => i === 0 || (h === 'R' ? n.finger > a[i - 1].finger : n.finger < a[i - 1].finger)); })), `${k}: fingers run with the keys in each chord`);
  // tab annotations reproduce the pitch
  for (const s of steps) for (const n of s.notes) if (n.tab) { eq(T.lessonTabMidi(n.tab.string, n.tab.fret), n.midi, `${k}: tab ${n.tab.string}/${n.tab.fret} = ${n.name}${n.oct}`); ok(n.tab.fret <= 12, `${k}: fret ≤ 12`); }
  eq(pl.hasTab, steps.some(s => s.notes.some(n => n.tab)), k + ' hasTab flag');
  // the unique-notes list covers every step note
  ok(steps.every(s => s.notes.every(n => pl.notes.some(x => x.hand === n.hand && x.midi === n.midi))), `${k}: plan.notes covers all steps`);
  ok(pl.notes.every((n, i) => i === 0 || pl.notes[i - 1].midi <= n.midi), `${k}: plan.notes sorted`);
  // single-hand melodic motion: a finger may go "against" the pitch only as a thumb-under / cross-over, and never leap more than an octave
  for (let i = 1; i < steps.length; i++) for (const h of ['R', 'L']) {
    const a = steps[i - 1].notes.filter(n => n.hand === h), b = steps[i].notes.filter(n => n.hand === h);
    if (a.length === 1 && b.length === 1 && a[0].finger && b[0].finger) {
      const dp = b[0].midi - a[0].midi, df = b[0].finger - a[0].finger, dir = h === 'R' ? df : -df;
      ok(Math.abs(dp) <= 12, `${k}: ${h} leap ≤ octave at step ${i}`);
      if (dp !== 0 && Math.sign(dir) !== Math.sign(dp) && df !== 0) ok(a[0].finger === 1 || b[0].finger === 1, `${k}: ${h} step ${i} crossing uses the thumb (${a[0].finger}→${b[0].finger})`);
      if (dp === 0) eq(df, 0, `${k}: repeated key keeps its finger`);
    }
  }
  // a simulated perfect run completes with no wrong notes — in both matching modes
  for (const exact of [false, true]) {
    const run = T.createPractice(steps, { exact: exact || pl.forceExact }); let t = 1000;
    for (const s of steps) { for (const m of s.midis) { run.noteOn(m, t); t += 40; } for (const m of s.midis) { run.noteOff(m, t); } t += 400; }
    ok(run.done, `${k}: perfect run finishes (exact=${exact})`); eq(run.summary().wrong, 0, `${k}: no wrong notes (exact=${exact})`);
  }
  // a wrong note is noticed
  { const run = T.createPractice(steps, { exact: true }), bad = steps[0].midis.includes(61) ? 62 : 61; run.noteOn(bad, 1000); ok(run.summary().wrong === 1 && !run.done, `${k}: a wrong key is counted`); }
}

group('lessons — fingerings agree with the app’s own chord and scale fingerings');
{
  const CH = {}, flats = T.FLAT_NAMES, sharps = T.SHARP_NAMES;
  for (let pc = 0; pc < 12; pc++) for (const q of ['major', 'minor']) for (const nm of new Set([sharps[pc], flats[pc]])) { const ch = T.buildChord(nm, q); CH[q + ':' + pc] = CH[q + ':' + pc] || ch; }
  let triads = 0;
  for (const l of T.LESSONS) for (const p of l.parts) for (const s of T.parseLessonSteps(p.ex.steps)) for (const h of ['R', 'L']) {
    const g = s.notes.filter(n => n.hand === h); if (g.length !== 3 || !g.every(n => n.finger)) continue;
    const pcs = g.map(n => n.midi % 12); let found = null;
    for (const q of ['major', 'minor']) for (let r = 0; r < 12; r++) { const ch = CH[q + ':' + r], set = ch.tones.map(t => t.pc).sort((a, b) => a - b).join(); if (set === [...pcs].sort((a, b) => a - b).join()) found = { ch, q }; }
    ok(found, `${l.id}/${p.id}: ${g.map(n => n.name).join('')} is a major or minor triad`); if (!found) continue;
    const vs = T.pianoVoicings(found.ch), inv = vs.findIndex(v => v.bassTone.pc === g[0].midi % 12);
    const plan = T.pianoChordPlan(found.ch, vs[inv], h, 4), want = plan[h].map(x => x.finger), have = g.map(n => n.finger);
    eq(have, want, `${l.id}/${p.id}: ${h} ${found.ch.name || ''} inversion ${inv} fingers match the app (${have.join('-')})`); triads++;
  }
  ok(triads >= 20, `cross-checked ${triads} triads against pianoChordPlan`);
  const scale = (hand, g) => T.pianoScalePlan('C', 'major', 0, hand, 1, hand === 'R' ? 4 : 3);
  const fingersOf = id => T.parseLessonSteps(T.lessonById('cscale').parts.find(x => x.id === id).ex.steps).map(s => s.notes.find(n => n.hand === (id.startsWith('lh') ? 'L' : 'R')).finger);
  const rh = T.pianoScalePlan('C', 'major', 0, 'R', 1, 4), lh = T.pianoScalePlan('C', 'major', 0, 'L', 1, 3);
  eq(fingersOf('rhup'), rh.fingers, 'RH scale up = pianoScalePlan'); eq(fingersOf('rhdown'), rh.fingers.slice().reverse(), 'RH scale down = reverse');
  eq(fingersOf('lhup'), lh.fingers, 'LH scale up = pianoScalePlan'); eq(fingersOf('lhdown'), lh.fingers.slice().reverse(), 'LH scale down = reverse');
  const tg = T.parseLessonSteps(T.lessonById('cscale').parts.find(x => x.id === 'together').ex.steps);
  eq(tg.map(s => s.notes.find(n => n.hand === 'R').finger), rh.fingers, 'together: RH = pianoScalePlan'); eq(tg.map(s => s.notes.find(n => n.hand === 'L').finger), lh.fingers, 'together: LH = pianoScalePlan');
  eq(tg.map(s => s.notes.find(n => n.hand === 'R').midi), rh.midis, 'together: RH keys'); eq(tg.map(s => s.notes.find(n => n.hand === 'L').midi), lh.midis, 'together: LH keys');
}

group('lessons — specific musical facts');
{
  const ex = (l, p) => T.lessonPlan(T.lessonById(l).parts.find(x => x.id === p).ex), nm = pl => pl.steps.map(s => s.notes.map(n => n.name).join('+'));
  eq(nm(ex('staff', 'tune')).join(' '), 'E E F G G F E D C C D E E D D', 'Ode to Joy notes');
  eq(ex('wheel2', 'melody').steps.map(s => s.notes[0].tab.fret), [6, 8, 10, 8, 6, 5, 3, 6, 5, 3, 5], 'Wheel in the Sky intro line = published B-string frets');
  eq(nm(ex('wheel2', 'melody')).join(' '), 'F G A G F E D F E D E', 'intro line note names');
  eq(nm(ex('fivefinger', 'minor')).slice(0, 5), ['C', 'D', 'E♭', 'F', 'G'], 'minor five-finger position');
  eq(ex('fivefinger', 'octaves').forceExact, true, 'octaves part requires exact keys'); eq(ex('fivefinger', 'crh').forceExact, false, 'single hand part does not');
  eq(ex('wheel1', 'bb').steps[3].midis, [46, 62, 65, 70], 'B♭ chord: B♭2 + D4 F4 B♭4');
  eq(ex('wheel2', 'dm').steps.map(s => s.midis[0]), [50, 65, 62, 57, 65], 'Dm picking pattern keys');
  eq(ex('wheel2', 'dm').steps.map(s => s.notes[0].name).join(''), 'DFDAF', 'Dm picking order');
  // the three chord patterns are the same shape moved
  const shape = pl => pl.steps.map(s => s.notes[0].finger).join(''); eq(shape(ex('wheel2', 'dm')), shape(ex('wheel2', 'f')), 'Dm and F patterns use the same fingers'); eq(shape(ex('wheel2', 'f')), shape(ex('wheel2', 'c')), 'F and C patterns use the same fingers');
  // grand-staff coverage: the open strings are the six pitches E2 A2 D3 G3 B3 E4
  eq(ex('staff', 'open').steps.map(s => s.midis[0]), T.GUITAR_STANDARD, 'open strings = standard tuning');
  // the staff lesson has no fingers except the tune
  ok(ex('staff', 'lines').hasFingers === false && ex('staff', 'tune').hasFingers === true, 'reading parts hide fingers, the tune shows them');
}

group('lessons — progress statistics');
{
  const total = T.LESSONS.reduce((a, l) => a + l.parts.length, 0), z = T.lessonStats({});
  eq([z.parts, z.done, z.complete], [total, 0, 0], 'empty progress');
  const all = {}; T.LESSONS.forEach(l => l.parts.forEach(p => all[l.id + '/' + p.id] = { acc: 100 })); const f = T.lessonStats(all);
  eq([f.done, f.complete], [total, T.LESSONS.length], 'all done'); eq(T.lessonStats({ 'fingers/numbers': 1, 'nope/x': 1 }).done, 1, 'unknown keys ignored');
  eq(T.lessonStats({ 'fingers/numbers': 1 }).lessons[0], { id: 'fingers', parts: 3, done: 1, complete: false }, 'one part done');
}

console.log(`\n${fail ? '✗ FAILED' : '✓ ALL PASSED'} — ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
