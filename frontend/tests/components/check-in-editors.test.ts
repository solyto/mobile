import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import ApiService from '$lib/services/ApiService';
import TrackerEditor from '$lib/components/check-in/settings/TrackerEditor.svelte';
import AlertEditor from '$lib/components/settings/alerts/AlertEditor.svelte';
import GoalEditor from '$lib/components/goals/GoalEditor.svelte';
import type { CheckInTracker } from '$lib/types/check_in';
import { renderWithContext } from './helpers/context';
import CheckInContextHarness from './helpers/CheckInContextHarness.svelte';
import { checkInTracker } from '../unit/helpers/factories';

describe('Tracker editor', () => {
	it('creates the tracker once when "Add tracker" is clicked twice quickly', async () => {
		type Created = Awaited<ReturnType<ApiService['create']>>;
		let answer: (value: Created) => void = () => {};
		const create = vi.spyOn(ApiService.prototype, 'create').mockImplementation(() => new Promise<Created>((resolve) => (answer = resolve)));
		vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({
			data: [{ id: 1, key: null, name: 'Meditated', type: 'yes_no', enabled: true }]
		} as never);
		const onDone = vi.fn();
		renderWithContext(CheckInContextHarness, { component: TrackerEditor, props: { onDone } });

		await fireEvent.input(screen.getByPlaceholderText('e.g. Glasses of water'), { target: { value: 'Meditated' } });
		const add = screen.getByRole('button', { name: 'Add tracker' });
		await fireEvent.click(add);
		await fireEvent.click(add);

		expect(create).toHaveBeenCalledTimes(1);
		answer({ data: { id: 1 } } as Created);
		await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
		expect(create).toHaveBeenCalledTimes(1);
	});

	it('names the tracker and its entries when asking to delete it', async () => {
		const glasses = checkInTracker({ id: 4, name: 'Glasses', type: 'count', values_count: 12 });
		renderWithContext(CheckInContextHarness, { component: TrackerEditor, props: { tracker: glasses, onDone: vi.fn() }, trackers: [glasses] });

		expect(screen.getByText('Count')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Add tracker' })).not.toBeInTheDocument();

		await fireEvent.click(screen.getByRole('button', { name: 'Delete tracker' }));
		expect(screen.getByText('Delete Glasses? This also removes all 12 entries.')).toBeInTheDocument();
	});

	it('offers the three types with their hints for a new tracker, and no delete', () => {
		renderWithContext(CheckInContextHarness, { component: TrackerEditor, props: { onDone: vi.fn() } });

		expect(screen.getByText('Yes / no')).toBeInTheDocument();
		expect(screen.getByText('Count things during the day')).toBeInTheDocument();
		expect(screen.getByText('1 = bad … 5 = good')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Delete tracker' })).not.toBeInTheDocument();
	});
});

describe('Alert editor', () => {
	it('starts with a rule the first tracker offers, so a new alert can be saved', () => {
		const meditated = { id: 7, key: null, name: 'Meditated', type: 'yes_no', icon: null, position: 0, enabled: true, scored: false, values_count: 0 } as CheckInTracker;
		renderWithContext(CheckInContextHarness, { component: AlertEditor, props: { onClose: vi.fn() }, trackers: [meditated] });

		expect(screen.getByRole<HTMLButtonElement>('button', { name: 'New alert' }).disabled).toBe(false);
	});

	it('switches to a rule the newly chosen tracker offers and creates the alert on it', async () => {
		const create = vi.spyOn(ApiService.prototype, 'create').mockResolvedValue({ data: {} } as never);
		vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({ data: [] });
		const mood = checkInTracker({ id: 1, key: 'mood', name: null, type: 'scale' });
		const meditated = checkInTracker({ id: 7, position: 1 });
		renderWithContext(CheckInContextHarness, { component: AlertEditor, props: { onClose: vi.fn() }, trackers: [mood, meditated] });

		await fireEvent.change(screen.getByRole('combobox', { name: 'Tracker' }), { target: { value: '7' } });
		await fireEvent.click(screen.getByRole('button', { name: 'New alert' }));

		await waitFor(() =>
			expect(create).toHaveBeenCalledWith(expect.stringMatching(/\/alerts$/), {
				rule: 'no_entry_days',
				threshold: null,
				days: 7,
				source: 'check_in_tracker',
				check_in_tracker_id: 7
			})
		);
	});
});

describe('Goal editor', () => {
	it('creates the goal on the chosen tracker', async () => {
		const create = vi.spyOn(ApiService.prototype, 'create').mockResolvedValue({ data: {} } as never);
		vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({ data: [] });
		const meditated = checkInTracker({ id: 7 });
		renderWithContext(CheckInContextHarness, { component: GoalEditor, props: { onClose: vi.fn() }, trackers: [meditated] });

		await fireEvent.input(screen.getByRole('spinbutton'), { target: { value: '3' } });
		await fireEvent.click(screen.getByRole('button', { name: 'New goal' }));

		await waitFor(() =>
			expect(create).toHaveBeenCalledWith(expect.stringMatching(/\/goals$/), {
				period: 'week',
				comparison: 'at_least',
				target: 3,
				notify_when_reached: false,
				source: 'check_in_tracker',
				check_in_tracker_id: 7
			})
		);
	});

	it('offers "at least" and "at most"', () => {
		renderWithContext(CheckInContextHarness, { component: GoalEditor, props: { onClose: vi.fn() }, trackers: [checkInTracker({ id: 7 })] });

		const comparison = screen.getAllByRole<HTMLSelectElement>('combobox', { name: 'Target' })[0];
		expect([...comparison.options].map((option) => [option.value, option.text])).toEqual([
			['at_least', 'At least'],
			['at_most', 'At most']
		]);
	});
});
