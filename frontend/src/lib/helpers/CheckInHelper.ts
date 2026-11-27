import type { CheckInTracker } from '$lib/types/check_in';
import type { Goal, GoalPeriod, GoalProgress } from '$lib/types/goal';
import type { CheckInRecords } from '$lib/types/translation';

export function getScoreColor(value: number): string {
	if (value >= 4) return 'bg-c-success';
	if (value >= 3) return 'bg-c-primary';
	if (value >= 2) return 'bg-c-warning';
	if (value >= 1.5) return 'bg-c-action';
	return 'bg-c-danger';
}

// No ratings yet shows as "-".
export function formatScore(value: number): string {
	return isNaN(value) ? '-' : value.toFixed(2);
}

// A score of 5 fills the bar.
export function scoreWidth(value: number): number {
	return isNaN(value) ? 0 : (value / 5) * 100;
}

export function trackerLabel(tracker: CheckInTracker, texts: CheckInRecords): string {
	return tracker.key !== null ? texts[tracker.key] : (tracker.name ?? '');
}

export function goalProgressParts(
	goal: Goal,
	tracker: CheckInTracker,
	progress: GoalProgress,
	texts: CheckInRecords
): { value: string; period: string } {
	const format = (n: number) => (tracker.type === 'scale' ? n.toFixed(1) : String(n));
	const current = progress.current === null ? '–' : format(progress.current);
	const target = `${goal.comparison === 'at_most' ? '≤ ' : ''}${format(goal.target)}`;
	const periods: Record<GoalPeriod, string> = { day: texts.goal_today, week: texts.goal_this_week, month: texts.goal_this_month };

	return { value: `${current} / ${target}`, period: periods[goal.period] };
}

export function goalProgressText(goal: Goal, tracker: CheckInTracker, progress: GoalProgress, texts: CheckInRecords): string {
	const { value, period } = goalProgressParts(goal, tracker, progress, texts);
	return `${value} ${period}`;
}

