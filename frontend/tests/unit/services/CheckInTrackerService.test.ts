import { describe, it, expect } from 'vitest';
import CheckInTrackerService from '$lib/services/CheckInTrackerService';
import { checkInTracker as tracker, checkInValue as value, goal } from '../helpers/factories';

const service = new CheckInTrackerService();

// Thursday; with weeks starting on Monday the week runs from 2026-10-12.
const today = new Date(2026, 9, 15);

describe('index and value', () => {
	it('finds a value by tracker and date', () => {
		const index = service.index([value(1, '2026-10-15', 4), value(2, '2026-10-15', 1)]);

		expect(service.value(index, 1, '2026-10-15')).toBe(4);
		expect(service.value(index, 2, '2026-10-15')).toBe(1);
		expect(service.value(index, 1, '2026-10-14')).toBeNull();
	});
});

describe('isRating and isLog', () => {
	it('puts 1–5 and sports trackers in the ratings, yes/no and counts in the logs', () => {
		expect(service.isRating(tracker({ type: 'scale' }))).toBe(true);
		expect(service.isRating(tracker({ type: 'sport' }))).toBe(true);
		expect(service.isLog(tracker({ type: 'yes_no' }))).toBe(true);
		expect(service.isLog(tracker({ type: 'count' }))).toBe(true);
		expect(service.isLog(tracker({ type: 'scale' }))).toBe(false);
	});
});

describe('builtInDay', () => {
	const mood = tracker({ id: 1, key: 'mood', name: null, type: 'scale' });
	const own = tracker({ id: 2 });

	it('builds the old one-row-per-day shape from built-in values only', () => {
		const index = service.index([value(1, '2026-10-15', 4), value(2, '2026-10-15', 1)]);
		const day = service.builtInDay(index, [mood, own], '2026-10-15')!;

		expect(day.date).toBe('2026-10-15');
		expect(day.mood).toBe(4);
		expect(day.water).toBeNull();
	});

	it('returns null for a day with only own tracker values or none', () => {
		const index = service.index([value(2, '2026-10-15', 1)]);

		expect(service.builtInDay(index, [mood, own], '2026-10-15')).toBeNull();
		expect(service.builtInDay(index, [mood, own], '2026-10-16')).toBeNull();
	});
});

describe('mean and totalMean', () => {
	const mood = tracker({ id: 1, key: 'mood', type: 'scale', scored: true });
	const sleep = tracker({ id: 2, key: 'sleep', type: 'scale', scored: true });
	const dates = ['2026-10-14', '2026-10-15', '2026-10-16'];

	it('averages the values and skips missing and zero ones', () => {
		const index = service.index([value(1, '2026-10-14', 2), value(1, '2026-10-15', 4), value(1, '2026-10-16', 0)]);

		expect(service.mean(mood, index, dates)).toBe(3);
	});

	it('returns NaN when there is nothing to average', () => {
		expect(service.mean(mood, service.index([]), dates)).toBeNaN();
		expect(service.totalMean([mood, sleep], service.index([]), dates)).toBeNaN();
	});

	it('scores the food amount by how close it is to the right amount', () => {
		const foodAmount = tracker({ id: 3, key: 'food_amount', type: 'scale' });
		const index = service.index([value(3, '2026-10-14', 4), value(3, '2026-10-15', 5)]);

		expect(service.mean(foodAmount, index, dates)).toBe(4);
	});

	it('averages the means of the trackers that have data', () => {
		const index = service.index([value(1, '2026-10-14', 2), value(2, '2026-10-14', 4), value(2, '2026-10-15', 4)]);

		expect(service.totalMean([mood, sleep, tracker({ id: 9, type: 'scale' })], index, dates)).toBe(3);
	});
});

describe('scored', () => {
	it('keeps enabled 1–5 trackers that count towards the score', () => {
		const scored = service.scored([
			tracker({ id: 1, type: 'scale', scored: true }),
			tracker({ id: 2, type: 'scale', scored: false }),
			tracker({ id: 3, type: 'scale', scored: true, enabled: false }),
			tracker({ id: 4, type: 'sport', scored: true }),
			tracker({ id: 5, type: 'count', scored: true })
		]);

		expect(scored.map((t) => t.id)).toEqual([1]);
	});
});

describe('goalProgress', () => {
	it('counts the ticked days of the week for yes/no', () => {
		const index = service.index([
			value(1, '2026-10-11', 1),
			value(1, '2026-10-12', 1),
			value(1, '2026-10-14', 1),
			value(1, '2026-10-15', 1)
		]);

		expect(service.goalProgress(goal(), tracker(), index, today, 'monday')).toEqual({ current: 3, met: true });
	});

	it('follows the user\'s week start', () => {
		const index = service.index([value(1, '2026-10-11', 1), value(1, '2026-10-12', 1)]);

		expect(service.goalProgress(goal(), tracker(), index, today, 'sunday').current).toBe(2);
		expect(service.goalProgress(goal(), tracker(), index, today, 'monday').current).toBe(1);
	});

	it('adds up a count for the day and for the month', () => {
		const index = service.index([value(1, '2026-09-30', 9), value(1, '2026-10-01', 3), value(1, '2026-10-15', 2)]);
		const count = tracker({ type: 'count' });

		expect(service.goalProgress(goal({ period: 'day', target: 5 }), count, index, today, 'monday')).toEqual({ current: 2, met: false });
		expect(service.goalProgress(goal({ period: 'month', target: 5 }), count, index, today, 'monday')).toEqual({ current: 5, met: true });
	});

	it('averages a 1–5 tracker over the ratings given and has no current value without them', () => {
		const g = goal({ target: 3.5 });
		const scale = tracker({ type: 'scale' });
		const index = service.index([value(1, '2026-10-13', 3), value(1, '2026-10-14', 5), value(1, '2026-10-15', 0)]);

		expect(service.goalProgress(g, scale, index, today, 'monday')).toEqual({ current: 4, met: true });
		expect(service.goalProgress(g, scale, service.index([]), today, 'monday')).toEqual({ current: null, met: false });
		expect(service.goalProgress(goal({ comparison: 'at_most' }), scale, service.index([]), today, 'monday').met).toBe(false);
	});

	it('meets an "at most" goal while staying at or below the target', () => {
		const g = goal({ period: 'week', comparison: 'at_most', target: 4 });
		const count = tracker({ type: 'count' });

		expect(service.goalProgress(g, count, service.index([value(1, '2026-10-13', 4)]), today, 'monday').met).toBe(true);
		expect(service.goalProgress(g, count, service.index([value(1, '2026-10-13', 5)]), today, 'monday').met).toBe(false);
	});
});

describe('weeklyDays', () => {
	it('counts the days with an entry per week, oldest first, up to today', () => {
		const index = service.index([
			value(1, '2026-10-05', 1),
			value(1, '2026-10-07', 1),
			value(1, '2026-10-12', 1),
			value(2, '2026-10-13', 1)
		]);

		expect(service.weeklyDays(tracker(), index, new Date(2026, 9, 6), today, 'monday')).toEqual([
			{ start: '2026-10-05', days: 2 },
			{ start: '2026-10-12', days: 1 }
		]);
	});

	it('follows the user\'s week start', () => {
		const index = service.index([value(1, '2026-10-11', 1)]);

		expect(service.weeklyDays(tracker(), index, new Date(2026, 9, 11), today, 'sunday')).toEqual([{ start: '2026-10-11', days: 1 }]);
	});
});

describe('pendingChanges', () => {
	const mood = tracker({ id: 1, key: 'mood', name: null, type: 'scale' });
	const meditated = tracker({ id: 2 });

	it('pairs each shown tracker with its pending value, a cleared one included', () => {
		const changes = service.pendingChanges([mood, meditated], new Map([[1, 4], [2, null]]));

		expect([...changes]).toEqual([[mood, 4], [meditated, null]]);
	});

	it('leaves out changes on trackers no longer shown', () => {
		const changes = service.pendingChanges([meditated], new Map([[1, 4], [2, 1]]));

		expect([...changes]).toEqual([[meditated, 1]]);
	});

	it('is empty without pending changes', () => {
		expect(service.pendingChanges([mood, meditated], new Map()).size).toBe(0);
	});
});

describe('orderAfterMove', () => {
	const mood = tracker({ id: 1, key: 'mood', type: 'scale' });
	const sports = tracker({ id: 2, key: 'sports', type: 'sport' });
	const meditated = tracker({ id: 3, type: 'yes_no' });
	const glasses = tracker({ id: 4, type: 'count' });
	const trackers = [mood, sports, meditated, glasses];

	it('swaps a rating with the rating next to it, keeping the logs after', () => {
		expect(service.orderAfterMove(trackers, sports, -1)).toEqual([2, 1, 3, 4]);
	});

	it('swaps a log with the log next to it, keeping the ratings before', () => {
		expect(service.orderAfterMove(trackers, glasses, -1)).toEqual([1, 2, 4, 3]);
	});

	it('moves within the group even when the groups are mixed in the list', () => {
		expect(service.orderAfterMove([mood, meditated, sports, glasses], sports, -1)).toEqual([2, 1, 3, 4]);
	});

	it('does not move past the edge of its group', () => {
		expect(service.orderAfterMove(trackers, mood, -1)).toBeNull();
		expect(service.orderAfterMove(trackers, sports, 1)).toBeNull();
		expect(service.orderAfterMove(trackers, meditated, -1)).toBeNull();
		expect(service.orderAfterMove(trackers, glasses, 1)).toBeNull();
	});

	it('does not move a tracker that is not in the list', () => {
		expect(service.orderAfterMove([mood, sports], tracker({ id: 9, type: 'scale' }), 1)).toBeNull();
	});
});
