import { describe, it, expect } from 'vitest';
import {
	buildDaySummary,
	buildPeriodSummary,
	getDayLabel
} from '$lib/helpers/CheckInSummaryHelper';
import type { CheckIn, CheckInType } from '$lib/types/check_in';
import type { CheckInSummaryRecords } from '$lib/types/translation';

function checkIn(overrides: Partial<CheckIn> = {}): CheckIn {
	return {
		id: 1,
		date: '2025-08-15',
		mood: null,
		sports: null,
		water: null,
		sleep: null,
		dreams: null,
		work: null,
		food_quality: null,
		food_amount: null,
		menstruation: null,
		alcohol: null,
		smoking: null,
		social_life: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

function records(): CheckInSummaryRecords {
	const p = {} as Record<string, string>;
	const trackers: CheckInType[] = [
		'mood',
		'sleep',
		'dreams',
		'water',
		'food_quality',
		'food_amount',
		'work',
		'alcohol',
		'smoking',
		'menstruation',
		'social_life'
	];
	for (const t of trackers) {
		for (let v = 1; v <= 5; v++) p[`${t}_${v}`] = `${t}-${v}`;
	}
	for (const sport of ['dumbbell', 'bike', 'mountain', 'footprints', 'waves_ladder', 'yoga']) {
		p[`sports_${sport}`] = `sports-${sport}`;
	}
	Object.assign(p, {
		day_today: 'today',
		day_yesterday: 'yesterday',
		day_0: 'sunday',
		day_1: 'monday',
		day_2: 'tuesday',
		day_3: 'wednesday',
		day_4: 'thursday',
		day_5: 'friday',
		day_6: 'saturday',
		connector_and: 'and',
		connector_but: 'but',
		period_qualifier_consistently: 'consistently',
		period_qualifier_generally: 'generally',
		period_qualifier_often: 'often',
		period_sports_singular: 'one sports day',
		period_sports_plural: '{n} sports days',
		period_this_week: '',
		period_last_week: '',
		period_this_month: '',
		period_last_month: '',
		section_days: '',
		section_weeks: '',
		section_months: ''
	});
	return p as unknown as CheckInSummaryRecords;
}

const all: CheckInType[] = [
	'mood',
	'sleep',
	'dreams',
	'water',
	'food_quality',
	'food_amount',
	'menstruation',
	'work',
	'social_life',
	'alcohol',
	'smoking',
	'sports'
];

describe('buildDaySummary', () => {
	it('joins good values within a group with the and connector', () => {
		const p = records();
		const result = buildDaySummary(checkIn({ mood: 4, sleep: 5 }), all, p);
		expect(result).toBe('Mood-4 and sleep-5.');
	});

	it('builds a good-but contrast within a group', () => {
		const p = records();
		const result = buildDaySummary(checkIn({ mood: 5, dreams: 1 }), all, p);
		expect(result).toBe('Mood-5, but dreams-1.');
	});

	it('resolves sports by sport id and treats them as neutral', () => {
		const p = records();
		const result = buildDaySummary(checkIn({ sports: 2 }), all, p);
		expect(result).toBe('Sports-bike.');
	});

	it('capitalizes the first clause', () => {
		const p = records();
		const result = buildDaySummary(checkIn({ water: 3 }), all, p);
		expect(result).toBe('Water-3.');
	});

	it('returns an empty string when no trackers are enabled or have values', () => {
		const p = records();
		expect(buildDaySummary(checkIn({ mood: 4 }), ['sleep'], p)).toBe('');
		expect(buildDaySummary(checkIn(), all, p)).toBe('');
	});
});

describe('buildPeriodSummary', () => {
	it('returns an empty string for no check-ins', () => {
		expect(buildPeriodSummary([], all, records())).toBe('');
	});

	it('applies the consistently qualifier for very high averages', () => {
		const p = records();
		const result = buildPeriodSummary([checkIn({ mood: 4 }), checkIn({ mood: 5 })], all, p);
		expect(result).toBe('Consistently mood-5.');
	});

	it('applies the generally qualifier for medium-high averages', () => {
		const p = records();
		const result = buildPeriodSummary([checkIn({ mood: 3 }), checkIn({ mood: 4 })], all, p);
		expect(result).toBe('Generally mood-4.');
	});

	it('applies the often qualifier for low averages', () => {
		const p = records();
		const result = buildPeriodSummary([checkIn({ mood: 2 }), checkIn({ mood: 3 })], all, p);
		expect(result).toBe('Often mood-3.');
	});

	it('uses the singular sports phrase for one sports day', () => {
		const p = records();
		const result = buildPeriodSummary([checkIn({ sports: 1 })], all, p);
		expect(result).toBe('One sports day.');
	});

	it('uses the plural sports phrase with the count', () => {
		const p = records();
		const result = buildPeriodSummary([checkIn({ sports: 1 }), checkIn({ sports: 3 })], all, p);
		expect(result).toBe('2 sports days.');
	});
});

describe('getDayLabel', () => {
	it('returns today label for today', () => {
		expect(getDayLabel(new Date(), records())).toBe('today');
	});

	it('returns yesterday label for yesterday', () => {
		const d = new Date();
		d.setDate(d.getDate() - 1);
		expect(getDayLabel(d, records())).toBe('yesterday');
	});

	it('returns the weekday label for other days', () => {
		// Jan 3 2000 was a Monday
		expect(getDayLabel(new Date(2000, 0, 3), records())).toBe('monday');
	});
});
