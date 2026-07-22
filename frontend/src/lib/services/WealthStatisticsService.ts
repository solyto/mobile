import type { WealthField } from '$lib/types/finance';
import { SvelteDate } from 'svelte/reactivity';
import { getUrlFormat } from '$lib/helpers/DateHelper';

export default class WealthStatisticsService {
	data: WealthField[] = [];

	setData(data: WealthField[]) {
		this.data = data;
	}

	getGraphValues(): { date: string; values: { field: string; value: number }[] }[] {
		const currentDate = new SvelteDate();
		const lastValues: Record<number, number> = {};

		for (const field of this.data) {
			if (field.currentValue) {
				lastValues[field.id] = field.currentValue.value;
			} else {
				lastValues[field.id] = 0;
			}
		}

		const refinedResult: { date: string; values: { field: string; value: number }[] }[] = [];

		const startDate = new SvelteDate(currentDate);
		startDate.setMonth(startDate.getMonth() - 11);

		const currentFieldValues: Record<number, number> = {};

		for (const field of this.data) {
			const pastValues = field.values.filter((v) => new SvelteDate(v.date) < startDate);
			pastValues.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

			if (pastValues.length > 0) {
				currentFieldValues[field.id] = pastValues[0].value;
			} else {
				currentFieldValues[field.id] = 0;
			}
		}

		for (let i = 11; i >= 0; i--) {
			const date = new SvelteDate(currentDate);
			date.setMonth(date.getMonth() - i);
			const monthStr = getUrlFormat(date).substring(0, 7); // YYYY-MM

			const entry = {
				date: getUrlFormat(date),
				values: [] as { field: string; value: number }[]
			};

			for (const field of this.data) {
				const valuesInThisMonth = field.values.filter((v) =>
					getUrlFormat(new SvelteDate(v.date)).startsWith(monthStr)
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
}
