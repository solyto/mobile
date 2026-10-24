// $lib/helpers/MusicTheoryHelper.ts
// This file serves as a simplified facade to the more detailed modules

import {
	noteToSemitone,
	semitoneToNote,
	getEnharmonic,
	transposeNote,
	shouldUseFlats,
	notesSharp,
	notesFlat,
	findRelativeMajor // Import the new function
} from './MusicTheory/NoteOperations';

import {
	intervals,
	scales,
	chords,
	majorScaleSemitones,
	naturalMinorScaleSemitones
} from './MusicTheory/TheoryConstants';

import {
	generateScale,
	getMajorScaleByKey,
	getScaleWithDegrees,
	findRelativeMinor, // Import the new function
	getScaleChords // Import the new function
} from './MusicTheory/ScaleGenerator';

import {
	generateChord,
	getChordInversion,
	getChordProgressionInKey,
	getChordName
} from './MusicTheory/ChordGenerator';

// Re-export everything for backwards compatibility
export {
	// Note operations
	noteToSemitone,
	semitoneToNote,
	getEnharmonic,
	transposeNote,
	shouldUseFlats,
	notesSharp,
	notesFlat,
	findRelativeMajor, // Export the new function

	// Constants
	intervals,
	scales,
	chords,
	majorScaleSemitones,
	naturalMinorScaleSemitones,

	// Scale functions
	generateScale,
	getMajorScaleByKey,
	getScaleWithDegrees,
	findRelativeMinor, // Export the new function
	getScaleChords, // Export the new function

	// Chord functions
	generateChord,
	getChordInversion,
	getChordProgressionInKey,
	getChordName
};
