import type { WealthField } from '$lib/types/finance';
import { formatMonth, getUrlFormat } from '$lib/helpers/DateHelper';

export default class WealthStatisticsService {
	data: WealthField[] = [];

	setData(data: WealthField[]) {
		this.data = data;
	}

	getGraphValues(): { date: string; values: { field: string; value: number }[] }[] {
		const currentDate = new Date();
		const lastValues: Record<number, number> = {};

		for (const field of this.data) {
			if (field.currentValue) {
				lastValues[field.id] = field.currentValue.value;
			} else {
				lastValues[field.id] = 0;
			}
		}

		const refinedResult: { date: string; values: { field: string; value: number }[] }[] = [];

		const startDate = new Date(currentDate);
		startDate.setMonth(startDate.getMonth() - 11);

		const currentFieldValues: Record<number, number> = {};

		for (const field of this.data) {
			const pastValues = field.values.filter((v) => new Date(v.date) < startDate);
			pastValues.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

			if (pastValues.length > 0) {
				currentFieldValues[field.id] = pastValues[0].value;
			} else {
				currentFieldValues[field.id] = 0;
			}
		}

		for (let i = 11; i >= 0; i--) {
			const date = new Date(currentDate);
			date.setMonth(date.getMonth() - i);
			const monthStr = getUrlFormat(date).substring(0, 7); // YYYY-MM

			const entry = {
				date: getUrlFormat(date),
				values: [] as { field: string; value: number }[]
			};

			for (const field of this.data) {
				const valuesInThisMonth = field.values.filter((v) =>
					getUrlFormat(new Date(v.date)).startsWith(monthStr)
				);

				if (valuesInThisMonth.length > 0) {
					valuesInThisMonth.sort(
						(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
					);
					currentFieldValues[field.id] = valuesInThisMonth[0].value;
				}

				entry.values.push({ field: field.title, value: currentFieldValues[field.id] });
			}
			refinedResult.push(entry);
		}

		return refinedResult;
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
