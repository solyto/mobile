import { describe, it, expect } from 'vitest';
import BudgetIntervalService from '$lib/services/BudgetIntervalService';
import type { Budget, BudgetInterval } from '$lib/types/finance';
import { en } from '$lib/i18n/en';
import { budget as budgetItem } from '../helpers/factories';

const service = new BudgetIntervalService();

function budget(id: number, value: number, interval?: BudgetInterval): Budget {
	return budgetItem({ id, title: 'Item', value, interval });
}

describe('BudgetIntervalService', () => {
	describe('monthlyAmount', () => {
		it('keeps a monthly value', () => {
			expect(service.monthlyAmount(budget(1, 10, 'monthly'))).toBe(10);
		});

		it('divides a quarterly value by 3', () => {
			expect(service.monthlyAmount(budget(1, 30, 'quarterly'))).toBe(10);
		});

		it('divides a yearly value by 12', () => {
			expect(service.monthlyAmount(budget(1, 120, 'yearly'))).toBe(10);
		});

		it('treats a budget without interval as monthly', () => {
			expect(service.intervalOf(budget(1, 10))).toBe('monthly');
			expect(service.monthlyAmount(budget(1, 10))).toBe(10);
		});

		it('does not round', () => {
			expect(service.monthlyAmount(budget(1, 100, 'yearly'))).toBe(100 / 12);
		});
	});

	describe('monthlyTotal', () => {
		it('sums monthly amounts across mixed intervals', () => {
			expect(service.monthlyTotal([budget(1, 120, 'yearly'), budget(2, 10, 'monthly'), budget(3, 30, 'quarterly'), budget(4, 5)])).toBe(35);
		});

		it('keeps the unrounded sum so yearly items do not drift', () => {
			const items = Array.from({ length: 12 }, (_, i) => budget(i, 100, 'yearly'));
			expect(service.monthlyTotal(items)).toBeCloseTo(100, 10);
		});

		it('is zero for no budgets', () => {
			expect(service.monthlyTotal([])).toBe(0);
		});
	});

	describe('sortByMonthlyAmount', () => {
		it('puts the largest monthly amount first without changing the input', () => {
			const input = [budget(1, 120, 'yearly'), budget(2, 50), budget(3, 90, 'quarterly')];

			expect(service.sortByMonthlyAmount(input).map((b) => b.id)).toEqual([2, 3, 1]);
			expect(input.map((b) => b.id)).toEqual([1, 2, 3]);
		});
	});

	describe('labels', () => {
		it('offers the three intervals in order', () => {
			expect(service.options(en.finances).map((o) => o.value)).toEqual(['monthly', 'quarterly', 'yearly']);
		});

		it('picks the suffix of the entered interval', () => {
			expect(service.suffix(budget(1, 120, 'yearly'), en.finances)).toBe(en.finances.per_year);
			expect(service.suffix(budget(1, 30, 'quarterly'), en.finances)).toBe(en.finances.per_quarter);
			expect(service.suffix(budget(1, 10), en.finances)).toBe(en.finances.per_month);
		});
	});
});
