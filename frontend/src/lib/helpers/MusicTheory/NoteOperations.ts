// $lib/helpers/music/NoteOperations.ts
import type { Interval } from '$lib/types/music_theory';

// Basic note arrays that can be used across the application
export const notesSharp: string[] = [
	'C',
	'C#',
	'D',
	'D#',
	'E',
	'F',
	'F#',
	'G',
	'G#',
	'A',
	'A#',
	'B'
];
export const notesFlat: string[] = [
	'C',
	'Db',
	'D',
	'Eb',
	'E',
	'F',
	'Gb',
	'G',
	'Ab',
	'A',
	'Bb',
	'B'
];

export function noteToSemitone(note: string): number {
	// Handle complex key signatures
	const noteMap: Record<string, number> = {
		// Natural notes
		C: 0,
		D: 2,
		E: 4,
		F: 5,
		G: 7,
		A: 9,
		B: 11,

		// Sharp notes
		'C#': 1,
		'D#': 3,
		'E#': 5,
		'F#': 6,
		'G#': 8,
		'A#': 10,
		'B#': 0,

		// Flat notes
		Cb: 11,
		Db: 1,
		Eb: 3,
		Fb: 4,
		Gb: 6,
		Ab: 8,
		Bb: 10,

		// Double sharp notes (rarely used but included for completeness)
		Cx: 2,
		Dx: 4,
		Ex: 6,
		Fx: 7,
		Gx: 9,
		Ax: 11,
		Bx: 1,

		// Double flat notes
		Cbb: 10,
		Dbb: 0,
		Ebb: 2,
		Fbb: 3,
		Gbb: 5,
		Abb: 7,
		Bbb: 9
	};

	const semitone = noteMap[note];
	if (semitone === undefined) {
		throw new Error(`Unknown note: ${note}`);
	}

	return semitone;
}

export function semitoneToNote(semitone: number, useFlats = false): string {
	semitone = ((semitone % 12) + 12) % 12; // Normalize to 0-11
	const notes = useFlats ? notesFlat : notesSharp;
	return notes[semitone];
}

export function getEnharmonic(note: string): string {
	const enharmonicMap: Record<string, string> = {
		'C#': 'Db',
		Db: 'C#',
		'D#': 'Eb',
		Eb: 'D#',
		'F#': 'Gb',
		Gb: 'F#',
		'G#': 'Ab',
		Ab: 'G#',
		'A#': 'Bb',
		Bb: 'A#'
	};
	return enharmonicMap[note] || note;
}

export function transposeNote(note: string, semitones: number, useFlats = false): string {
	const semitone = noteToSemitone(note);
	const newSemitone = (semitone + semitones + 12) % 12;
	return semitoneToNote(newSemitone, useFlats);
}

export function shouldUseFlats(key: string): boolean {
	// Keys that typically use flats
	const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
	return flatKeys.includes(key);
}

/**
 * Find the relative major key for a given minor key
 * @param minorKey The minor key (e.g. 'A', 'E')
 * @returns The relative major key (e.g. 'C', 'G')
 */
export function findRelativeMajor(minorKey: string): string {
	// Transpose minor key up 3 semitones (or equivalently, a minor third)
	const useFlats = shouldUseFlats(minorKey);
	return transposeNote(minorKey, 3, useFlats);
}
