import type { Note } from '$lib/types/note';

export class NotePicker {
	term = $state<string>('');
	results = $state<Note[]>([]);
	index = $state<number>(0);

	private readonly searchNotes: (term: string) => Note[];

	constructor(searchNotes: (term: string) => Note[]) {
		this.searchNotes = searchNotes;
	}

	search(term: string = this.term): void {
		this.term = term;
		this.results = this.searchNotes(term);
		this.index = 0;
	}

	move(delta: number): void {
		const last = Math.max(this.results.length - 1, 0);
		this.index = Math.min(Math.max(this.index + delta, 0), last);
	}

	selected(): Note | undefined {
		return this.results[this.index];
	}
}
