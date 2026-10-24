// $lib/types/music_theory.ts

// Basic Types
export type Accidental = 'natural' | 'sharp' | 'flat' | 'double-sharp' | 'double-flat';
export type NoteLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type IntervalQuality = 'perfect' | 'major' | 'minor' | 'augmented' | 'diminished';

// Core Interfaces
export interface Note {
	letter: NoteLetter;
	accidental: Accidental;
	octave?: number; // Optional, for when you need absolute pitch
}

export interface Interval {
	semitones: number; // Chromatic distance (0-11)
	name: string; // e.g., "Perfect Fifth"
	shortName: string; // e.g., "P5"
	degree: number; // Scale degree (1-7)
	quality: IntervalQuality;
}

export interface Scale {
	name: string;
	pattern: number[]; // Semitone pattern
	degrees: number; // Number of notes in the scale
}

export interface Chord {
	name: string;
	symbol: string;
	intervals: number[]; // Semitones from root
}

// Additional music theory types
export interface ScaleNote {
	note: string;
	degree: number;
	function?: string; // Tonic, subdominant, dominant, etc.
}

export interface ChordNote {
	note: string;
	interval: Interval;
	function?: string; // Root, third, fifth, etc.
}

export interface ProgressionChord {
	root: string;
	notes: string[];
	type: string;
	degree?: number;
}
