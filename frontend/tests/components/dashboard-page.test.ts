import { describe, it, expect, vi, afterEach } from 'vitest';
import { waitFor } from '@testing-library/svelte';
import ApiService from '$lib/services/ApiService';
import { renderWithContext } from './helpers/context';
import DashboardPageHarness from './helpers/DashboardPageHarness.svelte';

const stub = vi.hoisted(() => async () => ({ default: (await import('$lib/icons/lucide/plus.svelte')).default }));

vi.mock('$lib/components/dashboard/YourDay.svelte', stub);
vi.mock('$lib/components/dashboard/Inspiration.svelte', stub);
vi.mock('$lib/components/dashboard/QuickGlance.svelte', stub);

afterEach(() => {
	vi.useRealTimers();
});

describe('Dashboard page', () => {
	it('loads the trackers once, 30 days of values, the goals and no check-in settings', async () => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(new Date(2026, 10, 20));
		const list = vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({ data: [] });
		const get = vi.spyOn(ApiService.prototype, 'get').mockResolvedValue(null);

		renderWithContext(DashboardPageHarness, { checkIn: true });

		const listed = (pattern: RegExp) => list.mock.calls.filter(([url]) => pattern.test(url));
		await waitFor(() => expect(listed(/\/goals$/)).toHaveLength(1));
		expect(listed(/\/check-in\/trackers$/)).toHaveLength(1);
		expect(listed(/\/check-in\/values/).map(([url]) => url)).toEqual([expect.stringMatching(/\/check-in\/values\?from=2026-10-21$/)]);
		expect(get.mock.calls.filter(([url]) => url.includes('/settings/check-in'))).toEqual([]);
	});

	it('loads no check-in data while check-in is off', async () => {
		const list = vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({ data: [] });
		vi.spyOn(ApiService.prototype, 'get').mockResolvedValue(null);

		renderWithContext(DashboardPageHarness, { checkIn: false });

		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(list.mock.calls.filter(([url]) => /\/(goals|check-in)/.test(url))).toEqual([]);
	});
});
