import { describe, it, expect, beforeEach } from 'vitest';
import { CheckInData } from '$lib/state/CheckInData.svelte';
import { api, storage, pageState, resetStoreMocks } from '../setup/storeMocks';
import { ALL_CHECK_IN_TRACKERS, DEFAULT_SPORTS } from '$lib/types/check_in';
import type { CheckIn, CheckInSettings } from '$lib/types/check_in';

function checkIn(overrides: Partial<CheckIn> = {}): CheckIn {
	return {
		id: 1,
		date: '2026-08-14',
		mood: 4,
		sports: null,
		water: null,
		sleep: null,
		dreams: null,
		work: null,
		food_quality: null,
		food_amount: null,
		menstruation: null,
		alcohol: null,
		smoking: null,
		social_life: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

beforeEach(() => {
	resetStoreMocks();
	pageState.pathname = '/check-in';
	pageState.params = {};
});

describe('CheckInData store', () => {
	it('initialises the history month and all scored trackers', () => {
		storage.getJson.mockReturnValue(null);
		const s = new CheckInData();
		const now = new Date();
		expect(s.historyMonth).toEqual({ year: now.getFullYear(), month: now.getMonth() });
		expect(s.scoredTrackers).toEqual(ALL_CHECK_IN_TRACKERS);
		expect(s.settings.enabledTrackers).toEqual(ALL_CHECK_IN_TRACKERS);
		expect(s.settings.selectedSports).toEqual(DEFAULT_SPORTS);
	});

	describe('scored trackers persistence', () => {
		it('loads persisted scored trackers from storage', () => {
			storage.getJson.mockReturnValue(['mood', 'sleep']);
			const s = new CheckInData();
			expect(s.scoredTrackers).toEqual(['mood', 'sleep']);
		});

		it('ignores non-array storage values', () => {
			storage.getJson.mockReturnValue('nope');
			const s = new CheckInData();
			expect(s.scoredTrackers).toEqual(ALL_CHECK_IN_TRACKERS);
		});

		it('saveScoredTrackers persists and updates the state', () => {
			const s = new CheckInData();
			s.saveScoredTrackers(['mood', 'water']);
			expect(storage.setJson).toHaveBeenCalledWith(CheckInData.LS_SCORED_TRACKERS_KEY, [
				'mood',
				'water'
			]);
			expect(s.scoredTrackers).toEqual(['mood', 'water']);
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

	describe('getDayData', () => {
		it('looks up data by an explicit day', () => {
			const s = new CheckInData();
			s.data = [
				checkIn({ date: '2026-08-14', mood: 5 }),
				checkIn({ id: 2, date: '2026-08-15' })
			];
			expect(s.getDayData('2026-08-14')?.mood).toBe(5);
			expect(s.getDayData('2026-08-15')?.id).toBe(2);
		});

		it('returns null for a day without data', () => {
			const s = new CheckInData();
			s.data = [checkIn({ date: '2026-08-14' })];
			expect(s.getDayData('2026-08-20')).toBeNull();
		});

		it('falls back to the selectedDate from the page params', () => {
			pageState.params = { date: '2026-08-14' };
			const s = new CheckInData();
			s.data = [checkIn({ date: '2026-08-14', mood: 3 })];
			expect(s.getDayData()?.mood).toBe(3);
		});

		it('returns null when the page has no selected date', () => {
			const s = new CheckInData();
			s.data = [checkIn({ date: '2026-08-14' })];
			expect(s.getDayData()).toBeNull();
		});
	});

	describe('activeTrackers', () => {
		it('derives the active trackers from the enabled settings', () => {
			const s = new CheckInData();
			s.settings = {
				enabledTrackers: ['mood', 'water'],
				selectedSports: [...DEFAULT_SPORTS]
			};
			expect(s.activeTrackers).toEqual(['mood', 'water']);
		});
	});

	describe('load', () => {
		it('loads the data and merges the settings from the API', async () => {
			api.list.mockResolvedValue({ data: [checkIn()] });
			api.get.mockResolvedValue({
				data: { enabled_trackers: ['mood'], selected_sports: ['yoga'] }
			});

			const s = new CheckInData();
			await s.load();

			expect(s.loaded).toBe(true);
			expect(s.data).toHaveLength(1);
			expect(s.settings).toEqual({
				enabledTrackers: ['mood'],
				selectedSports: ['yoga']
			});
		});

		it('keeps the default sports when the API omits them', async () => {
			api.list.mockResolvedValue({ data: [] });
			api.get.mockResolvedValue({ data: { enabled_trackers: ['mood'] } });

			const s = new CheckInData();
			await s.load();

			expect(s.settings.selectedSports).toEqual(DEFAULT_SPORTS);
		});

		it('leaves the state untouched when both requests fail', async () => {
			api.list.mockResolvedValue(null);
			api.get.mockResolvedValue(null);

			const s = new CheckInData();
			await s.load();

			expect(s.loaded).toBe(false);
			expect(s.data).toEqual([]);
			expect(s.settings.enabledTrackers).toEqual(ALL_CHECK_IN_TRACKERS);
		});
	});

	describe('saveSettings', () => {
		it('persists the settings via the API and updates the local state', async () => {
			api.put.mockResolvedValue(true);

			const s = new CheckInData();
			const settings: CheckInSettings = {
				enabledTrackers: ['mood'],
				selectedSports: ['bike']
			};
			await s.saveSettings(settings);

			expect(api.put).toHaveBeenCalledWith(expect.stringContaining('/settings'), {
				enabled_trackers: ['mood'],
				selected_sports: ['bike']
			});
			expect(s.settings).toEqual(settings);
		});
	});
});
