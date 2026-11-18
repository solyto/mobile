import { describe, it, expect, beforeEach } from 'vitest';
import { Finances } from '$lib/state/Finances.svelte';
import { apiRoutes } from '$lib/config/apiRoutes';
import { api, resetStoreMocks } from '../setup/storeMocks';
import type { BudgetInterval } from '$lib/types/finance';
import type { Tag } from '$lib/types/tag';

beforeEach(() => {
	resetStoreMocks();
});

function budget(type: 'income' | 'expense', value: number, interval?: BudgetInterval, tags: Tag[] = []) {
	return { id: type + value, type, value, interval, tags, title: type, created_at: '', updated_at: '' } as never;
}

function tag(id: number, name: string): Tag {
	return { id, name, color: '', created_at: '', updated_at: '' };
}

describe('Finances store', () => {
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

		it('orders each section by monthly amount, largest first', async () => {
			api.list.mockResolvedValue({
				data: [budget('expense', 120, 'yearly'), budget('expense', 15), budget('expense', 60, 'quarterly')]
			});

			const f = new Finances();
			await f.loadIncome();

			expect(f.expenses.map((e) => e.value)).toEqual([60, 15, 120]);
		});

		it('marks tags as unsupported when the server omits them', async () => {
			api.list.mockResolvedValue({
				data: [{ id: 1, type: 'income', value: 10, title: 'Salary', created_at: '', updated_at: '' }]
			});

			const f = new Finances();
			await f.loadIncome();

			expect(f.tagsSupported).toBe(false);
			expect(f.income[0].tags).toEqual([]);
		});

		it('clears the selected tag when no budget item carries it anymore', async () => {
			const solidarity = tag(1, 'solidarity');
			api.list.mockResolvedValue({ data: [budget('income', 50, undefined, [solidarity])] });
			const f = new Finances();
			await f.loadIncome();
			f.selectedTagId = solidarity.id;

			api.list.mockResolvedValue({ data: [budget('income', 50)] });
			await f.loadIncome();

			expect(f.selectedTagId).toBeNull();
		});

		it('keeps the selected tag while a budget item still carries it', async () => {
			const solidarity = tag(1, 'solidarity');
			api.list.mockResolvedValue({ data: [budget('expense', 20, undefined, [solidarity])] });
			const f = new Finances();
			await f.loadIncome();
			f.selectedTagId = solidarity.id;

			await f.loadIncome();

			expect(f.selectedTagId).toBe(solidarity.id);
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

		it('converts yearly and quarterly items to monthly amounts', () => {
			const f = new Finances();
			f.income = [budget('income', 300, 'quarterly'), budget('income', 50)];
			f.expenses = [budget('expense', 120, 'yearly'), budget('expense', 10, 'monthly')];

			expect(f.getBudgetIncomeTotal()).toBe(150);
			expect(f.getBudgetExpenseTotal()).toBe(20);
			expect(f.getBudgetTotal()).toBe(130);
		});
	});

	describe('budget totals filtered by tag', () => {
		const solidarity = tag(1, 'solidarity');
		const servers = tag(2, 'servers');

		function taggedFinances(): Finances {
			const f = new Finances();
			f.income = [budget('income', 50, 'monthly', [solidarity]), budget('income', 1000)];
			f.expenses = [
				budget('expense', 20, 'monthly', [solidarity, servers]),
				budget('expense', 120, 'yearly', [servers]),
				budget('expense', 400)
			];
			return f;
		}

		it('computes the totals from the items with the selected tag only', () => {
			const f = taggedFinances();
			f.selectedTagId = solidarity.id;

			expect(f.filteredIncome().map((i) => i.value)).toEqual([50]);
			expect(f.filteredExpenses().map((e) => e.value)).toEqual([20]);
			expect(f.getBudgetIncomeTotal()).toBe(50);
			expect(f.getBudgetExpenseTotal()).toBe(20);
			expect(f.getBudgetTotal()).toBe(30);
		});

		it('counts an item with two tags under each of them, yearly items monthly', () => {
			const f = taggedFinances();
			f.selectedTagId = servers.id;

			expect(f.filteredExpenses().map((e) => e.value)).toEqual([20, 120]);
			expect(f.getBudgetIncomeTotal()).toBe(0);
			expect(f.getBudgetExpenseTotal()).toBe(30);
			expect(f.getBudgetTotal()).toBe(-30);
		});

		it('computes the totals from every item when no tag is selected', () => {
			const f = taggedFinances();

			expect(f.filteredIncome()).toHaveLength(2);
			expect(f.filteredExpenses()).toHaveLength(3);
			expect(f.getBudgetIncomeTotal()).toBe(1050);
			expect(f.getBudgetExpenseTotal()).toBe(430);
			expect(f.getBudgetTotal()).toBe(620);
		});

		it('offers only the tags used on a budget item', () => {
			const f = taggedFinances();

			expect(f.availableTags()).toEqual([servers, solidarity]);
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

	describe('value history', () => {
		const salary = { id: 7, type: 'income', value: 10, title: 'Salary', created_at: '', updated_at: '' } as never;
		const cash = { id: 3, title: 'Cash', values: [], currentValue: null, created_at: '', updated_at: '' } as never;
		const entry = { id: 42, date: '2026-10-01', value: 10 };

		it('loadBudgetValues fetches the values of one budget item', async () => {
			api.list.mockResolvedValue({ data: [entry] });

			const f = new Finances();
			await f.loadBudgetValues(salary);

			expect(api.list).toHaveBeenCalledWith(apiRoutes.finances.budget.listValues.replace('%d', '7'));
			expect(f.budgetValues).toEqual([entry]);
		});

		it('addBudgetValue posts to the item and reloads budget and its values', async () => {
			api.create.mockResolvedValue({ data: entry });
			api.list.mockResolvedValue({ data: [] });

			const f = new Finances();
			const ok = await f.addBudgetValue(salary, { value: 10, date: '2026-10-01' });

			expect(ok).toBe(true);
			expect(api.create).toHaveBeenCalledWith(
				apiRoutes.finances.budget.storeValue.replace('%d', '7'),
				{ value: 10, date: '2026-10-01' }
			);
			expect(api.list).toHaveBeenCalledWith(apiRoutes.finances.budget.list);
			expect(api.list).toHaveBeenCalledWith(apiRoutes.finances.budget.listValues.replace('%d', '7'));
		});

		it('updateBudgetValue and deleteBudgetValue fill the budget id before the value id', async () => {
			api.update.mockResolvedValue(true);
			api.delete.mockResolvedValue(true);
			api.list.mockResolvedValue({ data: [] });

			const f = new Finances();
			await f.updateBudgetValue(salary, entry, { value: 11 });
			await f.deleteBudgetValue(salary, entry);

			expect(api.update).toHaveBeenCalledWith(apiRoutes.finances.budget.updateValue.replace('%d', '7'), 42, { value: 11 });
			expect(api.delete).toHaveBeenCalledWith(apiRoutes.finances.budget.deleteValue.replace('%d', '7'), 42);
		});

		it('does not reload when a budget value change is rejected', async () => {
			api.delete.mockResolvedValue(false);

			const f = new Finances();
			const ok = await f.deleteBudgetValue(salary, entry);

			expect(ok).toBe(false);
			expect(api.list).not.toHaveBeenCalled();
		});

		it('updateWealthValue and deleteWealthValue address the value of the field and reload wealth', async () => {
			api.update.mockResolvedValue(true);
			api.delete.mockResolvedValue(true);
			api.list.mockResolvedValue({ data: [] });

			const f = new Finances();
			await f.updateWealthValue(cash, entry, { date: '2026-09-30' });
			await f.deleteWealthValue(cash, entry);

			expect(api.update).toHaveBeenCalledWith(apiRoutes.finances.wealth.updateValue.replace('%d', '3'), 42, { date: '2026-09-30' });
			expect(api.delete).toHaveBeenCalledWith(apiRoutes.finances.wealth.deleteValue.replace('%d', '3'), 42);
			expect(api.list).toHaveBeenCalledWith(apiRoutes.finances.wealth.listFields);
		});

		it('addWealthValue sends the optional date to the store endpoint', async () => {
			api.update.mockResolvedValue(true);
			api.list.mockResolvedValue({ data: [] });

			const f = new Finances();
			await f.addWealthValue(cash, { value: 5, date: '2026-01-02' });

			expect(api.update).toHaveBeenCalledWith(apiRoutes.finances.wealth.storeValue, 3, { value: 5, date: '2026-01-02' });
		});

		it('addWealthValue reports a rejected add and does not reload', async () => {
			api.update.mockResolvedValue(false);

			const f = new Finances();
			const ok = await f.addWealthValue(cash, { value: 5, date: '2026-01-02' });

			expect(ok).toBe(false);
			expect(api.list).not.toHaveBeenCalled();
		});

		it('loadBudgetValues reports a failed load', async () => {
			api.list.mockResolvedValue(null);

			const f = new Finances();
			const ok = await f.loadBudgetValues(salary);

			expect(ok).toBe(false);
		});
	});
});
