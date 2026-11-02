import { describe, it, expect, vi } from 'vitest';
import { renderWithContext } from './helpers/context';
import JournalArchivePicker from '$lib/components/notes/journal/JournalArchivePicker.svelte';

// 1 March 2026 is a Sunday, so the week start decides whether it opens the first row.
const props = { selectedDate: new Date(2026, 2, 15), markedDates: [], onSelect: vi.fn() };

function renderPicker(weekStart: 'monday' | 'sunday') {
	const { container } = renderWithContext(JournalArchivePicker, props, {
		stores: { auth: { user: { settings: { week_start: weekStart } } } }
	});
	const cells = Array.from(container.querySelector('.grid-cols-7')!.children);

	return {
		weekdays: cells.slice(0, 7).map((cell) => cell.textContent?.trim()),
		blanksBeforeFirst: cells.slice(7).findIndex((cell) => cell.textContent?.trim() === '1')
	};
}

describe('JournalArchivePicker', () => {
	it('starts the week on Monday by default', () => {
		const { weekdays, blanksBeforeFirst } = renderPicker('monday');

		expect(weekdays).toEqual(['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
		expect(blanksBeforeFirst).toBe(6);
	});

	it('starts the week on Sunday when the user chose it', () => {
		const { weekdays, blanksBeforeFirst } = renderPicker('sunday');

		expect(weekdays).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
		expect(blanksBeforeFirst).toBe(0);
	});
});
