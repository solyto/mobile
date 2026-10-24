import type {
	WealthField,
	CreateWealthFieldRequest,
	UpdateWealthFieldRequest,
	StoreFinanceValueRequest,
	UpdateFinanceValueRequest,
	FinanceValue,
	Budget,
	BudgetValue,
	CreateBudgetRequest,
	UpdateBudgetRequest
} from '$lib/types/finance';
import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class Finances {
	budgetLoaded = $state<boolean>(false);
	wealthLoaded = $state<boolean>(false);
	income = $state<Budget[]>([]);
	expenses = $state<Budget[]>([]);
	wealth = $state<WealthField[]>([]);
	budgetValues = $state<BudgetValue[]>([]);
	auth: Auth;
	apiService: ApiService;

	constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService) {
		this.auth = auth;
		this.apiService = apiService;
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
		return Promise.resolve(res);
	}

	async loadBudgetValues(budget: Budget): Promise<boolean> {
		const res = await this.apiService.list(
			apiRoutes.finances.budget.listValues.replace('%d', budget.id.toString())
		);
		if (res) this.budgetValues = res.data as BudgetValue[];
		return Promise.resolve(res !== null);
	}

	async addBudgetValue(budget: Budget, request: StoreFinanceValueRequest): Promise<boolean> {
		const res = await this.apiService.create(
			apiRoutes.finances.budget.storeValue.replace('%d', budget.id.toString()),
			request
		);
		if (res) await this.reloadBudget(budget);
		return Promise.resolve(res !== null);
	}

	async updateBudgetValue(
		budget: Budget,
		value: FinanceValue,
		request: UpdateFinanceValueRequest
	): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.finances.budget.updateValue.replace('%d', budget.id.toString()),
			value.id,
			request
		);
		if (res) await this.reloadBudget(budget);
		return Promise.resolve(res);
	}

	async deleteBudgetValue(budget: Budget, value: FinanceValue): Promise<boolean> {
		const res = await this.apiService.delete(
			apiRoutes.finances.budget.deleteValue.replace('%d', budget.id.toString()),
			value.id
		);
		if (res) await this.reloadBudget(budget);
		return Promise.resolve(res);
	}

	async addWealthField(request: CreateWealthFieldRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.finances.wealth.createField, request);
		if (res) await this.loadWealth();
		return Promise.resolve(res !== null);
	}

	async addWealthValue(field: WealthField, request: StoreFinanceValueRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.finances.wealth.storeValue,
			field.id,
			request
		);
		if (res) await this.loadWealth();
		return Promise.resolve(res);
	}

	async updateWealthValue(
		field: WealthField,
		value: FinanceValue,
		request: UpdateFinanceValueRequest
	): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.finances.wealth.updateValue.replace('%d', field.id.toString()),
			value.id,
			request
		);
		if (res) await this.loadWealth();
		return Promise.resolve(res);
	}

	async deleteWealthValue(field: WealthField, value: FinanceValue): Promise<boolean> {
		const res = await this.apiService.delete(
			apiRoutes.finances.wealth.deleteValue.replace('%d', field.id.toString()),
			value.id
		);
		if (res) await this.loadWealth();
		return Promise.resolve(res);
	}

	async updateWealthField(field: WealthField, request: UpdateWealthFieldRequest): Promise<boolean> {
		const res = await this.apiService.update(apiRoutes.finances.wealth.updateField, field.id, request);
		if (res) await this.loadWealth();
		return Promise.resolve(res);
	}

	async deleteWealthField(wealth: WealthField): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.finances.wealth.deleteField, wealth.id);
		if (res) await this.loadWealth();
		return Promise.resolve(res !== null);
	}

	private async reloadBudget(budget: Budget): Promise<void> {
		await Promise.all([this.loadIncome(), this.loadBudgetValues(budget)]);
	}
}

const FINANCES_KEY = Symbol('SOLYTO_FINANCES');

export function setFinances(): Finances {
	return setContext(FINANCES_KEY, new Finances());
}

export function getFinances(): Finances {
	return getContext<Finances>(FINANCES_KEY);
}
