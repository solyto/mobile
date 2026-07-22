export type QuickAddContentType =
	| 'music'
	| 'books'
	| 'movies'
	| 'games'
	| 'links'
	| 'recipes'
	| 'plants'
	| 'quotes'
	| 'todo'
	| 'note'
	| 'feed'
	| 'clipboard';

export interface DetectionResult {
	url: string;
	content_type: QuickAddContentType;
	confidence: number;
	needs_confirmation: boolean;
	metadata: Record<string, unknown> | null;
}

export interface DetectRequest {
	url: string;
}

export const CONTENT_TYPE_LABELS: Record<QuickAddContentType, string> = {
	music: 'Music',
	books: 'Book',
	movies: 'Movie',
	games: 'Game',
	links: 'Link',
	recipes: 'Recipe',
	plants: 'Plant',
	quotes: 'Quote',
	todo: 'Todo',
	note: 'Note',
	feed: 'Feed',
	clipboard: 'Clipboard'
};
