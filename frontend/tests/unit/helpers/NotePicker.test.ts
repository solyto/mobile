import { describe, it, expect, vi } from 'vitest';
import { NotePicker } from '$lib/helpers/NotePicker.svelte';
import { note } from './factories';

const alpha = note({ id: 'a', title: 'Alpha' });
const beta = note({ id: 'b', title: 'Beta' });

function picker(): NotePicker {
	return new NotePicker((term) => [alpha, beta].filter((n) => n.title.toLowerCase().includes(term.toLowerCase())));
}

describe('NotePicker', () => {
	it('starts empty until the first search', () => {
		const p = picker();

		expect(p.results).toEqual([]);
		expect(p.selected()).toBeUndefined();
	});

	it('search takes a term, fills the results and selects the first', () => {
		const p = picker();
		p.search('');
		p.move(1);

		p.search('al');

		expect(p.term).toBe('al');
		expect(p.results).toEqual([alpha]);
		expect(p.selected()).toBe(alpha);
	});

	it('search without an argument uses the bound term', () => {
		const searchNotes = vi.fn().mockReturnValue([beta]);
		const p = new NotePicker(searchNotes);
		p.term = 'be';

		p.search();

		expect(searchNotes).toHaveBeenCalledWith('be');
		expect(p.results).toEqual([beta]);
	});

	it('move keeps the selection inside the results', () => {
		const p = picker();
		p.search('');

		p.move(1);
		expect(p.selected()).toBe(beta);
		p.move(1);
		expect(p.selected()).toBe(beta);
		p.move(-5);
		expect(p.selected()).toBe(alpha);
	});

	it('move on empty results stays at the start', () => {
		const p = picker();
		p.search('zzz');

		p.move(1);

		expect(p.index).toBe(0);
		expect(p.selected()).toBeUndefined();
	});
});
