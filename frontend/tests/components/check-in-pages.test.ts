import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import ApiService from '$lib/services/ApiService';
import type { CheckInValue } from '$lib/types/check_in';
import { getDateMinusDays, getUrlFormat } from '$lib/helpers/DateHelper';
import { renderWithContext } from './helpers/context';
import type { Translation } from '$lib/state/Translation.svelte';
import CheckInContextHarness from './helpers/CheckInContextHarness.svelte';
import { checkInTracker, checkInValue } from '../unit/helpers/factories';
import HistoryPage from '../../src/routes/check-in/history/+page.svelte';
import TrendsPage from '../../src/routes/check-in/trends/+page.svelte';

const chartOptions = vi.hoisted(() => [] as { xAxis: { data: string[] } }[]);
vi.mock('$lib/components/charts/echarts', () => ({
	init: () => ({ setOption: (options: { xAxis: { data: string[] } }) => chartOptions.push(options), dispatchAction: vi.fn(), resize: vi.fn(), dispose: vi.fn(), on: vi.fn() })
}));

const mood = checkInTracker({ id: 1, key: 'mood', name: null, type: 'scale', scored: true });
const glasses = checkInTracker({ id: 2, name: 'Glasses', type: 'count', position: 1 });
const meditated = checkInTracker({ id: 3, position: 2 });

function daysAgo(days: number): string {
	return getUrlFormat(getDateMinusDays(new Date(), days));
}

describe('History page', () => {
	function options(): string[] {
		return [...screen.getByRole<HTMLSelectElement>('combobox', { name: 'History' }).options].map((option) => option.text);
	}

	it('offers all entries, the total score when something is scored, and every tracker', () => {
		renderWithContext(CheckInContextHarness, { component: HistoryPage, trackers: [mood, meditated] });
		expect(options()).toEqual(['All entries', 'Total Score', 'Mood', 'Meditated']);
	});

	it('leaves out the total score when nothing is scored', () => {
		renderWithContext(CheckInContextHarness, { component: HistoryPage, trackers: [meditated] });
		expect(options()).toEqual(['All entries', 'Meditated']);
	});

	it('shows the day\'s score once "Total Score" is chosen', async () => {
		renderWithContext(CheckInContextHarness, { component: HistoryPage, trackers: [mood, meditated], values: [checkInValue(1, daysAgo(0), 4)] });
		expect(screen.queryByText('4.0')).not.toBeInTheDocument();

		await fireEvent.change(screen.getByRole('combobox', { name: 'History' }), { target: { value: 'total' } });
		expect(screen.getByText('4.0')).toBeInTheDocument();
	});

	it('names the weekdays in the app\'s language, not the browser\'s', async () => {
		renderWithContext(CheckInContextHarness, { component: HistoryPage, trackers: [meditated] }, { onReady: ({ ts }) => (ts as Translation).changeLanguage('de') });

		await waitFor(() => expect(screen.getByText('Mo')).toBeInTheDocument());
		expect(screen.queryByText('Mon')).not.toBeInTheDocument();
	});

	it('shows one tracker\'s values once it is chosen', async () => {
		renderWithContext(CheckInContextHarness, { component: HistoryPage, trackers: [mood, glasses], values: [checkInValue(2, daysAgo(0), 37)] });

		await fireEvent.change(screen.getByRole('combobox', { name: 'History' }), { target: { value: '2' } });
		expect(screen.getAllByText('37').length).toBeGreaterThan(0);
	});
});

describe('Trends page', () => {
	function answer(values: CheckInValue[]): void {
		vi.spyOn(ApiService.prototype, 'get').mockResolvedValue(null);
		vi.spyOn(ApiService.prototype, 'list').mockImplementation(async (url: string) =>
			(url.endsWith('/check-in/trackers') ? { data: [mood, glasses, meditated] } : { data: values }) as never
		);
	}

	it('charts ratings without the zeros and counts with them, within the chosen range', async () => {
		answer([
			checkInValue(1, daysAgo(1), 4),
			checkInValue(1, daysAgo(2), 0),
			checkInValue(2, daysAgo(1), 0),
			checkInValue(2, daysAgo(2), 3)
		]);
		renderWithContext(CheckInContextHarness, { component: TrendsPage });

		await waitFor(() => expect(screen.getByText('Glasses')).toBeInTheDocument());
		expect(screen.queryByText('Mood')).not.toBeInTheDocument();
	});

	it('widens the range to three months and to everything', async () => {
		answer([checkInValue(2, daysAgo(40), 2), checkInValue(2, daysAgo(50), 3), checkInValue(1, daysAgo(150), 4), checkInValue(1, daysAgo(200), 4)]);
		renderWithContext(CheckInContextHarness, { component: TrendsPage });
		await waitFor(() => expect(screen.getByRole('button', { name: '3 Months' })).toBeInTheDocument());
		expect(screen.queryByText('Glasses')).not.toBeInTheDocument();

		await fireEvent.click(screen.getByRole('button', { name: '3 Months' }));
		expect(screen.getByText('Glasses')).toBeInTheDocument();
		expect(screen.queryByText('Mood')).not.toBeInTheDocument();

		await fireEvent.click(screen.getByRole('button', { name: '6 Months' }));
		expect(screen.queryByText('Mood')).not.toBeInTheDocument();

		await fireEvent.click(screen.getByRole('button', { name: 'All' }));
		await waitFor(() => expect(screen.getByText('Mood')).toBeInTheDocument());
	});

	it('redraws a chart with the days of the newly chosen range', async () => {
		answer([checkInValue(2, daysAgo(1), 2), checkInValue(2, daysAgo(2), 3), checkInValue(2, daysAgo(40), 1)]);
		renderWithContext(CheckInContextHarness, { component: TrendsPage });
		await waitFor(() => expect(screen.getByText('Glasses')).toBeInTheDocument());
		const daysCharted = () => chartOptions[chartOptions.length - 1].xAxis.data.length;
		const before = daysCharted();

		await fireEvent.click(screen.getByRole('button', { name: '3 Months' }));

		await waitFor(() => expect(daysCharted()).toBeGreaterThan(before));
	});

	it('charts yes/no trackers by the days done per week', async () => {
		answer([checkInValue(3, daysAgo(1), 1), checkInValue(3, daysAgo(10), 1)]);
		renderWithContext(CheckInContextHarness, { component: TrendsPage });

		await waitFor(() => expect(screen.getByText('Meditated')).toBeInTheDocument());
	});
});
