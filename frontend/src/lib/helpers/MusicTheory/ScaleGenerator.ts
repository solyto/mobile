// $lib/helpers/music/ScaleGenerator.ts
import type { Scale, ScaleNote, ProgressionChord } from '$lib/types/music_theory';
import { noteToSemitone, semitoneToNote, shouldUseFlats } from './NoteOperations';
import { scales, majorScaleSemitones } from './TheoryConstants';
import { notesSharp, notesFlat } from './NoteOperations';
import { getChordProgressionInKey } from './ChordGenerator';

export function generateScale(rootNote: string, scale: Scale, useFlats = false): string[] {
	const rootSemitone = noteToSemitone(rootNote);
	const notes: string[] = [rootNote];
	let currentSemitone = rootSemitone;

	for (let i = 0; i < scale.pattern.length - 1; i++) {
		currentSemitone = (currentSemitone + scale.pattern[i]) % 12;
		notes.push(semitoneToNote(currentSemitone, useFlats));
	}

	return notes;
}

export function getMajorScaleByKey(key: string = 'C'): string[] {
	// Make sure we can handle the key
	const rootSemitone = noteToSemitone(key);
	if (rootSemitone === undefined) {
		throw new Error(`Invalid key: ${key}`);
	}

	const useFlats = shouldUseFlats(key);
	const notes = useFlats ? notesFlat : notesSharp;

	// Find the index in our notes array
	let rootIndex = notes.indexOf(key);
	if (rootIndex === -1) {
		// If the key isn't directly in our array (like 'E#'), convert it to its enharmonic equivalent
		const enharmonic = semitoneToNote(rootSemitone, useFlats);
		rootIndex = notes.indexOf(enharmonic);

		// If we still can't find it, throw an error
		if (rootIndex === -1) {
			throw new Error(`Couldn't determine scale for key: ${key}`);
		}
	}

	const result: string[] = [];
	let currentIndex = rootIndex;

	// Add the root note
	result.push(notes[currentIndex]);

	// Add the rest of the scale according to the major scale pattern
	for (let i = 0; i < majorScaleSemitones.length - 1; i++) {
		currentIndex = (currentIndex + majorScaleSemitones[i]) % 12;
		result.push(notes[currentIndex]);
	}

	return result;
}

export function getScaleWithDegrees(rootNote: string, scaleType: string = 'major'): ScaleNote[] {
	const scale = scales[scaleType];
	if (!scale) {
		throw new Error(`Unknown scale type: ${scaleType}`);
	}

	const useFlats = shouldUseFlats(rootNote);
	const scaleNotes = generateScale(rootNote, scale, useFlats);

	return scaleNotes.map((note, index) => ({
		note,
		degree: index + 1,
		// Optional: add functional harmony descriptions
		function: getFunctionForDegree(index + 1, scaleType)
	}));
}

function getFunctionForDegree(degree: number, scaleType: string): string {
	if (scaleType === 'major') {
		const functions = [
			'Tonic',
			'Supertonic',
			'Mediant',
			'Subdominant',
			'Dominant',
			'Submediant',
			'Leading Tone'
		];
		return functions[(degree - 1) % 7];
	}

	if (scaleType === 'naturalMinor') {
		const functions = [
			'Tonic',
			'Supertonic',
			'Mediant',
			'Subdominant',
			'Dominant',
			'Submediant',
			'Subtonic'
		];
		return functions[(degree - 1) % 7];
	}

	return '';
}

/**
 * Find the relative minor key for a given major key
 * @param majorKey The major key (e.g. 'C', 'G')
 * @returns The relative minor key (e.g. 'A', 'E')
 */
export function findRelativeMinor(majorKey: string): string {
	// For keys with sharps or flats, we need to get the scale
	// and find the 6th degree (relative minor)
	try {
		const scale = getMajorScaleByKey(majorKey);
		return scale[5]; // 6th degree of the major scale
	} catch (error) {
		// Fallback method in case getMajorScaleByKey fails
		// The relative minor is always 3 semitones (minor third) below the major
		const majorKeyIndex = noteToSemitone(majorKey);
		if (majorKeyIndex === undefined) {
			throw new Error(`Invalid key: ${majorKey}`);
		}

		// Calculate the index of the relative minor (3 semitones below)
		// Add 12 before modulo to ensure positive result
		const minorKeyIndex = (majorKeyIndex + 9) % 12;

		// Determine if we should use flats based on the major key
		const useFlats = shouldUseFlats(majorKey);

		return semitoneToNote(minorKeyIndex, useFlats);
	}
}

/**
 * Find the relative major key for a given minor key
 * @param minorKey The minor key (e.g. 'A', 'E')
 * @returns The relative major key (e.g. 'C', 'G')
 */
export function findRelativeMajor(minorKey: string): string {
	// The relative major is always 3 semitones (minor third) above the minor
	const minorKeyIndex = noteToSemitone(minorKey);
	if (minorKeyIndex === undefined) {
		throw new Error(`Invalid key: ${minorKey}`);
	}

	// Calculate the index of the relative major (3 semitones above)
	const majorKeyIndex = (minorKeyIndex + 3) % 12;

	// Determine if we should use flats based on the minor key
	// For minor keys, this typically follows the same pattern as major keys
	const useFlats = shouldUseFlats(minorKey);

	return semitoneToNote(majorKeyIndex, useFlats);
}

/**
 * Get all chords that naturally occur in the given key
 * @param key The key to get chords for
 * @returns An array of chord objects
 */
export function getScaleChords(key: string): ProgressionChord[] {
	const degrees = Array.from({ length: 7 }, (_, i) => i + 1);
	return getChordProgressionInKey(key, degrees);
}
