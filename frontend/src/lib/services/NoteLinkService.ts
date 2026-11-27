import type { Note } from '$lib/types/note';
import { urls } from '$lib/config/urls';

const NOTE_PATH = /^(?:[a-z][a-z\d+.-]*:\/\/[^/?#]+)?\/notes\/([\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12})\/?(?:[?#]|$)/i;

export default class NoteLinkService {
	noteIdFromHref(href: string): string | null {
		return NOTE_PATH.exec(href.trim())?.[1].toLowerCase() ?? null;
	}

	hrefForNote(note: Note): string {
		return urls.note.replace('[id]', note.id);
	}

	searchByTitle(notes: Note[], term: string, limit: number): Note[] {
		const needle = term.trim().toLowerCase();
		const matches = needle === '' ? notes : notes.filter((note) => note.title.toLowerCase().includes(needle));

		return matches.slice(0, limit);
	}
}
