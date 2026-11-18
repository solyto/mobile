import { describe, it, expect } from 'vitest';
import BudgetTagService from '$lib/services/BudgetTagService';
import type { Budget, BudgetResponse } from '$lib/types/finance';
import type { Tag } from '$lib/types/tag';

const service = new BudgetTagService();

function tag(id: number, name: string): Tag {
	return { id, name, color: '', created_at: '', updated_at: '' };
}

function budget(id: number, tags: Tag[]): Budget {
	return { id, title: 'Item', type: 'expense', value: 10, tags, created_at: '', updated_at: '' };
}

const solidarity = tag(1, 'solidarity');
const housing = tag(2, 'Housing');

describe('BudgetTagService', () => {
	describe('fromApi', () => {
		it('gives a budget without tags from an older server an empty list', () => {
			const response: BudgetResponse = { id: 1, title: 'Rent', type: 'expense', value: 500, created_at: '', updated_at: '' };

			expect(service.fromApi([response])[0].tags).toEqual([]);
		});

		it('keeps the tags the server sends', () => {
			const response: BudgetResponse = { id: 1, title: 'Rent', type: 'expense', value: 500, tags: [housing], created_at: '', updated_at: '' };

			expect(service.fromApi([response])[0].tags).toEqual([housing]);
		});
	});

	describe('supportsTags', () => {
		const tagged: BudgetResponse = { id: 1, title: 'Rent', type: 'expense', value: 500, tags: [], created_at: '', updated_at: '' };
		const untagged: BudgetResponse = { id: 2, title: 'Rent', type: 'expense', value: 500, created_at: '', updated_at: '' };

		it('is true when the server sends the tags field', () => {
			expect(service.supportsTags([tagged])).toBe(true);
		});

		it('is false when an older server omits it', () => {
			expect(service.supportsTags([untagged])).toBe(false);
		});

		it('assumes support when there are no budgets to tell by', () => {
			expect(service.supportsTags([])).toBe(true);
		});
	});

	describe('filterByTag', () => {
		const budgets = [budget(1, [solidarity]), budget(2, []), budget(3, [housing, solidarity]), budget(4, [housing])];

		it('returns every budget when no tag is selected', () => {
			expect(service.filterByTag(budgets, null)).toBe(budgets);
		});

		it('keeps only the budgets carrying the tag', () => {
			expect(service.filterByTag(budgets, solidarity.id).map((b) => b.id)).toEqual([1, 3]);
			expect(service.filterByTag(budgets, housing.id).map((b) => b.id)).toEqual([3, 4]);
		});

		it('returns nothing for a tag no budget carries', () => {
			expect(service.filterByTag(budgets, 99)).toEqual([]);
		});
	});

	describe('usedTags', () => {
		it('lists each used tag once, sorted by name', () => {
			const budgets = [budget(1, [solidarity]), budget(2, []), budget(3, [solidarity, housing])];

			expect(service.usedTags(budgets)).toEqual([housing, solidarity]);
		});

		it('is empty when no budget is tagged', () => {
			expect(service.usedTags([budget(1, [])])).toEqual([]);
		});
	});
});
