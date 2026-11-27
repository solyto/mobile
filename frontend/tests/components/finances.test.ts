import { describe, it, expect, vi, afterEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ApiService from '$lib/services/ApiService';
import type { Finances } from '$lib/state/Finances.svelte';
import type { Tags } from '$lib/state/Tags.svelte';
import FinanceNavigation from '$lib/components/finances/FinanceNavigation.svelte';
import AddBudget from '$lib/components/finances/AddBudget.svelte';
import BudgetPage from '../../src/routes/finances/budget/+page.svelte';
import { renderWithContext } from './helpers/context';
import FinancesHarness from './helpers/FinancesHarness.svelte';
import { budget, tag } from '../unit/helpers/factories';

const goto = vi.hoisted(() => vi.fn());
vi.mock('$app/navigation', () => ({ goto }));
vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/finances/wealth') } }));

function renderFinances(component: Parameters<typeof renderWithContext>[0], props: Record<string, unknown> = {}, prepare?: (finances: Finances, tags: Tags) => void): Finances {
	let finances: Finances | null = null;
	renderWithContext(FinancesHarness, {
		component,
		props,
		onReady: (f: Finances, tags: Tags) => {
			finances = f;
			prepare?.(f, tags);
		}
	});
	return finances!;
}

afterEach(() => {
	goto.mockReset();
});

describe('Finance navigation', () => {
	it.each([
		['Dashboard', '/finances'],
		['Wealth', '/finances/wealth'],
		['Budget', '/finances/budget']
	])('goes to the %s page', async (title, path) => {
		renderWithContext(FinanceNavigation);

		await fireEvent.click(screen.getByTitle(title));

		expect(goto).toHaveBeenCalledWith(expect.stringMatching(new RegExp(`${path}$`)));
	});
});

describe('Adding a budget item', () => {
	it('sends the title, value, interval and picked tags', async () => {
		const user = userEvent.setup();
		const finances = renderFinances(AddBudget, { type: 'expense', showTags: true }, (_, tags) => (tags.tags = [tag(3, 'Home')]));
		const add = vi.spyOn(finances, 'addBudget').mockResolvedValue(true);

		await fireEvent.click(screen.getByRole('button'));
		await user.type(screen.getByPlaceholderText('Title'), ' Rent ');
		await user.type(screen.getByPlaceholderText('Value'), '900');
		await user.type(screen.getByRole('searchbox'), 'Home');
		await user.click(await screen.findByText('Home', { selector: 'li *, li' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

		await waitFor(() => expect(add).toHaveBeenCalledWith({ type: 'expense', title: 'Rent', value: 900, interval: 'monthly', tags: [3] }));
	});

	it('sends no tags when none were picked', async () => {
		const user = userEvent.setup();
		const finances = renderFinances(AddBudget, { type: 'income', showTags: false });
		const add = vi.spyOn(finances, 'addBudget').mockResolvedValue(true);

		await fireEvent.click(screen.getByRole('button'));
		await user.type(screen.getByPlaceholderText('Title'), 'Salary');
		await user.type(screen.getByPlaceholderText('Value'), '100');
		await fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

		await waitFor(() => expect(add).toHaveBeenCalledWith({ type: 'income', title: 'Salary', value: 100, interval: 'monthly', tags: undefined }));
	});
});

describe('Budget page tag filter', () => {
	it('shows only the items with the chosen tag', async () => {
		vi.spyOn(ApiService.prototype, 'list').mockResolvedValue({ data: [] });
		const home = tag(3, 'Home');
		renderFinances(BudgetPage, {}, (f) => {
			f.expenses = [budget({ id: 1, title: 'Rent', tags: [home] }), budget({ id: 2, title: 'Gym' })];
			f.budgetLoaded = true;
		});

		await userEvent.setup().selectOptions(screen.getByLabelText('Filter by tag'), '3');

		await waitFor(() => expect(screen.queryByText('Gym')).toBeNull());
		expect(screen.getByText('Rent')).toBeInTheDocument();
	});
});
