import type { CheckInTracker, CheckInTrackerType } from '$lib/types/check_in';
import CheckInTrackerService from '$lib/services/CheckInTrackerService';
import type { Goal, GoalPeriod } from '$lib/types/goal';
import { getDateDiffInDays, parseUrlFormat } from '$lib/helpers/DateHelper';

export interface TargetBounds {
	min: number;
	max: number;
	step: number;
}

// Mirrors the API's checks so the form can say what fits before saving.
export default class GoalService {
	countsDays(type: CheckInTrackerType): boolean {
		return type === 'yes_no' || type === 'sport';
	}

	periods(type: CheckInTrackerType): GoalPeriod[] {
		return this.countsDays(type) ? ['week', 'month'] : ['day', 'week', 'month'];
	}

	bounds(type: CheckInTrackerType, period: GoalPeriod): TargetBounds {
		if (type === 'scale') return { min: 1, max: 5, step: 0.1 };
		if (this.countsDays(type)) return { min: 0, max: period === 'week' ? 7 : 31, step: 1 };
		return { min: 0, max: CheckInTrackerService.MAX_COUNT, step: 1 };
	}

	isValidTarget(type: CheckInTrackerType, period: GoalPeriod, target: number | null): boolean {
		if (target === null || !this.periods(type).includes(period)) return false;

		const { min, max } = this.bounds(type, period);
		return target >= min && target <= max && (type === 'scale' || Number.isInteger(target));
	}

	isAverage(type: CheckInTrackerType): boolean {
		return type === 'scale';
	}

	scalePosition(value: number): number {
		return Math.min(1, Math.max(0, (value - 1) / 4));
	}

	ratio(goal: Goal): number {
		const current = goal.progress.current ?? 0;
		if (goal.target <= 0) return current > 0 ? 1 : 0;
		return Math.min(1, Math.max(0, current / goal.target));
	}

	daysLeft(goal: Goal, today: Date): number | null {
		if (goal.period === 'day') return null;

		const end = parseUrlFormat(goal.progress.period_end);
		if (end === null) return null;

		const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		return Math.max(1, getDateDiffInDays(start, end) + 1);
	}

	// A goal on a tracker that is switched off or gone isn't shown.
	withActiveTracker(goals: Goal[], activeTrackers: CheckInTracker[]): { goal: Goal; tracker: CheckInTracker }[] {
		return goals.flatMap((goal) => {
			const tracker = activeTrackers.find((t) => t.id === goal.check_in_tracker_id);
			return tracker ? [{ goal, tracker }] : [];
		});
	}
}
