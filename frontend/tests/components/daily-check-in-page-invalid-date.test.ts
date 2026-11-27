import { describe, it, expect, vi, afterEach } from 'vitest';
import ApiService from '$lib/services/ApiService';
import { renderWithContext } from './helpers/context';
import DailyCheckInPageHarness from './helpers/DailyCheckInPageHarness.svelte';

const goto = vi.hoisted(() => vi.fn());
vi.mock('$app/state', () => ({ page: { params: { date: 'not-a-date' } } }));
vi.mock('$app/navigation', () => ({ afterNavigate: (callback: () => void) => callback(), goto }));

afterEach(() => {
	vi.useRealTimers();
});

describe('Daily check-in page with a broken date in the link', () => {
	it('opens today instead, replacing the broken entry in the history', () => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date(2026, 10, 23));
		const list = vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({ data: [] });

		renderWithContext(DailyCheckInPageHarness, { trackers: [], onReady: () => {} });

		expect(goto).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/date\/2026-11-23$/), { replaceState: true });
		expect(list).not.toHaveBeenCalled();
	});
});
