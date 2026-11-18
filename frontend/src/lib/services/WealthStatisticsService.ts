import type { WealthField } from '$lib/types/finance';
import { formatMonth, getUrlFormat } from '$lib/helpers/DateHelper';

export type WealthRange = number | 'all';

export const wealthRanges = { '1y': 12, '3y': 36, '5y': 60, all: 'all' } as const satisfies Record<
	string,
	WealthRange
>;

export type WealthRangeKey = keyof typeof wealthRanges;

export default class WealthStatisticsService {
	data: WealthField[] = [];

	setData(data: WealthField[]) {
		this.data = data;
	}

	getGraphValues(range: WealthRange): { date: string; values: { field: string; value: number }[] }[] {
		const today = new Date();
		const firstMonth = this.getFirstMonth(range, today);
		const monthCount =
			(today.getFullYear() - firstMonth.getFullYear()) * 12 + today.getMonth() - firstMonth.getMonth() + 1;
		const firstMonthStr = getUrlFormat(firstMonth).substring(0, 7);

		const refinedResult: { date: string; values: { field: string; value: number }[] }[] = [];
		const currentFieldValues: Record<number, number> = {};

		for (const field of this.data) {
			const pastValues = field.values.filter((v) => v.date.substring(0, 7) < firstMonthStr);
			pastValues.sort((a, b) => b.date.localeCompare(a.date));
			currentFieldValues[field.id] = pastValues.length > 0 ? pastValues[0].value : 0;
		}

		for (let i = 0; i < monthCount; i++) {
			const date = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + i, 1);
			const monthStr = getUrlFormat(date).substring(0, 7);

			const entry = {
				date: getUrlFormat(date),
				values: [] as { field: string; value: number }[]
			};

			for (const field of this.data) {
				const valuesInThisMonth = field.values.filter((v) => v.date.startsWith(monthStr));

				if (valuesInThisMonth.length > 0) {
					valuesInThisMonth.sort((a, b) => b.date.localeCompare(a.date));
					currentFieldValues[field.id] = valuesInThisMonth[0].value;
				}

				entry.values.push({ field: field.title, value: currentFieldValues[field.id] });
			}
			refinedResult.push(entry);
		}

		return refinedResult;
	}

	private getFirstMonth(range: WealthRange, today: Date): Date {
		if (range !== 'all') return new Date(today.getFullYear(), today.getMonth() - range + 1, 1);

		const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

		const earliest = this.data
			.flatMap((field) => field.values.map((v) => v.date))
			.reduce<string | null>((min, date) => (min === null || date < min ? date : min), null);
		if (earliest === null) return currentMonth;

		const [year, month] = earliest.split('-').map(Number);
		const earliestMonth = new Date(year, month - 1, 1);
		return earliestMonth < currentMonth ? earliestMonth : currentMonth;
	}

	// Points are dated `Y-m-d`; built as a local date so the month cannot shift with the timezone.
	getMonthLabels(stats: { date: string }[], dateFormat: string | null): string[] {
		return stats.map((stat) => {
			const [year, month] = stat.date.split('-').map(Number);
			return formatMonth(new Date(year, month - 1, 1), dateFormat);
		});
	}

	// Lower y-axis bound for trend charts: just below the lowest value, so changes stay
	// visible instead of the line looking flat against an axis that starts at 0.
	getTrendMin(values: number[]): number | undefined {
		if (values.length === 0) return undefined;
		const lowest = Math.min(...values);
		if (lowest <= 0) return undefined;
		return Math.floor((lowest * 0.95) / 1000) * 1000;
	}
}
