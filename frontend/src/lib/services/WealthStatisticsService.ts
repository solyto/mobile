import type { WealthField } from '$lib/types/finance';
import { formatMonth, getUrlFormat } from '$lib/helpers/DateHelper';

export type WealthRange = number | 'all';

export const wealthRanges = { '1y': 12, '3y': 36, '5y': 60, all: 'all' } as const satisfies Record<
	string,
	WealthRange
>;

export type WealthRangeKey = keyof typeof wealthRanges;

export type WealthGraphPoint = { date: string; values: { field: string; value: number }[] };

const MONTHS_PER_YEAR = 12;
const TREND_MIN_FACTOR = 0.95;
const TREND_MIN_STEP = 1000;

export default class WealthStatisticsService {
	getGraphValues(fields: WealthField[], range: WealthRange): WealthGraphPoint[] {
		const today = new Date();
		const firstMonth = this.getFirstMonth(fields, range, today);
		const firstMonthKey = this.monthOf(getUrlFormat(firstMonth));
		const monthCount = this.monthsBetween(firstMonth, today);

		const points: WealthGraphPoint[] = [];
		const currentFieldValues: Record<number, number> = {};

		for (const field of fields) {
			const pastValues = field.values.filter((v) => this.monthOf(v.date) < firstMonthKey);
			pastValues.sort((a, b) => b.date.localeCompare(a.date));
			currentFieldValues[field.id] = pastValues.length > 0 ? pastValues[0].value : 0;
		}

		for (let i = 0; i < monthCount; i++) {
			const date = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + i, 1);
			const monthKey = this.monthOf(getUrlFormat(date));
			const point: WealthGraphPoint = { date: getUrlFormat(date), values: [] };

			for (const field of fields) {
				const valuesInThisMonth = field.values.filter((v) => v.date.startsWith(monthKey));

				if (valuesInThisMonth.length > 0) {
					valuesInThisMonth.sort((a, b) => b.date.localeCompare(a.date));
					currentFieldValues[field.id] = valuesInThisMonth[0].value;
				}

				point.values.push({ field: field.title, value: currentFieldValues[field.id] });
			}
			points.push(point);
		}

		return points;
	}

	getTotals(points: WealthGraphPoint[]): number[] {
		return points.map((point) => point.values.reduce((sum, v) => sum + v.value, 0));
	}

	getSeriesByField(fields: WealthField[], points: WealthGraphPoint[]): { title: string; values: number[] }[] {
		if (points.length === 0) return [];

		return fields.map((field) => ({
			title: field.title,
			values: points.map((point) => point.values.find((v) => v.field === field.title)?.value ?? 0)
		}));
	}

	getDistribution(fields: WealthField[]): { name: string; value: number }[] {
		return fields.map((field) => ({ name: field.title, value: field.currentValue?.value ?? 0 }));
	}

	// Points are dated `Y-m-d`; built as a local date so the month cannot shift with the timezone.
	getMonthLabels(stats: { date: string }[], dateFormat: string | null): string[] {
		return stats.map((stat) => {
			const [year, month] = stat.date.split('-').map(Number);
			return formatMonth(new Date(year, month - 1, 1), dateFormat);
		});
	}

	// Starts just below the lowest value, so a trend does not look flat against an axis at 0.
	getTrendMin(values: number[]): number | undefined {
		if (values.length === 0) return undefined;
		const lowest = Math.min(...values);
		if (lowest <= 0) return undefined;
		return Math.floor((lowest * TREND_MIN_FACTOR) / TREND_MIN_STEP) * TREND_MIN_STEP;
	}

	private getFirstMonth(fields: WealthField[], range: WealthRange, today: Date): Date {
		if (range !== 'all') return new Date(today.getFullYear(), today.getMonth() - range + 1, 1);

		const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

		const earliest = fields
			.flatMap((field) => field.values.map((v) => v.date))
			.reduce<string | null>((min, date) => (min === null || date < min ? date : min), null);
		if (earliest === null) return currentMonth;

		const [year, month] = earliest.split('-').map(Number);
		const earliestMonth = new Date(year, month - 1, 1);
		return earliestMonth < currentMonth ? earliestMonth : currentMonth;
	}

	private monthsBetween(first: Date, last: Date): number {
		const yearDiff = last.getFullYear() - first.getFullYear();
		return yearDiff * MONTHS_PER_YEAR + last.getMonth() - first.getMonth() + 1;
	}

	private monthOf(date: string): string {
		return date.substring(0, 7);
	}
}
