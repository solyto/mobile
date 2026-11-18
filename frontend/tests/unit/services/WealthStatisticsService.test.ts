import { describe, it, expect, afterEach, vi } from 'vitest';
import WealthStatisticsService from '$lib/services/WealthStatisticsService';
import type { WealthField } from '$lib/types/finance';

const service = new WealthStatisticsService();

function ymd(d: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function monthsAgo(n: number, day = 15): string {
	const now = new Date();
	const lastDay = new Date(now.getFullYear(), now.getMonth() - n + 1, 0).getDate();
	return ymd(new Date(now.getFullYear(), now.getMonth() - n, Math.min(day, lastDay)));
}

function field(id: number, title: string, overrides: Partial<WealthField> = {}): WealthField {
	return {
		id,
		title,
		values: [],
		currentValue: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

describe('getGraphValues', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it.each([
		[12, 12],
		[36, 36],
		[60, 60]
	])('returns %i months as %i points, ending at the current month', (range, points) => {
		service.setData([field(1, 'Cash')]);
		const result = service.getGraphValues(range);

		expect(result).toHaveLength(points);
		expect(result.map((e) => e.date)).toEqual([...result.map((e) => e.date)].sort());
		expect(result[result.length - 1].date).toBe(`${ymd(new Date()).substring(0, 7)}-01`);
	});

	it('builds consecutive months when today is the 31st', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 2, 31, 12));
		service.setData([field(1, 'Cash')]);
		const result = service.getGraphValues(12);

		expect(result.map((e) => e.date)).toEqual([
			'2025-04-01',
			'2025-05-01',
			'2025-06-01',
			'2025-07-01',
			'2025-08-01',
			'2025-09-01',
			'2025-10-01',
			'2025-11-01',
			'2025-12-01',
			'2026-01-01',
			'2026-02-01',
			'2026-03-01'
		]);
	});

	it('starts "all" at the month of the earliest value of any field', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 10, 17, 12));
		service.setData([
			field(1, 'Cash', { values: [{ id: 1, date: '2024-05-20', value: 5 }] }),
			field(2, 'Stocks', { values: [{ id: 2, date: '2022-08-31', value: 3 }] })
		]);
		const result = service.getGraphValues('all');

		expect(result[0].date).toBe('2022-08-01');
		expect(result[0].values).toEqual([
			{ field: 'Cash', value: 0 },
			{ field: 'Stocks', value: 3 }
		]);
		expect(result[result.length - 1].date).toBe('2026-11-01');
		expect(result).toHaveLength(52);
	});

	it('returns only the current month for "all" without any values', () => {
		service.setData([field(1, 'Cash')]);
		const result = service.getGraphValues('all');

		expect(result).toHaveLength(1);
	});

	it('carries a value from before the range into the first point', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 10, 17, 12));
		service.setData([
			field(1, 'Cash', {
				values: [
					{ id: 1, date: '2023-01-10', value: 4 },
					{ id: 2, date: '2023-10-31', value: 8 }
				]
			})
		]);
		const result = service.getGraphValues(36);

		expect(result[0].date).toBe('2023-12-01');
		expect(result[0].values).toEqual([{ field: 'Cash', value: 8 }]);
	});

	it('uses the current value in the current month and 0 for fields without values', () => {
		const now = new Date();
		service.setData([
			field(1, 'Cash', {
				currentValue: { id: 1, date: ymd(now), value: 90 },
				values: [{ id: 1, date: ymd(now), value: 90 }]
			}),
			field(2, 'Stocks')
		]);
		const result = service.getGraphValues(12);
		const last = result[result.length - 1];

		expect(last.values).toContainEqual({ field: 'Cash', value: 90 });
		expect(last.values).toContainEqual({ field: 'Stocks', value: 0 });
	});

	it('carries the latest value of a month through the graph', () => {
		const twoMonthsAgo = monthsAgo(2);
		service.setData([field(1, 'Cash', { values: [{ id: 1, date: twoMonthsAgo, value: 50 }] })]);
		const result = service.getGraphValues(12);
		const month = result.find((e) => e.date.startsWith(twoMonthsAgo.substring(0, 7)));

		expect(month?.values).toContainEqual({ field: 'Cash', value: 50 });
	});

	it('uses the last value before the 12-month window as a baseline', () => {
		const thirteenMonthsAgo = monthsAgo(13);
		service.setData([
			field(1, 'Cash', { values: [{ id: 1, date: thirteenMonthsAgo, value: 7 }] })
		]);
		const result = service.getGraphValues(12);

		expect(result.every((e) => e.values[0].value === 7)).toBe(true);
	});

	it('takes the most recent value within a month', () => {
		const now = new Date();
		const month = ymd(now).substring(0, 7);
		service.setData([
			field(1, 'Cash', {
				values: [
					{ id: 1, date: `${month}-01`, value: 10 },
					{ id: 2, date: `${month}-20`, value: 20 }
				]
			})
		]);
		const result = service.getGraphValues(12);
		const last = result[result.length - 1];

		expect(last.values).toContainEqual({ field: 'Cash', value: 20 });
	});
});

describe('WealthStatisticsService.getTrendMin', () => {
	it('returns a bound just below the lowest value, rounded down to the thousand', () => {
		expect(service.getTrendMin([205000, 195000, 200000])).toBe(185000);
	});

	it('returns undefined when there are no values', () => {
		expect(service.getTrendMin([])).toBeUndefined();
	});

	it('returns undefined when the lowest value is zero or negative', () => {
		expect(service.getTrendMin([1000, 0])).toBeUndefined();
		expect(service.getTrendMin([1000, -500])).toBeUndefined();
	});
});

describe('getMonthLabels', () => {
	it('labels each point with its month in the given date format', () => {
		const stats = [{ date: '2025-11-01' }, { date: '2026-01-31' }];
		expect(service.getMonthLabels(stats, null)).toEqual(['11.2025', '01.2026']);
		expect(service.getMonthLabels(stats, 'YYYY-mm-dd')).toEqual(['2025-11', '2026-01']);
	});
});
