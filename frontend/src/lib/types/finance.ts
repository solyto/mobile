import type { Tag } from '$lib/types/tag';

export type BudgetType = 'income' | 'expense';
export type BudgetInterval = 'monthly' | 'quarterly' | 'yearly';

export interface FinanceValue {
	id: number;
	date: string;
	value: number;
}

export type WealthValue = FinanceValue;
export type BudgetValue = FinanceValue;

export interface FinanceValueForm {
	date: string;
	value: number | null;
}

export interface StoreFinanceValueRequest {
	value: number;
	date?: string;
}

export interface UpdateFinanceValueRequest {
	value?: number;
	date?: string;
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

export interface Budget {
	id: number;
	title: string;
	type: BudgetType;
	value: number;
	interval?: BudgetInterval;
	tags: Tag[];
	created_at: string;
	updated_at: string;
}

export type BudgetResponse = Omit<Budget, 'tags'> & { tags?: Tag[] };

export interface CreateBudgetRequest {
	title: string;
	type: string;
	value: number;
	interval?: BudgetInterval;
	tags?: number[];
}

export interface UpdateBudgetRequest {
	title?: string | null;
	type?: string | null;
	value?: number | null;
	interval?: BudgetInterval;
	tags?: number[];
}
