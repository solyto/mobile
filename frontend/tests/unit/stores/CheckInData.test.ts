import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CheckInData } from '$lib/state/CheckInData.svelte';
import { api, auth, pageState, resetStoreMocks } from '../setup/storeMocks';
import { DEFAULT_SPORTS } from '$lib/types/check_in';
import type { CheckInTracker, CheckInValue } from '$lib/types/check_in';
import { checkInTracker, checkInValue as value } from '../helpers/factories';

const mood = checkInTracker({ key: 'mood', name: null, type: 'scale', scored: true });
const sports = checkInTracker({ id: 2, key: 'sports', name: null, type: 'sport', position: 1 });
const meditated = checkInTracker({ id: 3, position: 2 });
const glasses = checkInTracker({ id: 4, name: 'Glasses', type: 'count', position: 3, enabled: false });

function loaded({
	trackers = [mood, sports, meditated, glasses],
	values = []
}: {
	trackers?: CheckInTracker[];
	values?: CheckInValue[];
} = {}): CheckInData {
	const s = new CheckInData();
	s.trackers = trackers;
	s.values = values;
	return s;
}

beforeEach(() => {
	resetStoreMocks();
	pageState.pathname = '/check-in';
	pageState.params = {};
});

afterEach(() => {
	vi.useRealTimers();
});

describe('CheckInData store', () => {
	it('starts empty with the default sports and the current month', () => {
		const s = new CheckInData();
		const now = new Date();
		expect(s.loaded).toBe(false);
		expect(s.trackers).toEqual([]);
		expect(s.selectedSports).toEqual(DEFAULT_SPORTS);
		expect(s.historyMonth).toEqual({ year: now.getFullYear(), month: now.getMonth() });
	});

	describe('tracker groups', () => {
		it('splits the enabled trackers into ratings and logs, in order', () => {
			const s = loaded();
			expect(s.activeTrackers.map((t) => t.id)).toEqual([1, 2, 3]);
			expect(s.ratingTrackers.map((t) => t.id)).toEqual([1, 2]);
			expect(s.logTrackers.map((t) => t.id)).toEqual([3]);
		});

		it('scores only enabled 1–5 trackers that count towards the score', () => {
			const sleep = checkInTracker({ id: 5, key: 'sleep', name: null, type: 'scale' });
			const water = checkInTracker({ id: 6, key: 'water', name: null, type: 'scale', scored: true, enabled: false });
			const s = loaded({ trackers: [mood, sports, sleep, water] });
			expect(s.scoredTrackers.map((t) => t.id)).toEqual([1]);
		});
	});

	describe('values', () => {
		it('reads a tracker\'s value on a day', () => {
			const s = loaded({ values: [value(1, '2026-08-14', 4)] });
			expect(s.getValue(mood, '2026-08-14')).toBe(4);
			expect(s.getValue(mood, '2026-08-15')).toBeNull();
			expect(s.getValue(meditated, '2026-08-14')).toBeNull();
		});

		it('gives the built-in values of a day in the old one-row shape, from the page date by default', () => {
			pageState.params = { date: '2026-08-14' };
			const s = loaded({ values: [value(1, '2026-08-14', 4), value(3, '2026-08-14', 1)] });

			expect(s.getDayData()?.mood).toBe(4);
			expect(s.getDayData('2026-08-14')?.sports).toBeNull();
			expect(s.getDayData('2026-08-15')).toBeNull();
		});
	});

	describe('load', () => {
		it('loads trackers, values and the chosen sports', async () => {
			api.list.mockImplementation(async (url: string) =>
				url.endsWith('/check-in/trackers') ? { data: [mood] } : { data: [value(1, '2026-08-14', 4)] }
			);
			api.get.mockResolvedValue({ data: { enabled_trackers: ['mood'], selected_sports: ['yoga', 'bike'] } });

			const s = new CheckInData();
			await s.load();

			expect(s.loaded).toBe(true);
			expect(s.trackers).toEqual([mood]);
			expect(s.values).toEqual([value(1, '2026-08-14', 4)]);
			expect(s.selectedSports).toEqual(['yoga', 'bike']);
		});

		it('loads the values of the last twelve months', async () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date(2026, 10, 20));
			api.list.mockResolvedValue({ data: [] });

			const s = new CheckInData();
			await s.load();

			expect(api.list).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/values\?from=2025-11-01$/));
			expect(s.valuesFrom).toBe('2025-11-01');
		});

		it('stays unloaded when the trackers or values fail', async () => {
			api.list.mockImplementation(async (url: string) => (url.endsWith('/check-in/trackers') ? { data: [mood] } : null));
			api.get.mockResolvedValue(null);

			const s = new CheckInData();
			await s.load();

			expect(s.loaded).toBe(false);
			expect(s.trackers).toEqual([]);
			expect(s.selectedSports).toEqual(DEFAULT_SPORTS);
		});
	});

	describe('loadDashboard', () => {
		it('loads the trackers and the values of the last 30 days, without the settings', async () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date(2026, 10, 20));
			api.list.mockImplementation(async (url: string) =>
				url.endsWith('/check-in/trackers') ? { data: [mood] } : { data: [value(1, '2026-11-14', 4)] }
			);

			const s = new CheckInData();
			await s.loadDashboard();

			expect(api.list).toHaveBeenCalledTimes(2);
			expect(api.list).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/trackers$/));
			expect(api.list).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/values\?from=2026-10-21$/));
			expect(api.get).not.toHaveBeenCalled();
			expect(s.loaded).toBe(true);
			expect(s.trackers).toEqual([mood]);
			expect(s.values).toEqual([value(1, '2026-11-14', 4)]);
			expect(s.valuesFrom).toBe('2026-10-21');
		});

		it('stays unloaded when the trackers fail', async () => {
			api.list.mockImplementation(async (url: string) => (url.endsWith('/check-in/trackers') ? null : { data: [value(1, '2026-11-14', 4)] }));

			const s = new CheckInData();
			await s.loadDashboard();

			expect(s.loaded).toBe(false);
			expect(s.values).toEqual([]);
		});

		it('stays unloaded when the values fail', async () => {
			api.list.mockImplementation(async (url: string) => (url.endsWith('/check-in/trackers') ? { data: [mood] } : null));

			const s = new CheckInData();
			const valuesFrom = s.valuesFrom;
			await s.loadDashboard();

			expect(s.loaded).toBe(false);
			expect(s.trackers).toEqual([]);
			expect(s.valuesFrom).toBe(valuesFrom);
		});
	});

	describe('loadValuesFrom', () => {
		it('loads only the missing older values and puts them first', async () => {
			const s = loaded({ values: [value(1, '2026-01-10', 4)] });
			s.valuesFrom = '2026-01-01';
			api.list.mockResolvedValue({ data: [value(1, '2025-12-05', 2)] });

			await s.loadValuesFrom('2025-12-01');

			expect(api.list).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/values\?from=2025-12-01&to=2025-12-31$/));
			expect(s.values).toEqual([value(1, '2025-12-05', 2), value(1, '2026-01-10', 4)]);
			expect(s.valuesFrom).toBe('2025-12-01');
		});

		it('loads everything before the loaded months for null', async () => {
			const s = loaded();
			s.valuesFrom = '2026-01-01';
			api.list.mockResolvedValue({ data: [] });

			await s.loadValuesFrom(null);

			expect(api.list).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/values\?to=2025-12-31$/));
			expect(s.valuesFrom).toBeNull();
		});

		it('does nothing when the values are already there', async () => {
			const s = loaded();
			s.valuesFrom = '2026-01-01';

			await s.loadValuesFrom('2026-03-01');
			s.valuesFrom = null;
			await s.loadValuesFrom('2020-01-01');

			expect(api.list).not.toHaveBeenCalled();
		});

		it('keeps the loaded range when loading fails', async () => {
			const s = loaded();
			s.valuesFrom = '2026-01-01';
			api.list.mockResolvedValue(null);

			await s.loadValuesFrom('2025-01-01');

			expect(s.valuesFrom).toBe('2026-01-01');
		});
	});

	describe('saveDay', () => {
		it('saves every change of the day in one request and tells the widgets', async () => {
			api.put.mockResolvedValue(true);
			const s = loaded({ values: [value(3, '2026-08-14', 1), value(1, '2026-08-14', 2)] });

			const ok = await s.saveDay('2026-08-14', new Map([[glasses, 3], [meditated, null], [mood, 4]]));

			expect(ok).toBe(true);
			expect(api.put).toHaveBeenCalledTimes(1);
			expect(api.put).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/values$/), {
				date: '2026-08-14',
				values: [
					{ tracker_id: 4, value: 3 },
					{ tracker_id: 3, value: null },
					{ tracker_id: 1, value: 4 }
				]
			});
			expect(s.getValue(glasses, '2026-08-14')).toBe(3);
			expect(s.getValue(meditated, '2026-08-14')).toBeNull();
			expect(s.getValue(mood, '2026-08-14')).toBe(4);
			expect(auth.widgetBridge.notifyChanged).toHaveBeenCalled();
		});

		it('keeps the other days and trackers', async () => {
			api.put.mockResolvedValue(true);
			const s = loaded({ values: [value(1, '2026-08-13', 5), value(3, '2026-08-14', 1)] });

			await s.saveDay('2026-08-14', new Map([[mood, 2]]));

			expect(s.getValue(mood, '2026-08-13')).toBe(5);
			expect(s.getValue(meditated, '2026-08-14')).toBe(1);
		});

		it('changes nothing when saving fails', async () => {
			api.put.mockResolvedValue(false);
			const s = loaded({ values: [value(1, '2026-08-14', 2)] });

			expect(await s.saveDay('2026-08-14', new Map([[mood, 5], [glasses, 3]]))).toBe(false);

			expect(s.getValue(mood, '2026-08-14')).toBe(2);
			expect(s.getValue(glasses, '2026-08-14')).toBeNull();
			expect(auth.widgetBridge.notifyChanged).not.toHaveBeenCalled();
		});
	});

	describe('saveSelectedSports', () => {
		it('sends the sports with the enabled built-in trackers, which the old endpoint requires', async () => {
			api.put.mockResolvedValue(true);
			const s = loaded();

			expect(await s.saveSelectedSports(['yoga', 'bike', 'mountain', 'footprints', 'dumbbell'])).toBe(true);

			expect(api.put).toHaveBeenCalledWith(expect.stringMatching(/\/users\/me\/settings\/check-in$/), {
				enabled_trackers: ['mood', 'sports'],
				selected_sports: ['yoga', 'bike', 'mountain', 'footprints', 'dumbbell']
			});
			expect(s.selectedSports[0]).toBe('yoga');
		});

		it('keeps the old sports when saving fails', async () => {
			api.put.mockResolvedValue(false);
			const s = loaded();

			expect(await s.saveSelectedSports(['yoga', 'bike', 'mountain', 'footprints', 'dumbbell'])).toBe(false);
			expect(s.selectedSports).toEqual(DEFAULT_SPORTS);
		});
	});

	describe('tracker changes', () => {
		beforeEach(() => {
			api.list.mockResolvedValue({ data: [mood, meditated] });
		});

		it('creates a tracker and returns it from the reloaded list', async () => {
			api.create.mockResolvedValue({ data: meditated });
			const s = loaded({ trackers: [mood] });

			const created = await s.createTracker({ name: 'Meditated', type: 'yes_no', icon: 'flower-2' });

			expect(api.create).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/trackers$/), { name: 'Meditated', type: 'yes_no', icon: 'flower-2' });
			expect(created).toEqual(meditated);
			expect(s.trackers).toEqual([mood, meditated]);
			expect(auth.widgetBridge.notifyChanged).toHaveBeenCalled();
		});

		it('updates a tracker on its own URL and reloads', async () => {
			api.put.mockResolvedValue(true);
			const s = loaded();

			expect(await s.updateTracker(meditated, { enabled: false })).toBe(true);

			expect(api.put).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/trackers\/3$/), { enabled: false });
			expect(api.list).toHaveBeenCalled();
		});

		it('does not reload when a change is rejected', async () => {
			api.put.mockResolvedValue(false);
			const s = loaded();

			expect(await s.updateTracker(meditated, { enabled: false })).toBe(false);
			expect(api.list).not.toHaveBeenCalled();
		});

		it('drops a deleted tracker\'s values', async () => {
			api.delete.mockResolvedValue(true);
			const s = loaded({ values: [value(3, '2026-08-14', 1), value(1, '2026-08-14', 4)] });

			await s.deleteTracker(meditated);

			expect(api.delete).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/trackers\/%d$/), 3);
			expect(s.values).toEqual([value(1, '2026-08-14', 4)]);
		});

		it('moves a rating by swapping it with the rating next to it', async () => {
			api.put.mockResolvedValue(true);
			const s = loaded();

			await s.moveTracker(sports, -1);

			expect(api.put).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/trackers\/order$/), { ids: [2, 1, 3, 4] });
		});

		it('moves a log by swapping it with the log next to it', async () => {
			api.put.mockResolvedValue(true);
			const s = loaded();

			await s.moveTracker(glasses, -1);

			expect(api.put).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/trackers\/order$/), { ids: [1, 2, 4, 3] });
		});

		it('saves ratings first, tidying up a mixed order', async () => {
			api.put.mockResolvedValue(true);
			const s = loaded({ trackers: [meditated, mood, glasses, sports] });

			await s.moveTracker(sports, -1);

			expect(api.put).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/trackers\/order$/), { ids: [2, 1, 3, 4] });
		});

		it('does not move past the edges of its group', async () => {
			const s = loaded();

			expect(await s.moveTracker(mood, -1)).toBe(false);
			expect(await s.moveTracker(sports, 1)).toBe(false);
			expect(await s.moveTracker(meditated, -1)).toBe(false);
			expect(await s.moveTracker(glasses, 1)).toBe(false);
			expect(api.put).not.toHaveBeenCalled();
		});
	});

	describe('month navigation', () => {
		it('prevMonth goes back one month', () => {
			const s = new CheckInData();
			s.historyMonth = { year: 2026, month: 7 };
			s.prevMonth();
			expect(s.historyMonth).toEqual({ year: 2026, month: 6 });
		});

		it('prevMonth wraps January to December of the previous year', () => {
			const s = new CheckInData();
			s.historyMonth = { year: 2026, month: 0 };
			s.prevMonth();
			expect(s.historyMonth).toEqual({ year: 2025, month: 11 });
		});

		it('nextMonth advances one month', () => {
			const s = new CheckInData();
			s.historyMonth = { year: 2026, month: 7 };
			s.nextMonth();
			expect(s.historyMonth).toEqual({ year: 2026, month: 8 });
		});

		it('nextMonth wraps December to January of the next year', () => {
			const s = new CheckInData();
			s.historyMonth = { year: 2026, month: 11 };
			s.nextMonth();
			expect(s.historyMonth).toEqual({ year: 2027, month: 0 });
		});
	});

	describe('isCurrentMonth', () => {
		it('is true when the history month matches today', () => {
			const s = new CheckInData();
			const now = new Date();
			s.historyMonth = { year: now.getFullYear(), month: now.getMonth() };
			expect(s.isCurrentMonth()).toBe(true);
		});

		it('is false for any other month', () => {
			const s = new CheckInData();
			const now = new Date();
			const otherMonth = (now.getMonth() + 1) % 12;
			s.historyMonth = {
				year: otherMonth === 0 ? now.getFullYear() + 1 : now.getFullYear(),
				month: otherMonth
			};
			expect(s.isCurrentMonth()).toBe(false);
		});
	});
});
