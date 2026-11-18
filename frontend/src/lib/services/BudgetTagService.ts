import type { Budget, BudgetResponse } from '$lib/types/finance';
import type { Tag } from '$lib/types/tag';

export default class BudgetTagService {
	// Servers before budget tags omit the field.
	fromApi(responses: BudgetResponse[]): Budget[] {
		return responses.map((response) => ({ ...response, tags: response.tags ?? [] }));
	}

	// Without budgets there is nothing to tell an older server apart by, so tags are assumed.
	supportsTags(responses: BudgetResponse[]): boolean {
		return responses.length === 0 || responses.some((response) => response.tags !== undefined);
	}

	filterByTag(budgets: Budget[], tagId: number | null): Budget[] {
		if (tagId === null) return budgets;
		return budgets.filter((budget) => budget.tags.some((tag) => tag.id === tagId));
	}

	usedTags(budgets: Budget[]): Tag[] {
		const tags = new Map<number, Tag>();
		for (const budget of budgets) {
			for (const tag of budget.tags) tags.set(tag.id, tag);
		}
		return [...tags.values()].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
	}
}
