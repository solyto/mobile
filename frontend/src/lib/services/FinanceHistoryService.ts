import type {
	FinanceValue,
	FinanceValueForm,
	StoreFinanceValueRequest
} from '$lib/types/finance';
import { formatDate, getUrlFormat } from '$lib/helpers/DateHelper';

export default class FinanceHistoryService {
	// The API sends `date` either as `Y-m-d` or as an ISO timestamp at midnight UTC;
	// the calendar day is always the first ten characters.
	toDateString(value: FinanceValue): string {
		return value.date.substring(0, 10);
	}

	toLocalDate(value: FinanceValue): Date {
		const [year, month, day] = this.toDateString(value).split('-').map(Number);
		return new Date(year, month - 1, day);
	}

	sortNewestFirst(values: FinanceValue[]): FinanceValue[] {
		return [...values].sort((a, b) => this.toDateString(b).localeCompare(this.toDateString(a)));
	}

	sortOldestFirst(values: FinanceValue[]): FinanceValue[] {
		return this.sortNewestFirst(values).reverse();
	}

	findByDate(values: FinanceValue[], date: string): FinanceValue | null {
		return values.find((value) => this.toDateString(value) === date) ?? null;
	}

	findOtherByDate(values: FinanceValue[], date: string, exceptId: number): FinanceValue | null {
		return values.find((value) => value.id !== exceptId && this.toDateString(value) === date) ?? null;
	}

	emptyForm(today: Date): FinanceValueForm {
		return { date: getUrlFormat(today), value: null };
	}

	toForm(value: FinanceValue): FinanceValueForm {
		return { date: this.toDateString(value), value: value.value };
	}

	toRequest(form: FinanceValueForm): StoreFinanceValueRequest | null {
		if (form.value === null || !Number.isFinite(form.value) || form.date === '') return null;
		return { value: form.value, date: form.date };
	}

	chartCategories(values: FinanceValue[], dateFormat: string | null): string[] {
		return this.sortOldestFirst(values).map((value) => formatDate(this.toLocalDate(value), dateFormat));
	}

	chartValues(values: FinanceValue[]): number[] {
		return this.sortOldestFirst(values).map((value) => value.value);
	}
}
