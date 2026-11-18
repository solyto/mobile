import type { Budget, BudgetInterval } from '$lib/types/finance';
import type { FinanceRecords } from '$lib/types/translation';

const MONTHS_PER_INTERVAL: Record<BudgetInterval, number> = {
	monthly: 1,
	quarterly: 3,
	yearly: 12
};

export default class BudgetIntervalService {
	// Servers before the interval field omit it; their budgets are monthly.
	intervalOf(budget: Budget): BudgetInterval {
		return budget.interval ?? 'monthly';
	}

	monthlyAmount(budget: Budget): number {
		return budget.value / MONTHS_PER_INTERVAL[this.intervalOf(budget)];
	}

	monthlyTotal(budgets: Budget[]): number {
		return budgets.reduce((acc, budget) => acc + this.monthlyAmount(budget), 0);
	}

	sortByMonthlyAmount(budgets: Budget[]): Budget[] {
		return [...budgets].sort((a, b) => this.monthlyAmount(b) - this.monthlyAmount(a));
	}

	options(t: FinanceRecords): { label: string; value: BudgetInterval }[] {
		return [
			{ label: t.interval_monthly, value: 'monthly' },
			{ label: t.interval_quarterly, value: 'quarterly' },
			{ label: t.interval_yearly, value: 'yearly' }
		];
	}

	suffix(budget: Budget, t: FinanceRecords): string {
		const suffixes: Record<BudgetInterval, string> = {
			monthly: t.per_month,
			quarterly: t.per_quarter,
			yearly: t.per_year
		};
		return suffixes[this.intervalOf(budget)];
	}
}
