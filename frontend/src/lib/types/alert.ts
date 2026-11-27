export type AlertSource = 'check_in_tracker' | 'goal';

export type TrackerAlertRule = 'average_below' | 'average_above' | 'no_entry_days' | 'entry_days';

export type AlertRule = TrackerAlertRule | 'goal_reached';

export type AlertSuggestionKey = 'no_sport_week' | 'mood_trending_down' | 'sleep_trending_down' | 'drinking_more';

export interface AlertState {
	active: boolean;
	average: number | null;
	streak: number | null;
	last_entry: string | null;
}

export interface Alert {
	id: number;
	source: AlertSource;
	check_in_tracker_id: number | null;
	goal_id: number | null;
	rule: AlertRule;
	threshold: number | null;
	days: number | null;
	enabled: boolean;
	suggestion: AlertSuggestionKey | null;
	last_triggered_on: string | null;
	state: AlertState;
}

export interface AlertSuggestion {
	key: AlertSuggestionKey;
	check_in_tracker_id: number;
	rule: TrackerAlertRule;
	threshold: number | null;
	days: number;
}

export interface CreateAlertRequest {
	source: 'check_in_tracker';
	check_in_tracker_id: number;
	rule: TrackerAlertRule;
	threshold: number | null;
	days: number;
}

export type UpdateAlertRequest = Partial<Pick<CreateAlertRequest, 'rule' | 'threshold' | 'days'>> & { enabled?: boolean };
