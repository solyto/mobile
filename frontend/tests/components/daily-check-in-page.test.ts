import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import ApiService from '$lib/services/ApiService';
import type { CheckInData } from '$lib/state/CheckInData.svelte';
import type { CheckInTracker } from '$lib/types/check_in';
import { renderWithContext } from './helpers/context';
import DailyCheckInPageHarness from './helpers/DailyCheckInPageHarness.svelte';
import { checkInTracker } from '../unit/helpers/factories';

vi.mock('$app/state', () => ({ page: { params: { date: '2026-11-20' } } }));
vi.mock('$app/navigation', () => ({ afterNavigate: () => {} }));

const meditated = checkInTracker({ id: 101, values_count: 0 });

const walked: CheckInTracker = { ...meditated, id: 102, name: 'Walked', position: 1 };
const water: CheckInTracker = { ...meditated, id: 103, name: 'Glasses of water', type: 'count', position: 2 };

function renderPage(trackers: CheckInTracker[] = [meditated, walked]): CheckInData {
	let checkInData: CheckInData | null = null;
	renderWithContext(DailyCheckInPageHarness, { trackers, onReady: (data: CheckInData) => (checkInData = data) });
	return checkInData!;
}

function reloadTrackers(checkInData: CheckInData, change: (tracker: CheckInTracker) => Partial<CheckInTracker> = () => ({})): void {
	checkInData.trackers = checkInData.trackers.map((tracker) => ({ ...tracker, ...change(tracker) }));
}

describe('Daily check-in page', () => {
	it('keeps an unsaved change shown and saves it after the trackers were reloaded', async () => {
		const put = vi.spyOn(ApiService.prototype, 'put').mockResolvedValue({ data: {} } as never);
		vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({ data: [] });
		const checkInData = renderPage([water]);
		const total = () => screen.getByRole('button', { expanded: false }).textContent?.trim();

		await fireEvent.click(screen.getByLabelText('One more'));
		await fireEvent.click(screen.getByLabelText('One more'));
		expect(total()).toBe('2');

		reloadTrackers(checkInData);

		await waitFor(() => expect(checkInData.trackers[0]).not.toBe(water));
		expect(total()).toBe('2');
		await fireEvent.click(screen.getByRole('button', { name: 'Save' }));
		await waitFor(() =>
			expect(put).toHaveBeenCalledWith(expect.stringContaining('/check-in/values'), { date: '2026-11-20', values: [{ tracker_id: 103, value: 2 }] })
		);
	});

	it('saves only the changes on trackers still shown', async () => {
		const put = vi.spyOn(ApiService.prototype, 'put').mockResolvedValue({ data: {} } as never);
		vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({ data: [] });
		const checkInData = renderPage();

		await fireEvent.click(screen.getByLabelText('Meditated'));
		await fireEvent.click(screen.getByLabelText('Walked'));
		reloadTrackers(checkInData, (tracker) => (tracker.id === meditated.id ? { enabled: false } : {}));

		await waitFor(() => expect(screen.queryByLabelText('Meditated')).toBeNull());
		await fireEvent.click(screen.getByRole('button', { name: 'Save' }));
		await waitFor(() => expect(put).toHaveBeenCalledTimes(1));
		expect(put).toHaveBeenCalledWith(expect.stringContaining('/check-in/values'), { date: '2026-11-20', values: [{ tracker_id: 102, value: 1 }] });
	});

	it('keeps a change made while saving, and saves once on a double click', async () => {
		type Put = Awaited<ReturnType<ApiService['put']>>;
		const answers: ((value: Put) => void)[] = [];
		const put = vi.spyOn(ApiService.prototype, 'put').mockImplementation(() => new Promise<Put>((resolve) => answers.push(resolve)));
		vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({ data: [] });
		renderPage([water]);
		const total = () => screen.getByRole('button', { expanded: false }).textContent?.trim();
		const save = () => screen.getByRole<HTMLButtonElement>('button', { name: 'Save' });

		await fireEvent.click(screen.getByLabelText('One more'));
		await fireEvent.click(save());
		await fireEvent.click(save());
		expect(put).toHaveBeenCalledTimes(1);

		await fireEvent.click(screen.getByLabelText('One more'));
		answers[0](true);

		await waitFor(() => expect(save().disabled).toBe(false));
		expect(total()).toBe('2');

		await fireEvent.click(save());
		await waitFor(() => expect(put).toHaveBeenCalledTimes(2));
		expect(put).toHaveBeenLastCalledWith(expect.stringContaining('/check-in/values'), { date: '2026-11-20', values: [{ tracker_id: 103, value: 2 }] });
	});
});
