import { describe, it, expect, beforeEach } from 'vitest';
import { Finances } from '$lib/state/Finances.svelte';
import { api, pageState, resetStoreMocks } from '../setup/storeMocks';

beforeEach(() => {
	resetStoreMocks();
	pageState.pathname = '/finances';
});

function budget(type: 'income' | 'expense', value: number) {
	return { id: type + value, type, value, title: type, created_at: '', updated_at: '' } as never;
}

describe('Finances store', () => {
	describe('getActivePage', () => {
		it('detects the active page from the pathname', () => {
			pageState.pathname = '/finances/wealth';
			expect(new Finances().activePage).toBe('wealth');

			pageState.pathname = '/finances/budget';
			expect(new Finances().activePage).toBe('budget');

			pageState.pathname = '/finances';
			expect(new Finances().activePage).toBeNull();
		});
	});

	describe('loadIncome', () => {
		it('splits budget entries into income and expenses', async () => {
			api.list.mockResolvedValue({
				data: [budget('income', 100), budget('expense', 30), budget('income', 50)]
			});

			const f = new Finances();
			await f.loadIncome();

			expect(f.budgetLoaded).toBe(true);
			expect(f.income.map((i) => i.value)).toEqual([100, 50]);
			expect(f.expenses.map((e) => e.value)).toEqual([30]);
		});
	});

	describe('budget totals', () => {
		it('computes income, expense and net totals', () => {
			const f = new Finances();
			f.income = [budget('income', 100), budget('income', 50)];
			f.expenses = [budget('expense', 30), budget('expense', 20)];

			expect(f.getBudgetIncomeTotal()).toBe(150);
			expect(f.getBudgetExpenseTotal()).toBe(50);
			expect(f.getBudgetTotal()).toBe(100);
		});
	});

	describe('loadWealth / getWealthSum', () => {
		it('loads wealth fields and sums current values', async () => {
			api.list.mockResolvedValue({
				data: [
					{
						id: 1,
						title: 'Cash',
						currentValue: { value: 100 },
						values: [],
						created_at: '',
						updated_at: ''
					},
					{
						id: 2,
						title: 'Stocks',
						currentValue: null,
						values: [],
						created_at: '',
						updated_at: ''
					},
					{
						id: 3,
						title: 'Fund',
						currentValue: { value: 42 },
						values: [],
						created_at: '',
						updated_at: ''
					}
				]
			});

			const f = new Finances();
			await f.loadWealth();

			expect(f.wealthLoaded).toBe(true);
			expect(f.wealth).toHaveLength(3);
			expect(f.getWealthSum()).toBe(142);
		});
	});

	describe('mutations', () => {
		it('addBudget creates and reloads income', async () => {
			api.create.mockResolvedValue({ data: {} });
			api.list.mockResolvedValue({ data: [budget('income', 10)] });

			const f = new Finances();
			await f.addBudget({ type: 'income', value: 10, title: 'Salary' } as never);

			expect(api.create).toHaveBeenCalled();
			expect(f.income).toHaveLength(1);
		});

		it('deleteBudget removes and reloads', async () => {
			api.delete.mockResolvedValue(true);
			api.list.mockResolvedValue({ data: [] });

			const f = new Finances();
			await f.deleteBudget(budget('expense', 5));

			expect(f.expenses).toHaveLength(0);
		});
	});
});
