import { describe, it, expect, beforeEach } from 'vitest';
import { TimeTracking } from '$lib/state/TimeTracking.svelte';
import { api, resetStoreMocks } from '../setup/storeMocks';

beforeEach(() => {
	resetStoreMocks();
});

function entry(id: string, stopped_at: string | null) {
	return { id, stopped_at } as never;
}

describe('TimeTracking store', () => {
	it('loads categories, projects and entries in parallel', async () => {
		api.list.mockImplementation(async (endpoint: string) => {
			if (endpoint.includes('categories')) return { data: [{ id: 1 }] };
			if (endpoint.includes('projects')) return { data: [{ id: 1 }] };
			return { data: [entry('1', null), entry('2', '2025-08-15')] };
		});

		const t = new TimeTracking();
		await t.load();

		expect(t.loaded).toBe(true);
		expect(t.categories).toHaveLength(1);
		expect(t.projects).toHaveLength(1);
		expect(t.entries).toHaveLength(2);
		expect(t.activeTimer?.id).toBe('1');
	});

	it('finds no active timer when every entry is stopped', async () => {
		api.list.mockImplementation(async (endpoint: string) => {
			if (endpoint.includes('entries')) return { data: [entry('1', '2025-08-15')] };
			return { data: [] };
		});

		const t = new TimeTracking();
		await t.loadEntries();
		expect(t.activeTimer).toBeNull();
	});

	it('starts a timer and reloads entries', async () => {
		api.post.mockResolvedValue({ data: {} });
		api.list.mockResolvedValue({ data: [] });

		const t = new TimeTracking();
		await t.startTimer({ project_id: '1' });

		expect(api.post).toHaveBeenCalled();
		expect(api.list).toHaveBeenCalled();
	});

	it('sends selected statistics categories as one comma-separated parameter', async () => {
		api.list.mockResolvedValue({ data: {} });

		const t = new TimeTracking();
		await t.loadStatistics('2026-09-16', '2026-10-16', [3, 7]);
		await t.loadStatistics('2026-09-16', '2026-10-16');

		expect(api.list.mock.calls[0][0]).toMatch(/\?from=2026-09-16&to=2026-10-16&category_ids=3,7$/);
		expect(api.list.mock.calls[1][0]).toMatch(/\?from=2026-09-16&to=2026-10-16$/);
	});

	describe('formatDuration', () => {
		it('formats minutes only below an hour', () => {
			expect(new TimeTracking().formatDuration(0)).toBe('0m');
			expect(new TimeTracking().formatDuration(45)).toBe('45m');
		});

		it('formats hours and minutes', () => {
			expect(new TimeTracking().formatDuration(60)).toBe('1h 0m');
			expect(new TimeTracking().formatDuration(125)).toBe('2h 5m');
		});
	});
});
