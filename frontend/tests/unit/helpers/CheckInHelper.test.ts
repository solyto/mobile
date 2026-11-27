import { describe, it, expect } from 'vitest';
import { formatScore, getScoreColor, goalProgressText, scoreWidth, trackerLabel } from '$lib/helpers/CheckInHelper';
import type { CheckInRecords } from '$lib/types/translation';
import { checkInTracker as tracker, goal } from './factories';

describe('getScoreColor', () => {
	it.each([
		[5, 'bg-c-success'],
		[4, 'bg-c-success'],
		[3.99, 'bg-c-primary'],
		[3, 'bg-c-primary'],
		[2.5, 'bg-c-warning'],
		[2, 'bg-c-warning'],
		[1.75, 'bg-c-action'],
		[1.5, 'bg-c-action'],
		[1.49, 'bg-c-danger'],
		[1, 'bg-c-danger']
	])('colors %s as %s', (value, expected) => {
		expect(getScoreColor(value)).toBe(expected);
	});
});

describe('trackerLabel', () => {
	const texts = { mood: 'Stimmung' } as CheckInRecords;

	it('names built-in trackers by their translation', () => {
		expect(trackerLabel(tracker({ key: 'mood', name: null, type: 'scale' }), texts)).toBe('Stimmung');
	});

	it('names own trackers by the name the user gave them', () => {
		expect(trackerLabel(tracker(), texts)).toBe('Meditated');
	});
});

describe('goalProgressText', () => {
	const texts = { goal_today: 'today', goal_this_week: 'this week', goal_this_month: 'this month' } as CheckInRecords;

	it('shows days or counts as whole numbers', () => {
		expect(goalProgressText(goal({ target: 5 }), tracker(), { current: 3, met: false }, texts)).toBe('3 / 5 this week');
	});

	it('shows a 1–5 average with one decimal and marks an "at most" target', () => {
		const g = goal({ period: 'month', comparison: 'at_most', target: 2 });

		expect(goalProgressText(g, tracker({ type: 'scale' }), { current: 1.75, met: true }, texts)).toBe('1.8 / ≤ 2.0 this month');
	});

	it('shows a dash when there is nothing to measure yet', () => {
		const g = goal({ period: 'day', target: 4 });

		expect(goalProgressText(g, tracker({ type: 'scale' }), { current: null, met: false }, texts)).toBe('– / 4.0 today');
	});
});

describe('formatScore and scoreWidth', () => {
	it('shows a score with two decimals and as a share of 5', () => {
		expect(formatScore(3.4)).toBe('3.40');
		expect(scoreWidth(4)).toBe(80);
		expect(scoreWidth(5)).toBe(100);
	});

	it('shows "-" and an empty bar without ratings', () => {
		expect(formatScore(NaN)).toBe('-');
		expect(scoreWidth(NaN)).toBe(0);
	});
});
