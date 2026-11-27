import type {
	WealthField,
	CreateWealthFieldRequest,
	UpdateWealthFieldRequest,
	StoreFinanceValueRequest,
	UpdateFinanceValueRequest,
	FinanceValue,
	Budget,
	BudgetResponse,
	BudgetValue,
	CreateBudgetRequest,
	UpdateBudgetRequest
} from '$lib/types/finance';
import type { Tag } from '$lib/types/tag';
import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import BudgetIntervalService from '$lib/services/BudgetIntervalService';
import BudgetTagService from '$lib/services/BudgetTagService';

export class Finances {
	budgetLoaded = $state<boolean>(false);
	wealthLoaded = $state<boolean>(false);
	income = $state<Budget[]>([]);
	expenses = $state<Budget[]>([]);
	wealth = $state<WealthField[]>([]);
	budgetValues = $state<BudgetValue[]>([]);
	selectedTagId = $state<number | null>(null);
	tagsSupported = $state<boolean>(true);
	auth: Auth;
	apiService: ApiService;
	budgetIntervals = new BudgetIntervalService();
	budgetTags = new BudgetTagService();

	constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService) {
		this.auth = auth;
		this.apiService = apiService;
	}

	async loadIncome(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.finances.budget.list);
		if (res) {
			const responses = res.data as BudgetResponse[];
			const budget = this.budgetTags.fromApi(responses);
			const sorted = this.budgetIntervals.sortByMonthlyAmount(budget);
			this.income = sorted.filter((i) => i.type === 'income');
			this.expenses = sorted.filter((i) => i.type === 'expense');
			this.tagsSupported = this.budgetTags.supportsTags(responses);
			this.dropSelectedTagIfUnused();
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
		return this.getBudgetIncomeTotal() - this.getBudgetExpenseTotal();
	}

	getBudgetIncomeTotal(): number {
		return this.budgetIntervals.monthlyTotal(this.filteredIncome());
	}

	getBudgetExpenseTotal(): number {
		return this.budgetIntervals.monthlyTotal(this.filteredExpenses());
	}

	filteredIncome(): Budget[] {
		return this.budgetTags.filterByTag(this.income, this.selectedTagId);
	}

	filteredExpenses(): Budget[] {
		return this.budgetTags.filterByTag(this.expenses, this.selectedTagId);
	}

	availableTags(): Tag[] {
		return this.budgetTags.usedTags([...this.income, ...this.expenses]);
	}

	selectTag(tagId: number | null): void {
		this.selectedTagId = tagId;
	}

	async addBudget(request: CreateBudgetRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.finances.budget.create, request);
		if (res) await this.loadIncome();
		return res !== null;
	}

	async deleteBudget(budget: Budget): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.finances.budget.delete, budget.id);
		if (res) await this.loadIncome();
		return res;
	}

	async updateBudget(budget: Budget, request: UpdateBudgetRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.finances.budget.update,
			budget.id,
			request
		);
		if (res) await this.loadIncome();
		return res;
	}

	async loadBudgetValues(budget: Budget): Promise<boolean> {
		const res = await this.apiService.list(
			apiRoutes.finances.budget.listValues.replace('%d', budget.id.toString())
		);
		if (res) this.budgetValues = res.data as BudgetValue[];
		return res !== null;
	}

	async addBudgetValue(budget: Budget, request: StoreFinanceValueRequest): Promise<boolean> {
		const res = await this.apiService.create(
			apiRoutes.finances.budget.storeValue.replace('%d', budget.id.toString()),
			request
		);
		if (res) await this.reloadBudget(budget);
		return res !== null;
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
		return res;
	}

	async deleteBudgetValue(budget: Budget, value: FinanceValue): Promise<boolean> {
		const res = await this.apiService.delete(
			apiRoutes.finances.budget.deleteValue.replace('%d', budget.id.toString()),
			value.id
		);
		if (res) await this.reloadBudget(budget);
		return res;
	}

	async addWealthField(request: CreateWealthFieldRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.finances.wealth.createField, request);
		if (res) await this.loadWealth();
		return res !== null;
	}

	async addWealthValue(field: WealthField, request: StoreFinanceValueRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.finances.wealth.storeValue,
			field.id,
			request
		);
		if (res) await this.loadWealth();
		return res;
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
		return res;
	}

	async deleteWealthValue(field: WealthField, value: FinanceValue): Promise<boolean> {
		const res = await this.apiService.delete(
			apiRoutes.finances.wealth.deleteValue.replace('%d', field.id.toString()),
			value.id
		);
		if (res) await this.loadWealth();
		return res;
	}

	async updateWealthField(field: WealthField, request: UpdateWealthFieldRequest): Promise<boolean> {
		const res = await this.apiService.update(apiRoutes.finances.wealth.updateField, field.id, request);
		if (res) await this.loadWealth();
		return res;
	}

	async deleteWealthField(wealth: WealthField): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.finances.wealth.deleteField, wealth.id);
		if (res) await this.loadWealth();
		return res;
	}

	private dropSelectedTagIfUnused(): void {
		if (!this.availableTags().some((tag) => tag.id === this.selectedTagId)) this.selectedTagId = null;
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
