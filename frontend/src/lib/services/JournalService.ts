import type { Note, NoteCategory } from '$lib/types/note';
import { getUrlFormat } from '$lib/helpers/DateHelper';

const ENTRY_TITLE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default class JournalService {
	findJournalCategory(categories: NoteCategory[]): NoteCategory | null {
		for (const category of categories) {
			if (category.is_system) return category;
			if (category.children) {
				const child = category.children.find((c) => c.is_system);
				if (child) return child;
			}
		}

		return null;
	}

	mergeCategories(visible: NoteCategory[], hidden: NoteCategory[]): NoteCategory[] {
		const merged = this.cloneCategories(visible);

		for (const category of hidden) {
			const parent = category.parent_id === null ? null : this.findCategory(merged, category.parent_id);
			if (parent) {
				parent.children.push(category);
			} else {
				merged.push(category);
			}
		}

		return merged;
	}

	private cloneCategories(categories: NoteCategory[]): NoteCategory[] {
		return categories.map((category) => ({
			...category,
			children: this.cloneCategories(category.children ?? [])
		}));
	}

	private findCategory(categories: NoteCategory[], id: number): NoteCategory | null {
		for (const category of categories) {
			if (category.id === id) return category;
			const child = this.findCategory(category.children ?? [], id);
			if (child) return child;
		}

		return null;
	}

	getEntryTitle(date: Date): string {
		return getUrlFormat(date);
	}

	isEntryTitle(title: string): boolean {
		return ENTRY_TITLE_PATTERN.test(title);
	}

	parseEntryTitle(title: string): Date | null {
		if (!this.isEntryTitle(title)) return null;

		const [year, month, day] = title.split('-').map(Number);

		return new Date(year, month - 1, day);
	}

	findEntry(notes: Note[], categoryId: number, date: Date): Note | null {
		const title = this.getEntryTitle(date);
		return (
			notes.find((note) => note.category_id === categoryId && note.title === title) ?? null
		);
	}

	getEntryDates(notes: Note[], categoryId: number): string[] {
		return notes
			.filter((note) => note.category_id === categoryId && this.isEntryTitle(note.title))
			.map((note) => note.title);
	}

	isReachable(date: Date, today: Date = new Date()): boolean {
		return getUrlFormat(date) <= getUrlFormat(today);
	}

	hasContent(html: string): boolean {
		const stripped = html
			.replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, '')
			.replace(/<[^>]+>/g, '')
			.replace(/&nbsp;/gi, ' ')
			.trim();

		return stripped !== '' || /<(img|hr|table|video|audio|iframe)\b/i.test(html);
	}
}
