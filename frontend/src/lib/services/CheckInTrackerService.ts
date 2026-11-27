import type { CheckIn, CheckInTracker, CheckInType, CheckInValue } from '$lib/types/check_in';
import { ALL_CHECK_IN_TRACKERS } from '$lib/types/check_in';
import type { WeekStart } from '$lib/types/auth';
import type { Goal, GoalProgress } from '$lib/types/goal';
import { getDatePlusDays, getStartOfWeek, getUrlFormat } from '$lib/helpers/DateHelper';

export type CheckInIndex = Map<string, Map<number, number>>;

export interface WeekDays {
	start: string;
	days: number;
}

// food_amount is rated 1 (too little) to 5 (too much); 4 is the good amount.
const FOOD_AMOUNT_SCORE: Record<number, number> = { 1: 1.25, 2: 2.5, 3: 3.75, 4: 5, 5: 3 };

export default class CheckInTrackerService {
	static readonly MAX_COUNT: number = 1000000;

	index(values: CheckInValue[]): CheckInIndex {
		const index: CheckInIndex = new Map();
		for (const value of values) {
			const day = index.get(value.date) ?? new Map<number, number>();
			day.set(value.tracker_id, value.value);
			index.set(value.date, day);
		}
		return index;
	}

	value(index: CheckInIndex, trackerId: number, date: string): number | null {
		return index.get(date)?.get(trackerId) ?? null;
	}

	isRating(tracker: CheckInTracker): boolean {
		return tracker.type === 'scale' || tracker.type === 'sport';
	}

	isLog(tracker: CheckInTracker): boolean {
		return tracker.type === 'yes_no' || tracker.type === 'count';
	}

	builtInDay(index: CheckInIndex, trackers: CheckInTracker[], date: string): CheckIn | null {
		const day = index.get(date);
		if (!day) return null;

		const row = Object.fromEntries(ALL_CHECK_IN_TRACKERS.map((key) => [key, null])) as Record<CheckInType, number | null>;
		let hasValue = false;
		for (const tracker of trackers) {
			if (tracker.key === null) continue;
			const value = day.get(tracker.id);
			if (value === undefined) continue;
			row[tracker.key] = value;
			hasValue = true;
		}

		return hasValue ? { id: 0, date, created_at: '', updated_at: '', ...row } : null;
	}

	ratingScore(tracker: CheckInTracker, value: number): number {
		return tracker.key === 'food_amount' ? (FOOD_AMOUNT_SCORE[value] ?? value) : value;
	}

	mean(tracker: CheckInTracker, index: CheckInIndex, dates: string[]): number {
		const values = dates
			.map((date) => this.value(index, tracker.id, date))
			.filter((value): value is number => value !== null && value !== 0)
			.map((value) => this.ratingScore(tracker, value));

		return values.reduce((a, b) => a + b, 0) / values.length;
	}

	totalMean(trackers: CheckInTracker[], index: CheckInIndex, dates: string[]): number {
		const means = trackers.map((tracker) => this.mean(tracker, index, dates)).filter((mean) => !isNaN(mean));
		return means.length > 0 ? means.reduce((a, b) => a + b, 0) / means.length : NaN;
	}

	scored(trackers: CheckInTracker[]): CheckInTracker[] {
		return trackers.filter((tracker) => tracker.enabled && tracker.type === 'scale' && tracker.scored);
	}

	goalDates(goal: Goal, today: Date, weekStart: WeekStart): string[] {
		if (goal.period === 'day') return [getUrlFormat(today)];

		const start =
			goal.period === 'week'
				? getStartOfWeek(today, weekStart)
				: new Date(today.getFullYear(), today.getMonth(), 1);

		const dates: string[] = [];
		for (let day = start; day <= today; day = getDatePlusDays(day, 1)) {
			dates.push(getUrlFormat(day));
		}
		return dates;
	}

	weeklyDays(
		tracker: CheckInTracker,
		index: CheckInIndex,
		from: Date,
		today: Date,
		weekStart: WeekStart
	): WeekDays[] {
		const weeks: WeekDays[] = [];
		for (let start = getStartOfWeek(from, weekStart); start <= today; start = getDatePlusDays(start, 7)) {
			let days = 0;
			for (let i = 0; i < 7; i++) {
				const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
				if (day <= today && this.value(index, tracker.id, getUrlFormat(day)) !== null) days++;
			}
			weeks.push({ start: getUrlFormat(start), days });
		}
		return weeks;
	}

	// From the loaded values rather than the server's progress, so it follows edits right away.
	goalProgress(
		goal: Goal,
		tracker: CheckInTracker,
		index: CheckInIndex,
		today: Date,
		weekStart: WeekStart
	): GoalProgress {
		const values = this.goalDates(goal, today, weekStart)
			.map((date) => this.value(index, tracker.id, date))
			.filter((value): value is number => value !== null);

		const current = this.measure(tracker, values);
		// Nothing to measure is never met, as on the server.
		if (current === null) return { current: null, met: false };

		return { current, met: goal.comparison === 'at_least' ? current >= goal.target : current <= goal.target };
	}

	// Ratings and logs are shown apart, so a tracker only moves within its group. Null when it can't move.
	orderAfterMove(trackers: CheckInTracker[], tracker: CheckInTracker, offset: -1 | 1): number[] | null {
		const isRating = this.isRating(tracker);
		const group = trackers.filter((t) => this.isRating(t) === isRating).map((t) => t.id);
		const others = trackers.filter((t) => this.isRating(t) !== isRating).map((t) => t.id);
		const from = group.indexOf(tracker.id);
		const to = from + offset;
		if (from === -1 || to < 0 || to >= group.length) return null;

		[group[from], group[to]] = [group[to], group[from]];
		return isRating ? [...group, ...others] : [...others, ...group];
	}

	// Trackers switched off or deleted since are left out, so nothing is saved unseen.
	pendingChanges(trackers: CheckInTracker[], pending: Map<number, number | null>): Map<CheckInTracker, number | null> {
		const changes = new Map<CheckInTracker, number | null>();
		for (const tracker of trackers) {
			const value = pending.get(tracker.id);
			if (value !== undefined) changes.set(tracker, value);
		}
		return changes;
	}

	private measure(tracker: CheckInTracker, values: number[]): number | null {
		switch (tracker.type) {
			case 'yes_no':
			case 'sport':
				return values.length;
			case 'count':
				return values.reduce((a, b) => a + b, 0);
			case 'scale': {
				const rated = values.filter((value) => value > 0);
				return rated.length === 0 ? null : rated.reduce((a, b) => a + b, 0) / rated.length;
			}
		}
	}
}
