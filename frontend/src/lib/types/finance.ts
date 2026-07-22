export type FinancePage = 'wealth' | 'budget' | null;
export type BudgetType = 'income' | 'expense';

export interface WealthValue {
	id: number;
	date: string;
	value: number;
}

export interface WealthField {
	id: number;
	title: string;
	values: WealthValue[];
	currentValue: WealthValue | null;
	created_at: string;
	updated_at: string;
}

export interface CreateWealthFieldRequest {
	title: string;
}

export interface UpdateWealthFieldRequest {
	title: string;
}

export interface UpdateWealthValueRequest {
	value: number;
}

export interface Budget {
	id: number;
	title: string;
	type: BudgetType;
	value: number;
	created_at: string;
	updated_at: string;
}

export interface CreateBudgetRequest {
	title: string;
	type: string;
	value: number;
}

export interface UpdateBudgetRequest {
	title?: string | null;
	type?: string | null;
	value?: number | null;
}
