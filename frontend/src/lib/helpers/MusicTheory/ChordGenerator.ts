// $lib/helpers/music/ChordGenerator.ts
import type { Chord, ProgressionChord } from '$lib/types/music_theory';
import { noteToSemitone, semitoneToNote, shouldUseFlats } from './NoteOperations';
import { chords } from './TheoryConstants';
import { generateScale } from './ScaleGenerator';
import { scales } from './TheoryConstants';

export function generateChord(rootNote: string, chord: Chord, useFlats = false): string[] {
	const rootSemitone = noteToSemitone(rootNote);

	return chord.intervals.map((interval) => {
		const noteSemitone = (rootSemitone + interval) % 12;
		return semitoneToNote(noteSemitone, useFlats);
	});
}

export function getChordInversion(chord: string[], inversion: number): string[] {
	if (inversion === 0) return chord;

	const result = [...chord];
	for (let i = 0; i < inversion; i++) {
		// Move the first note to the end, one octave higher
		const firstNote = result.shift()!;
		result.push(firstNote);
	}
	return result;
}

export function getChordProgressionInKey(key: string, progression: number[]): ProgressionChord[] {
	const scale = generateScale(key, scales.major, shouldUseFlats(key));
	const chordTypes = [
		chords.major, // I   - Major
		chords.minor, // ii  - Minor
		chords.minor, // iii - Minor
		chords.major, // IV  - Major
		chords.major, // V   - Major (could be dominant7)
		chords.minor, // vi  - Minor
		chords.diminished // vii° - Diminished
	];

	return progression.map((degree) => {
		const rootNote = scale[(degree - 1) % 7];
		const chordType = chordTypes[(degree - 1) % 7];
		return {
			root: rootNote,
			notes: generateChord(rootNote, chordType, shouldUseFlats(key)),
			type: chordType.name,
			degree: degree
		};
	});
}

export function getChordName(rootNote: string, chordType: string): string {
	const chord = chords[chordType];
	if (!chord) {
		throw new Error(`Unknown chord type: ${chordType}`);
	}

	return `${rootNote}${chord.symbol}`;
}
