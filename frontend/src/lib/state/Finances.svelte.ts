import type {
	WealthField,
	CreateWealthFieldRequest,
	UpdateWealthValueRequest,
	Budget,
	CreateBudgetRequest,
	UpdateBudgetRequest,
	FinancePage
} from '$lib/types/finance';
import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import { page } from '$app/state';

export class Finances {
	budgetLoaded = $state<boolean>(false);
	wealthLoaded = $state<boolean>(false);
	income = $state<Budget[]>([]);
	expenses = $state<Budget[]>([]);
	wealth = $state<WealthField[]>([]);
	activePage = $state<FinancePage>(null);
	auth = getAuth();
	apiService: ApiService;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
		this.activePage = this.getActivePage();
	}

	async loadIncome(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.finances.budget.list);
		if (res) {
			const budget = res.data as Budget[];
			this.income = budget.filter((i) => i.type === 'income');
			this.expenses = budget.filter((i) => i.type === 'expense');
			this.budgetLoaded = true;
		}
	}

	async loadWealth(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.finances.wealth.listFields);
		if (res) {
			this.wealth = res.data as WealthField[];
			this.wealthLoaded = true;
		}
	}

	getActivePage(): FinancePage {
		if (page.url.pathname.includes('wealth')) return 'wealth';
		if (page.url.pathname.includes('budget')) return 'budget';
		return null;
	}

	getWealthSum(): number {
		let sum = 0;
		for (const wealth of this.wealth) {
			if (wealth.currentValue) {
				sum += wealth.currentValue.value;
			}
		}

		return sum;
	}

	getBudgetTotal(): number {
		return (
			this.income.reduce((acc, i) => acc + i.value, 0) -
			this.expenses.reduce((acc, e) => acc + e.value, 0)
		);
	}

	getBudgetIncomeTotal(): number {
		return this.income.reduce((acc, i) => acc + i.value, 0);
	}

	getBudgetExpenseTotal(): number {
		return this.expenses.reduce((acc, e) => acc + e.value, 0);
	}

	async addBudget(request: CreateBudgetRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.finances.budget.create, request);
		if (res) await this.loadIncome();
		return Promise.resolve(res !== null);
	}

	async deleteBudget(budget: Budget): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.finances.budget.delete, budget.id);
		if (res) await this.loadIncome();
		return Promise.resolve(res !== null);
	}

	async updateBudget(budget: Budget, request: UpdateBudgetRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.finances.budget.update,
			budget.id,
			request
		);
		if (res) await this.loadIncome();
		return Promise.resolve(res !== null);
	}

	async addWealthField(request: CreateWealthFieldRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.finances.wealth.createField, request);
		if (res) await this.loadWealth();
		return Promise.resolve(res !== null);
	}

	async addWealthValue(field: WealthField, request: UpdateWealthValueRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.finances.wealth.updateValue,
			field.id,
			request
		);
		if (res) await this.loadWealth();
		return Promise.resolve(res !== null);
	}

	async deleteWealthField(wealth: WealthField): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.finances.wealth.deleteField, wealth.id);
		if (res) await this.loadWealth();
		return Promise.resolve(res !== null);
	}
}

const FINANCES_KEY = Symbol('SOLYTO_FINANCES');

export function setFinances(): Finances {
	return setContext(FINANCES_KEY, new Finances());
}

export function getFinances(): Finances {
	return getContext<Finances>(FINANCES_KEY);
}
