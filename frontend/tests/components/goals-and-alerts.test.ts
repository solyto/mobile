import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import ApiService from '$lib/services/ApiService';
import GoalCard from '$lib/components/goals/GoalCard.svelte';
import AlertSettings from '$lib/components/settings/alerts/AlertSettings.svelte';
import type { Alert } from '$lib/types/alert';
import type { GoalPeriodProgress } from '$lib/types/goal';
import { formatDateWithoutYear, getDatePlusDays, getUrlFormat } from '$lib/helpers/DateHelper';
import { renderWithContext } from './helpers/context';
import CheckInContextHarness from './helpers/CheckInContextHarness.svelte';
import { checkInTracker, goal } from '../unit/helpers/factories';

function inDays(days: number): string {
	return getUrlFormat(getDatePlusDays(new Date(), days));
}

describe('GoalCard', () => {
	const tracker = checkInTracker();

	function progress(periodEnd: string, history: GoalPeriodProgress['history'] = []): GoalPeriodProgress {
		return { current: 1, met: false, period_start: '', period_end: periodEnd, history };
	}

	it('counts the days left in the period, today included', () => {
		renderWithContext(GoalCard, { goal: goal({ progress: progress(inDays(2)) }), tracker, dateFormat: null, onEdit: vi.fn() });
		expect(screen.getByText(/3 days left/)).toBeInTheDocument();
	});

	it('says when it is the last day', () => {
		renderWithContext(GoalCard, { goal: goal({ progress: progress(inDays(0)) }), tracker, dateFormat: null, onEdit: vi.fn() });
		expect(screen.getByText(/Last day/)).toBeInTheDocument();
	});

	it('shows no days left for a daily goal', () => {
		renderWithContext(GoalCard, { goal: goal({ period: 'day', progress: progress(inDays(0)) }), tracker, dateFormat: null, onEdit: vi.fn() });
		expect(screen.queryByText(/·/)).not.toBeInTheDocument();
	});

	it('sums up the past periods and lists them oldest first', () => {
		const history = [
			{ period_start: '2026-11-09', met: true },
			{ period_start: '2026-11-02', met: false }
		];
		const { container } = renderWithContext(GoalCard, { goal: goal({ progress: progress(inDays(2), history) }), tracker, dateFormat: null, onEdit: vi.fn() });

		expect(screen.getByText('Reached in 1 of the last 2 weeks')).toBeInTheDocument();
		const periods = [...container.querySelectorAll('[title="Reached"], [title="Not reached"]')];
		expect(periods.map((period) => [period.getAttribute('title'), period.textContent?.trim()])).toEqual([
			['Not reached', formatDateWithoutYear('2026-11-02', null)],
			['Reached', formatDateWithoutYear('2026-11-09', null)]
		]);
	});
});

describe('AlertSettings', () => {
	const meditated = checkInTracker({ id: 3 });

	function alert(overrides: Partial<Alert> = {}): Alert {
		return {
			id: 1,
			source: 'check_in_tracker',
			check_in_tracker_id: 3,
			goal_id: null,
			rule: 'no_entry_days',
			threshold: null,
			days: 14,
			enabled: true,
			suggestion: null,
			last_triggered_on: null,
			state: { active: true, average: null, streak: null, last_entry: null },
			...overrides
		};
	}

	function renderAlertSettings(alerts: Alert[]): void {
		vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({ data: [] });
		renderWithContext(CheckInContextHarness, { component: AlertSettings, trackers: [meditated], alerts });
	}

	it('lists the alerts whose tracker exists, with what they watch and their state', async () => {
		renderAlertSettings([alert(), alert({ id: 2, check_in_tracker_id: 99 })]);

		await waitFor(() => expect(screen.getByText('Meditated: Nothing logged for 14 days')).toBeInTheDocument());
		expect(screen.getByText('Applies now')).toBeInTheDocument();
		expect(screen.getAllByRole('checkbox')).toHaveLength(1);
	});

	it('shows when an alert was last sent', async () => {
		renderAlertSettings([alert({ state: { active: false, average: null, streak: null, last_entry: null }, last_triggered_on: '2026-11-20' })]);

		const sent = `Last sent ${formatDateWithoutYear('2026-11-20', null)}`;
		await waitFor(() => expect(screen.getByText(sent)).toBeInTheDocument());
		expect(screen.queryByText(/Applies now/)).not.toBeInTheDocument();
	});
});
