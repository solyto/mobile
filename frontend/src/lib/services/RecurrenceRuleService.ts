export type Weekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export const WEEKDAYS: Weekday[] = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export type RecurrenceType = 'daily' | 'weekly' | 'monthly_date' | 'monthly_weekday' | 'yearly';

export type MonthlyOrdinal = 1 | 2 | 3 | 4;

export interface RecurrenceSelection {
	type: RecurrenceType;
	weekdays: Weekday[];
	monthlyOrdinal: MonthlyOrdinal;
	monthlyWeekday: Weekday;
	preserved: string[];
}

interface RuleFields {
	freq: string;
	byDay: string | null;
	bySetPos: string | null;
	byMonthDay: string | null;
	byMonth: string | null;
	preserved: string[];
}

const MODELLED_KEYS = ['FREQ', 'BYDAY', 'BYSETPOS', 'BYMONTHDAY', 'BYMONTH'];

export default class RecurrenceRuleService {
	parse(rule: string | null, startDate: Date): RecurrenceSelection | null {
		const selection = this.defaults(startDate);

		if (!rule) {
			return selection;
		}

		const fields = this.readFields(rule);

		if (!fields) {
			return null;
		}

		selection.preserved = fields.preserved;

		switch (fields.freq) {
			case 'DAILY':
				return this.parseDaily(fields, selection);
			case 'WEEKLY':
				return this.parseWeekly(fields, selection);
			case 'MONTHLY':
				return this.parseMonthly(fields, selection, startDate);
			case 'YEARLY':
				return this.parseYearly(fields, selection, startDate);
			default:
				return null;
		}
	}

	build(selection: RecurrenceSelection, startDate: Date): string {
		return [...this.modelledParts(selection, startDate), ...selection.preserved].join(';');
	}

	effectiveWeekdays(selection: RecurrenceSelection, startDate: Date): Weekday[] {
		if (selection.weekdays.length === 0) {
			return [this.weekdayOf(startDate)];
		}

		return WEEKDAYS.filter((day) => selection.weekdays.includes(day));
	}

	private defaults(startDate: Date): RecurrenceSelection {
		return {
			type: 'daily',
			weekdays: [],
			monthlyOrdinal: Math.min(Math.ceil(startDate.getDate() / 7), 4) as MonthlyOrdinal,
			monthlyWeekday: this.weekdayOf(startDate),
			preserved: []
		};
	}

	private readFields(rule: string): RuleFields | null {
		const values = new Map<string, string>();
		const preserved: string[] = [];

		for (const part of rule.split(';')) {
			const separator = part.indexOf('=');

			if (separator <= 0) {
				return null;
			}

			const key = part.slice(0, separator);

			if (!MODELLED_KEYS.includes(key)) {
				preserved.push(part);
				continue;
			}

			if (values.has(key)) {
				return null;
			}

			values.set(key, part.slice(separator + 1));
		}

		const freq = values.get('FREQ');

		if (!freq) {
			return null;
		}

		return {
			freq,
			byDay: values.get('BYDAY') ?? null,
			bySetPos: values.get('BYSETPOS') ?? null,
			byMonthDay: values.get('BYMONTHDAY') ?? null,
			byMonth: values.get('BYMONTH') ?? null,
			preserved
		};
	}

	private parseDaily(fields: RuleFields, selection: RecurrenceSelection): RecurrenceSelection | null {
		if (fields.byDay || fields.bySetPos || fields.byMonthDay || fields.byMonth) {
			return null;
		}

		return selection;
	}

	private parseWeekly(fields: RuleFields, selection: RecurrenceSelection): RecurrenceSelection | null {
		if (fields.bySetPos || fields.byMonthDay || fields.byMonth) {
			return null;
		}

		const weekdays = fields.byDay ? fields.byDay.split(',') : [];

		if (!weekdays.every((day) => this.isWeekday(day))) {
			return null;
		}

		selection.type = 'weekly';
		selection.weekdays = weekdays as Weekday[];

		return selection;
	}

	private parseMonthly(
		fields: RuleFields,
		selection: RecurrenceSelection,
		startDate: Date
	): RecurrenceSelection | null {
		if (fields.byMonth) {
			return null;
		}

		if (fields.byDay || fields.bySetPos) {
			return this.parseMonthlyWeekday(fields, selection);
		}

		if (fields.byMonthDay && fields.byMonthDay !== String(startDate.getDate())) {
			return null;
		}

		selection.type = 'monthly_date';

		return selection;
	}

	private parseMonthlyWeekday(
		fields: RuleFields,
		selection: RecurrenceSelection
	): RecurrenceSelection | null {
		if (fields.byMonthDay || !fields.byDay || !this.isWeekday(fields.byDay)) {
			return null;
		}

		if (!fields.bySetPos || !['1', '2', '3', '4'].includes(fields.bySetPos)) {
			return null;
		}

		selection.type = 'monthly_weekday';
		selection.monthlyWeekday = fields.byDay;
		selection.monthlyOrdinal = Number(fields.bySetPos) as MonthlyOrdinal;

		return selection;
	}

	private parseYearly(
		fields: RuleFields,
		selection: RecurrenceSelection,
		startDate: Date
	): RecurrenceSelection | null {
		if (fields.byDay || fields.bySetPos) {
			return null;
		}

		const hasDate = fields.byMonth !== null || fields.byMonthDay !== null;
		const matchesStart =
			fields.byMonth === String(startDate.getMonth() + 1) &&
			fields.byMonthDay === String(startDate.getDate());

		if (hasDate && !matchesStart) {
			return null;
		}

		selection.type = 'yearly';

		return selection;
	}

	private modelledParts(selection: RecurrenceSelection, startDate: Date): string[] {
		switch (selection.type) {
			case 'daily':
				return ['FREQ=DAILY'];
			case 'weekly':
				return ['FREQ=WEEKLY', 'BYDAY=' + this.effectiveWeekdays(selection, startDate).join(',')];
			case 'monthly_date':
				return ['FREQ=MONTHLY', 'BYMONTHDAY=' + startDate.getDate()];
			case 'monthly_weekday':
				return [
					'FREQ=MONTHLY',
					'BYDAY=' + selection.monthlyWeekday,
					'BYSETPOS=' + selection.monthlyOrdinal
				];
			case 'yearly':
				return [
					'FREQ=YEARLY',
					'BYMONTH=' + (startDate.getMonth() + 1),
					'BYMONTHDAY=' + startDate.getDate()
				];
		}
	}

	private weekdayOf(date: Date): Weekday {
		return WEEKDAYS[(date.getDay() + 6) % 7];
	}

	private isWeekday(value: string): value is Weekday {
		return (WEEKDAYS as string[]).includes(value);
	}
}
