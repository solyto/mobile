import type { CheckInTrackerType } from '$lib/types/check_in';
import CheckInTrackerService from '$lib/services/CheckInTrackerService';
import type { AlertRule, TrackerAlertRule } from '$lib/types/alert';
import type { TargetBounds } from '$lib/services/GoalService';
import type { AlertRecords } from '$lib/types/translation';

// Mirrors the API's checks so the form can say what fits before saving.
export default class AlertService {
	static readonly MAX_DAYS: number = 90;

	rules(type: CheckInTrackerType): TrackerAlertRule[] {
		switch (type) {
			case 'scale':
				return ['average_below', 'average_above'];
			case 'count':
				return ['average_below', 'average_above', 'no_entry_days', 'entry_days'];
			case 'yes_no':
			case 'sport':
				return ['no_entry_days', 'entry_days'];
		}
	}

	isAverage(rule: AlertRule): boolean {
		return rule === 'average_below' || rule === 'average_above';
	}

	thresholdBounds(type: CheckInTrackerType): TargetBounds {
		return type === 'scale' ? { min: 1, max: 5, step: 0.1 } : { min: 0, max: CheckInTrackerService.MAX_COUNT, step: 1 };
	}

	isValid(
		type: CheckInTrackerType,
		rule: TrackerAlertRule,
		threshold: number | null,
		days: number | null
	): boolean {
		if (!this.rules(type).includes(rule)) return false;
		if (!this.isValidDays(days)) return false;
		if (!this.isAverage(rule)) return true;

		const { min, max } = this.thresholdBounds(type);
		return threshold !== null && threshold >= min && threshold <= max;
	}

	describe(rule: AlertRule, threshold: number | null, days: number | null, texts: AlertRecords): string {
		const templates: Record<AlertRule, string> = {
			average_below: texts.describe_average_below,
			average_above: texts.describe_average_above,
			no_entry_days: texts.describe_no_entry_days,
			entry_days: texts.describe_entry_days,
			goal_reached: texts.describe_goal_reached
		};

		return templates[rule].replace('{threshold}', String(threshold ?? '')).replace('{days}', String(days ?? ''));
	}

	private isValidDays(days: number | null): boolean {
		return days !== null && Number.isInteger(days) && days >= 1 && days <= AlertService.MAX_DAYS;
	}
}
