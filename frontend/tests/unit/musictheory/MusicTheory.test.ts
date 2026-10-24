import { describe, it, expect } from 'vitest';
import {
	noteToSemitone,
	semitoneToNote,
	getEnharmonic,
	transposeNote,
	shouldUseFlats,
	findRelativeMajor,
	intervals,
	scales,
	chords,
	majorScaleSemitones,
	naturalMinorScaleSemitones,
	generateScale,
	getMajorScaleByKey,
	getScaleWithDegrees,
	findRelativeMinor,
	getScaleChords,
	generateChord,
	getChordInversion,
	getChordProgressionInKey,
	getChordName
} from '$lib/helpers/MusicTheoryHelper';

describe('noteToSemitone', () => {
	it('maps natural notes', () => {
		expect(noteToSemitone('C')).toBe(0);
		expect(noteToSemitone('E')).toBe(4);
		expect(noteToSemitone('B')).toBe(11);
	});

	it('maps accidentals', () => {
		expect(noteToSemitone('C#')).toBe(1);
		expect(noteToSemitone('Bb')).toBe(10);
		expect(noteToSemitone('Cb')).toBe(11);
		expect(noteToSemitone('B#')).toBe(0);
	});

	it('throws for unknown notes', () => {
		expect(() => noteToSemitone('X')).toThrow('Unknown note');
	});
});

describe('semitoneToNote', () => {
	it('uses sharps by default', () => {
		expect(semitoneToNote(0)).toBe('C');
		expect(semitoneToNote(1)).toBe('C#');
		expect(semitoneToNote(11)).toBe('B');
	});

	it('uses flats when requested', () => {
		expect(semitoneToNote(1, true)).toBe('Db');
		expect(semitoneToNote(10, true)).toBe('Bb');
	});

	it('normalizes out-of-range semitones', () => {
		expect(semitoneToNote(12)).toBe('C');
		expect(semitoneToNote(-1)).toBe('B');
	});
});

describe('getEnharmonic', () => {
	it('returns the enharmonic equivalent', () => {
		expect(getEnharmonic('C#')).toBe('Db');
		expect(getEnharmonic('Db')).toBe('C#');
		expect(getEnharmonic('F#')).toBe('Gb');
	});

	it('returns natural notes unchanged', () => {
		expect(getEnharmonic('C')).toBe('C');
		expect(getEnharmonic('E')).toBe('E');
	});
});

describe('transposeNote', () => {
	it('transposes up', () => {
		expect(transposeNote('C', 4)).toBe('E');
		expect(transposeNote('C', 7)).toBe('G');
	});

	it('transposes down', () => {
		expect(transposeNote('E', -4)).toBe('C');
	});

	it('wraps around the octave', () => {
		expect(transposeNote('B', 2)).toBe('C#');
	});

	it('honours the flats preference', () => {
		expect(transposeNote('C', 3, true)).toBe('Eb');
	});
});

describe('shouldUseFlats', () => {
	it('returns true for flat keys', () => {
		for (const key of ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb']) {
			expect(shouldUseFlats(key)).toBe(true);
		}
	});

	it('returns false for sharp/natural keys', () => {
		for (const key of ['C', 'G', 'D', 'A', 'E', 'B', 'F#']) {
			expect(shouldUseFlats(key)).toBe(false);
		}
	});
});

describe('findRelativeMajor / findRelativeMinor', () => {
	it('finds the relative major of a minor key', () => {
		expect(findRelativeMajor('A')).toBe('C');
		expect(findRelativeMajor('E')).toBe('G');
	});

	it('finds the relative minor of a major key', () => {
		expect(findRelativeMinor('C')).toBe('A');
		expect(findRelativeMinor('G')).toBe('E');
	});
});

describe('constants', () => {
	it('exposes interval metadata', () => {
		expect(intervals.unison.semitones).toBe(0);
		expect(intervals.minorThird.semitones).toBe(3);
		expect(intervals.octave.shortName).toBe('P8');
	});

	it('exposes scale patterns', () => {
		expect(scales.major.pattern).toEqual([2, 2, 1, 2, 2, 2, 1]);
		expect(scales.naturalMinor.pattern).toEqual([2, 1, 2, 2, 1, 2, 2]);
		expect(majorScaleSemitones).toEqual(scales.major.pattern);
		expect(naturalMinorScaleSemitones).toEqual(scales.naturalMinor.pattern);
	});

	it('exposes chord intervals', () => {
		expect(chords.major.intervals).toEqual([0, 4, 7]);
		expect(chords.minor.intervals).toEqual([0, 3, 7]);
		expect(chords.diminished.intervals).toEqual([0, 3, 6]);
	});
});

describe('generateScale', () => {
	it('generates a C major scale', () => {
		expect(generateScale('C', scales.major)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
	});

	it('generates an A natural minor scale', () => {
		expect(generateScale('A', scales.naturalMinor)).toEqual([
			'A',
			'B',
			'C',
			'D',
			'E',
			'F',
			'G'
		]);
	});
});

describe('getMajorScaleByKey', () => {
	it('returns the C major scale', () => {
		expect(getMajorScaleByKey('C')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
	});

	it('returns the G major scale with an F#', () => {
		expect(getMajorScaleByKey('G')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
	});

	it('returns the F major scale with a Bb', () => {
		expect(getMajorScaleByKey('F')).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E']);
	});
});

describe('getScaleWithDegrees', () => {
	it('annotates each degree', () => {
		const degrees = getScaleWithDegrees('C');
		expect(degrees).toHaveLength(7);
		expect(degrees[0]).toEqual({ note: 'C', degree: 1, function: 'Tonic' });
		expect(degrees[4]).toEqual({ note: 'G', degree: 5, function: 'Dominant' });
		expect(degrees[6]).toEqual({ note: 'B', degree: 7, function: 'Leading Tone' });
	});

	it('throws for an unknown scale type', () => {
		expect(() => getScaleWithDegrees('C', 'unknown' as never)).toThrow('Unknown scale type');
	});
});

describe('getScaleChords', () => {
	it('returns the seven diatonic chords of C major', () => {
		const result = getScaleChords('C');
		expect(result).toHaveLength(7);
		expect(result[0].root).toBe('C');
		expect(result[0].type).toBe('Major');
		expect(result[1].root).toBe('D');
		expect(result[1].type).toBe('Minor');
		expect(result[6].root).toBe('B');
		expect(result[6].type).toBe('Diminished');
	});
});

describe('generateChord', () => {
	it('builds a major triad', () => {
		expect(generateChord('C', chords.major)).toEqual(['C', 'E', 'G']);
	});

	it('builds a minor triad', () => {
		expect(generateChord('A', chords.minor)).toEqual(['A', 'C', 'E']);
	});
});

describe('getChordInversion', () => {
	const chord = ['C', 'E', 'G'];

	it('returns the chord unchanged for inversion 0', () => {
		expect(getChordInversion(chord, 0)).toEqual(chord);
	});

	it('rotates the chord for each inversion step', () => {
		expect(getChordInversion(chord, 1)).toEqual(['E', 'G', 'C']);
		expect(getChordInversion(chord, 2)).toEqual(['G', 'C', 'E']);
	});

	it('does not mutate the original chord', () => {
		getChordInversion(chord, 1);
		expect(chord).toEqual(['C', 'E', 'G']);
	});
});

describe('getChordProgressionInKey', () => {
	it('returns I-IV-V in C major', () => {
		const progression = getChordProgressionInKey('C', [1, 4, 5]);
		expect(progression.map((c) => c.root)).toEqual(['C', 'F', 'G']);
		expect(progression.every((c) => c.type === 'Major')).toBe(true);
	});

	it('returns a minor ii chord', () => {
		const progression = getChordProgressionInKey('C', [2]);
		expect(progression[0].root).toBe('D');
		expect(progression[0].type).toBe('Minor');
	});
});

describe('getChordName', () => {
	it('names major and minor chords', () => {
		expect(getChordName('C', 'major')).toBe('C');
		expect(getChordName('C', 'minor')).toBe('Cm');
		expect(getChordName('D', 'dominant7')).toBe('D7');
	});

	it('throws for an unknown chord type', () => {
		expect(() => getChordName('C', 'unknown')).toThrow('Unknown chord type');
	});
});
