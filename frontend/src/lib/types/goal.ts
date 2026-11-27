export type GoalSource = 'check_in_tracker';

export type GoalPeriod = 'day' | 'week' | 'month';

export type GoalComparison = 'at_least' | 'at_most';

export interface GoalPeriodProgress {
	current: number | null;
	met: boolean;
	period_start: string;
	period_end: string;
	history: { period_start: string; met: boolean }[];
}

// Worked out in the app from the loaded values, so it follows edits right away.
export interface GoalProgress {
	current: number | null;
	met: boolean;
}

// One goal's line on the daily page.
export interface GoalLine {
	text: string;
	met: boolean;
}

export interface Goal {
	id: number;
	source: GoalSource;
	check_in_tracker_id: number | null;
	period: GoalPeriod;
	comparison: GoalComparison;
	target: number;
	notify_when_reached: boolean;
	progress: GoalPeriodProgress;
}

export interface CreateGoalRequest {
	source: GoalSource;
	check_in_tracker_id: number;
	period: GoalPeriod;
	comparison: GoalComparison;
	target: number;
	notify_when_reached: boolean;
}

export type UpdateGoalRequest = Partial<Pick<CreateGoalRequest, 'period' | 'comparison' | 'target' | 'notify_when_reached'>>;
