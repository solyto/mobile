import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ApiService from '$lib/services/ApiService';
import type { Finances } from '$lib/state/Finances.svelte';
import type { Tags } from '$lib/state/Tags.svelte';
import BudgetPage from '../../src/routes/finances/budget/+page.svelte';
import { renderWithContext } from './helpers/context';
import FinancesHarness from './helpers/FinancesHarness.svelte';
import { budget, tag } from '../unit/helpers/factories';

const rent = budget();

async function openRentHistory(): Promise<Finances> {
	vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({ data: [] });
	let finances: Finances | null = null;
	renderWithContext(FinancesHarness, {
		component: BudgetPage,
		onReady: (f: Finances, tags: Tags) => {
			finances = f;
			tags.tags = [tag(3, 'Home')];
		}
	});
	finances!.expenses = [rent];
	finances!.budgetLoaded = true;

	await fireEvent.click(await screen.findByText('Rent'));
	await screen.findByLabelText('Interval');
	return finances!;
}

describe('Budget page history', () => {
	it('shows the budget as the store has it after a reload', async () => {
		const finances = await openRentHistory();

		finances.expenses = [{ ...rent, title: 'Rent and parking' }];

		await waitFor(() => expect(screen.getAllByText('Rent and parking').length).toBeGreaterThan(1));
	});

	it('reloads the budgets after a failed tag change, so the picker shows the saved tags again', async () => {
		const finances = await openRentHistory();
		vi.spyOn(finances, 'updateBudget').mockResolvedValue(false);
		const reload = vi.spyOn(finances, 'loadIncome').mockResolvedValue();

		await userEvent.setup().type(screen.getByRole('searchbox'), 'Home{Enter}');

		await waitFor(() => expect(finances.updateBudget).toHaveBeenCalledWith(rent, { tags: [3] }));
		expect(reload).toHaveBeenCalledTimes(1);
	});
});

describe('Budget page money', () => {
	it('formats amounts in the user currency and language', async () => {
		vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({ data: [] });
		let finances: Finances | null = null;
		renderWithContext(
			FinancesHarness,
			{ component: BudgetPage, onReady: (f: Finances) => (finances = f) },
			{ stores: { auth: { user: { settings: { currency: 'USD', language: 'en', date_format: 'YYYY-mm-dd' } } } } }
		);
		finances!.expenses = [budget({ value: 900 })];
		finances!.budgetLoaded = true;

		expect((await screen.findAllByText(/\$900\.00/)).length).toBeGreaterThan(0);
	});
});
