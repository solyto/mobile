// $lib/helpers/music/TheoryConstants.ts
import type { Interval, Scale, Chord } from '$lib/types/music_theory';

export const intervals: Record<string, Interval> = {
	unison: { semitones: 0, degree: 1, quality: 'perfect', name: 'Unison', shortName: 'P1' },
	minorSecond: {
		semitones: 1,
		degree: 2,
		quality: 'minor',
		name: 'Minor Second',
		shortName: 'm2'
	},
	majorSecond: {
		semitones: 2,
		degree: 2,
		quality: 'major',
		name: 'Major Second',
		shortName: 'M2'
	},
	minorThird: { semitones: 3, degree: 3, quality: 'minor', name: 'Minor Third', shortName: 'm3' },
	majorThird: { semitones: 4, degree: 3, quality: 'major', name: 'Major Third', shortName: 'M3' },
	perfectFourth: {
		semitones: 5,
		degree: 4,
		quality: 'perfect',
		name: 'Perfect Fourth',
		shortName: 'P4'
	},
	tritone: { semitones: 6, degree: 4, quality: 'augmented', name: 'Tritone', shortName: 'A4' },
	perfectFifth: {
		semitones: 7,
		degree: 5,
		quality: 'perfect',
		name: 'Perfect Fifth',
		shortName: 'P5'
	},
	minorSixth: { semitones: 8, degree: 6, quality: 'minor', name: 'Minor Sixth', shortName: 'm6' },
	majorSixth: { semitones: 9, degree: 6, quality: 'major', name: 'Major Sixth', shortName: 'M6' },
	minorSeventh: {
		semitones: 10,
		degree: 7,
		quality: 'minor',
		name: 'Minor Seventh',
		shortName: 'm7'
	},
	majorSeventh: {
		semitones: 11,
		degree: 7,
		quality: 'major',
		name: 'Major Seventh',
		shortName: 'M7'
	},
	octave: { semitones: 12, degree: 8, quality: 'perfect', name: 'Octave', shortName: 'P8' }
};

export const scales: Record<string, Scale> = {
	major: {
		name: 'Major',
		pattern: [2, 2, 1, 2, 2, 2, 1], // Whole, Whole, Half, Whole, Whole, Whole, Half
		degrees: 7
	},
	naturalMinor: {
		name: 'Natural Minor',
		pattern: [2, 1, 2, 2, 1, 2, 2],
		degrees: 7
	},
	harmonicMinor: {
		name: 'Harmonic Minor',
		pattern: [2, 1, 2, 2, 1, 3, 1],
		degrees: 7
	},
	melodicMinor: {
		name: 'Melodic Minor',
		pattern: [2, 1, 2, 2, 2, 2, 1],
		degrees: 7
	},
	pentatonicMajor: {
		name: 'Pentatonic Major',
		pattern: [2, 2, 3, 2, 3],
		degrees: 5
	},
	pentatonicMinor: {
		name: 'Pentatonic Minor',
		pattern: [3, 2, 2, 3, 2],
		degrees: 5
	}
	// Add more scales as needed
};

export const chords: Record<string, Chord> = {
	major: {
		name: 'Major',
		symbol: '',
		intervals: [0, 4, 7] // Root, Major 3rd, Perfect 5th
	},
	minor: {
		name: 'Minor',
		symbol: 'm',
		intervals: [0, 3, 7] // Root, Minor 3rd, Perfect 5th
	},
	diminished: {
		name: 'Diminished',
		symbol: 'dim',
		intervals: [0, 3, 6] // Root, Minor 3rd, Diminished 5th
	},
	augmented: {
		name: 'Augmented',
		symbol: 'aug',
		intervals: [0, 4, 8] // Root, Major 3rd, Augmented 5th
	},
	dominant7: {
		name: 'Dominant 7th',
		symbol: '7',
		intervals: [0, 4, 7, 10] // Root, Major 3rd, Perfect 5th, Minor 7th
	},
	major7: {
		name: 'Major 7th',
		symbol: 'maj7',
		intervals: [0, 4, 7, 11] // Root, Major 3rd, Perfect 5th, Major 7th
	},
	minor7: {
		name: 'Minor 7th',
		symbol: 'm7',
		intervals: [0, 3, 7, 10] // Root, Minor 3rd, Perfect 5th, Minor 7th
	}
	// Add more chord types as needed
};

// Common patterns and sequences
export const majorScaleSemitones: number[] = [2, 2, 1, 2, 2, 2, 1];
export const naturalMinorScaleSemitones: number[] = [2, 1, 2, 2, 1, 2, 2];
