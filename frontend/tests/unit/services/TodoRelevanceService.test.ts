import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import TodoRelevanceService from '$lib/services/TodoRelevanceService';
import { todo } from '../helpers/factories';

const service = new TodoRelevanceService();

// maxScore = priority(100) + effort(50) + overdue(100) + old(50) = 300
const FIXED_NOW = new Date(2025, 7, 15, 12, 0, 0); // Aug 15 2025, TZ=UTC

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
	vi.useRealTimers();
});

describe('getScoredTodos', () => {
	it('assigns relevance 1 to a maxed-out todo', () => {
		const t = todo({
			priority: 'high',
			effort: 'low',
			due_at: '2000-01-01', // overdue
			created_at: '2000-01-01' // old
		});
		const [scored] = service.getScoredTodos([t]);
		expect(scored.relevance).toBe(1);
	});

	it('assigns relevance 0 to a low-priority, no-due, fresh todo', () => {
		const t = todo({ priority: 'low', effort: 'high', due_at: '', created_at: '2025-08-15' });
		const [scored] = service.getScoredTodos([t]);
		expect(scored.relevance).toBe(0);
	});

	it('adds the overdue modifier for past due dates', () => {
		const t = todo({
			priority: 'low',
			effort: null,
			due_at: '2025-08-14',
			created_at: '2025-08-15'
		});
		const [scored] = service.getScoredTodos([t]);
		// 0 + 0 + 100 + 0 = 100
		expect(scored.relevance).toBe(100 / 300);
	});

	it('adds the today modifier for a due date today', () => {
		const t = todo({
			priority: 'low',
			effort: null,
			due_at: '2025-08-15',
			created_at: '2025-08-15'
		});
		const [scored] = service.getScoredTodos([t]);
		expect(scored.relevance).toBe(50 / 300);
	});

	it('adds the tomorrow modifier for a due date tomorrow', () => {
		const t = todo({
			priority: 'low',
			effort: null,
			due_at: '2025-08-16',
			created_at: '2025-08-15'
		});
		const [scored] = service.getScoredTodos([t]);
		expect(scored.relevance).toBe(25 / 300);
	});

	it('adds the old modifier for todos created more than 30 days ago', () => {
		const t = todo({ priority: 'low', effort: null, due_at: '', created_at: '2025-07-01' });
		const [scored] = service.getScoredTodos([t]);
		expect(scored.relevance).toBe(50 / 300);
	});

	it('gives null effort no effort modifier (like high effort)', () => {
		const nullEffort = service.getScoredTodos([
			todo({ priority: 'medium', effort: null, due_at: '', created_at: '2025-08-15' })
		])[0];
		const highEffort = service.getScoredTodos([
			todo({ priority: 'medium', effort: 'high', due_at: '', created_at: '2025-08-15' })
		])[0];
		const mediumEffort = service.getScoredTodos([
			todo({ priority: 'medium', effort: 'medium', due_at: '', created_at: '2025-08-15' })
		])[0];
		expect(nullEffort.relevance).toBe(highEffort.relevance);
		expect(mediumEffort.relevance).toBe(75 / 300); // priority 50 + effort 25
	});

	it('returns a new array', () => {
		const t = todo({ priority: 'high', due_at: '2000-01-01', created_at: '2000-01-01' });
		const result = service.getScoredTodos([t]);
		expect(result).not.toBe([t]);
	});
});
