import { describe, it, expect } from 'vitest';
import FinanceHistoryService from '$lib/services/FinanceHistoryService';
import type { FinanceValue } from '$lib/types/finance';

const service = new FinanceHistoryService();

function entry(id: number, date: string, value: number): FinanceValue {
	return { id, date, value };
}

const values = [
	entry(1, '2026-03-01T00:00:00.000000Z', 100),
	entry(2, '2026-10-15T00:00:00.000000Z', 300),
	entry(3, '2026-07-20', 200)
];

describe('FinanceHistoryService', () => {
	describe('toDateString', () => {
		it('reads the calendar day from an ISO timestamp and from a plain date', () => {
			expect(service.toDateString(values[0])).toBe('2026-03-01');
			expect(service.toDateString(values[2])).toBe('2026-07-20');
		});
	});

	describe('toLocalDate', () => {
		it('returns local midnight of the calendar day', () => {
			const date = service.toLocalDate(values[1]);
			expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2026, 9, 15, 0]);
		});
	});

	describe('sorting', () => {
		it('sorts newest first without mutating the input', () => {
			expect(service.sortNewestFirst(values).map((v) => v.id)).toEqual([2, 3, 1]);
			expect(values.map((v) => v.id)).toEqual([1, 2, 3]);
		});

		it('sorts oldest first', () => {
			expect(service.sortOldestFirst(values).map((v) => v.id)).toEqual([1, 3, 2]);
		});
	});

	describe('findByDate', () => {
		it('finds the value on a day regardless of the date format', () => {
			expect(service.findByDate(values, '2026-10-15')?.id).toBe(2);
			expect(service.findByDate(values, '2026-07-20')?.id).toBe(3);
		});

		it('returns null when the day has no value', () => {
			expect(service.findByDate(values, '2026-01-01')).toBeNull();
		});
	});

	describe('findOtherByDate', () => {
		it('ignores the value being edited', () => {
			expect(service.findOtherByDate(values, '2026-07-20', 3)).toBeNull();
			expect(service.findOtherByDate(values, '2026-07-20', 1)?.id).toBe(3);
		});
	});

	describe('forms and requests', () => {
		it('starts an empty form on the given day', () => {
			expect(service.emptyForm(new Date(2026, 9, 15, 13, 30))).toEqual({ date: '2026-10-15', value: null });
		});

		it('round-trips a value through the form into a request', () => {
			const form = service.toForm(values[1]);
			expect(form).toEqual({ date: '2026-10-15', value: 300 });
			expect(service.toRequest(form)).toEqual({ date: '2026-10-15', value: 300 });
		});

		it('keeps zero and negative amounts', () => {
			expect(service.toRequest({ date: '2026-10-15', value: 0 })).toEqual({ date: '2026-10-15', value: 0 });
			expect(service.toRequest({ date: '2026-10-15', value: -12.5 })).toEqual({ date: '2026-10-15', value: -12.5 });
		});

		it('rejects a form without an amount or a date', () => {
			expect(service.toRequest({ date: '2026-10-15', value: null })).toBeNull();
			expect(service.toRequest({ date: '2026-10-15', value: NaN })).toBeNull();
			expect(service.toRequest({ date: '', value: 10 })).toBeNull();
		});
	});

	describe('chart series', () => {
		it('builds categories and values oldest first', () => {
			expect(service.chartCategories(values, null)).toEqual(['01.03.2026', '20.07.2026', '15.10.2026']);
			expect(service.chartValues(values)).toEqual([100, 200, 300]);
		});

		it('formats the dates in the given date format', () => {
			expect(service.chartCategories(values, 'YYYY/mm/dd')).toEqual(['2026/03/01', '2026/07/20', '2026/10/15']);
		});

		it('returns empty series for an empty history', () => {
			expect(service.chartCategories([], null)).toEqual([]);
			expect(service.chartValues([])).toEqual([]);
		});
	});
});
