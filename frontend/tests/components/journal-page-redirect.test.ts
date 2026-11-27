import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setNotes } from '$lib/state/Notes.svelte';
import { renderWithContext } from './helpers/context';
import StoreHarness from './helpers/StoreHarness.svelte';
import JournalPage from '../../src/routes/notes/journal/[date]/+page.svelte';

const page = vi.hoisted(() => ({ params: { date: '' } }));
const goto = vi.hoisted(() => vi.fn());
vi.mock('$app/state', () => ({ page }));
vi.mock('$app/navigation', () => ({ afterNavigate: (callback: () => void) => callback(), goto }));

function openJournalDay(date: string): void {
	page.params.date = date;
	renderWithContext(StoreHarness, { component: JournalPage, provide: setNotes });
}

beforeEach(() => {
	goto.mockClear();
	vi.useFakeTimers({ toFake: ['Date'] });
	vi.setSystemTime(new Date(2026, 10, 23));
});

afterEach(() => {
	vi.useRealTimers();
});

describe('Journal page', () => {
	it('opens today instead of a broken date, replacing it in the history', () => {
		openJournalDay('not-a-date');

		expect(goto).toHaveBeenCalledWith(expect.stringMatching(/\/notes\/journal\/2026-11-23$/), { replaceState: true });
	});

	it('opens today instead of a future date, replacing it in the history', () => {
		openJournalDay('2026-11-24');

		expect(goto).toHaveBeenCalledWith(expect.stringMatching(/\/notes\/journal\/2026-11-23$/), { replaceState: true });
	});

	it.each(['2026-11-23', '2026-11-22'])('stays on %s', (date) => {
		openJournalDay(date);

		expect(goto).not.toHaveBeenCalled();
	});
});
