import { describe, it, expect } from 'vitest';
import WealthStatisticsService from '$lib/services/WealthStatisticsService';
import type { WealthField } from '$lib/types/finance';

const service = new WealthStatisticsService();

function ymd(d: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function monthsAgo(n: number, day = 15): string {
	const d = new Date();
	d.setMonth(d.getMonth() - n);
	d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
	return ymd(d);
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
	it('returns one entry per month for the last 12 months, ending at the current month', () => {
		service.setData([field(1, 'Cash')]);
		const result = service.getGraphValues();

		expect(result).toHaveLength(12);
		expect(result.map((e) => e.date)).toEqual([...result.map((e) => e.date)].sort());
		expect(result[result.length - 1].date).toBe(ymd(new Date()));
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
		const result = service.getGraphValues();
		const last = result[result.length - 1];

		expect(last.values).toContainEqual({ field: 'Cash', value: 90 });
		expect(last.values).toContainEqual({ field: 'Stocks', value: 0 });
	});

	it('carries the latest value of a month through the graph', () => {
		const twoMonthsAgo = monthsAgo(2);
		service.setData([field(1, 'Cash', { values: [{ id: 1, date: twoMonthsAgo, value: 50 }] })]);
		const result = service.getGraphValues();
		const month = result.find((e) => e.date.startsWith(twoMonthsAgo.substring(0, 7)));

		expect(month?.values).toContainEqual({ field: 'Cash', value: 50 });
	});

	it('uses the last value before the 12-month window as a baseline', () => {
		const thirteenMonthsAgo = monthsAgo(13);
		service.setData([
			field(1, 'Cash', { values: [{ id: 1, date: thirteenMonthsAgo, value: 7 }] })
		]);
		const result = service.getGraphValues();

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
		const result = service.getGraphValues();
		const last = result[result.length - 1];

		expect(last.values).toContainEqual({ field: 'Cash', value: 20 });
	});
});
