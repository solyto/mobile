import { describe, it, expect, beforeEach } from 'vitest';
import { Alerts } from '$lib/state/Alerts.svelte';
import { api, resetStoreMocks } from '../setup/storeMocks';
import type { Alert, AlertSuggestion } from '$lib/types/alert';

const alert: Alert = {
	id: 7,
	source: 'check_in_tracker',
	check_in_tracker_id: 2,
	goal_id: null,
	rule: 'no_entry_days',
	threshold: null,
	days: 7,
	enabled: true,
	suggestion: null,
	last_triggered_on: null,
	state: { active: false, average: null, streak: 0, last_entry: null }
};

const suggestion: AlertSuggestion = { key: 'no_sport_week', check_in_tracker_id: 2, rule: 'no_entry_days', threshold: null, days: 7 };

beforeEach(() => {
	resetStoreMocks();
});

describe('Alerts store', () => {
	it('loads the alerts and suggestions', async () => {
		api.list.mockImplementation(async (url: string) => (url.endsWith('/suggestions') ? { data: [suggestion] } : { data: [alert] }));
		const s = new Alerts();

		await s.load();

		expect(s.loaded).toBe(true);
		expect(s.alerts).toEqual([alert]);
		expect(s.suggestions).toEqual([suggestion]);
	});

	it('creates, updates, deletes and takes suggestions on their URLs, then reloads', async () => {
		api.create.mockResolvedValue({ data: alert });
		api.put.mockResolvedValue(true);
		api.delete.mockResolvedValue(true);
		api.list.mockResolvedValue({ data: [] });
		const s = new Alerts();
		const request = { source: 'check_in_tracker', check_in_tracker_id: 2, rule: 'average_below', threshold: 3, days: 7 } as const;

		expect(await s.create(request)).toBe(true);
		expect(await s.update(alert, { enabled: false })).toBe(true);
		expect(await s.delete(alert)).toBe(true);
		expect(await s.enableSuggestion('no_sport_week')).toBe(true);

		expect(api.create).toHaveBeenCalledWith(expect.stringMatching(/\/alerts$/), request);
		expect(api.put).toHaveBeenCalledWith(expect.stringMatching(/\/alerts\/7$/), { enabled: false });
		expect(api.delete).toHaveBeenCalledWith(expect.stringMatching(/\/alerts\/%d$/), 7);
		expect(api.create).toHaveBeenCalledWith(expect.stringMatching(/\/alerts\/suggestions\/no_sport_week$/), {});
		expect(api.list).toHaveBeenCalledTimes(8);
	});

	it('does not reload when a change is rejected', async () => {
		api.create.mockResolvedValue(null);
		const s = new Alerts();

		expect(await s.enableSuggestion('no_sport_week')).toBe(false);
		expect(api.list).not.toHaveBeenCalled();
	});
});
