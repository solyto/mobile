import type { Note } from '$lib/types/note';

const ENTITIES: Record<string, string> = {
	'&nbsp;': ' ',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
	'&amp;': '&'
};

export default class NoteSearchService {
	search(notes: Note[], term: string, limit: number): Note[] {
		const needle = term.trim().toLowerCase();
		if (needle === '') return [];

		const titleMatches = notes.filter((note) => note.title.toLowerCase().includes(needle));
		const contentMatches = notes.filter((note) => {
			return !titleMatches.includes(note) && this.toPlainText(note.content).toLowerCase().includes(needle);
		});

		return [...titleMatches, ...contentMatches].slice(0, limit);
	}

	toPlainText(html: string): string {
		return html
			.replace(/<[^>]+>/g, ' ')
			.replace(/&(nbsp|lt|gt|quot|#39|amp);/gi, (entity) => ENTITIES[entity.toLowerCase()]);
	}
}
