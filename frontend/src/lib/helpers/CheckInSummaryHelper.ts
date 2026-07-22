import type { CheckIn, CheckInType } from '$lib/types/check_in';
import type { CheckInSummaryRecords } from '$lib/types/translation';
import { SPORT_BY_ID } from '$lib/types/check_in';
import { isDateToday, isDateYesterday } from '$lib/helpers/DateHelper';

// Trackers where a high value (≥4) is undesirable
const INVERTED_TRACKERS = new Set<CheckInType>(['alcohol', 'smoking']);

function isBadValue(tracker: CheckInType, value: number): boolean {
	return INVERTED_TRACKERS.has(tracker) ? value >= 4 : value <= 2;
}

function isGoodValue(tracker: CheckInType, value: number): boolean {
	return INVERTED_TRACKERS.has(tracker) ? value <= 2 : value >= 4;
}

function getPhraseForTracker(
	tracker: CheckInType,
	value: number,
	p: CheckInSummaryRecords
): string | null {
	if (tracker === 'sports') {
		const sportId = SPORT_BY_ID[value];
		if (!sportId) return null;
		return p[`sports_${sportId}` as keyof CheckInSummaryRecords] ?? null;
	}
	const key = `${tracker}_${value}` as keyof CheckInSummaryRecords;
	return p[key] ?? null;
}

interface TrackerPhrase {
	tracker: CheckInType;
	value: number;
	phrase: string;
}

const GROUPS: CheckInType[][] = [
	['mood', 'sleep', 'dreams'],
	['water', 'food_quality', 'food_amount', 'menstruation'],
	['sports', 'work', 'social_life'],
	['alcohol', 'smoking']
];

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

function combineGroupPhrases(items: TrackerPhrase[], p: CheckInSummaryRecords): string {
	if (items.length === 1) return items[0].phrase;

	const good = items.filter((i) => isGoodValue(i.tracker, i.value));
	const bad = items.filter((i) => isBadValue(i.tracker, i.value));
	const neutral = items.filter(
		(i) => !isGoodValue(i.tracker, i.value) && !isBadValue(i.tracker, i.value)
	);

	if (good.length > 0 && bad.length > 0) {
		const goodPart = good.map((i) => i.phrase).join(` ${p.connector_and} `);
		const badPart = bad.map((i) => i.phrase).join(` ${p.connector_and} `);
		const base = `${goodPart}, ${p.connector_but} ${badPart}`;
		return neutral.length > 0
			? `${neutral.map((i) => i.phrase).join(` ${p.connector_and} `)}, ${base}`
			: base;
	}

	return items.map((i) => i.phrase).join(` ${p.connector_and} `);
}

export function buildDaySummary(
	checkIn: CheckIn,
	enabledTrackers: CheckInType[],
	p: CheckInSummaryRecords
): string {
	const clauses: string[] = [];

	for (const group of GROUPS) {
		const items: TrackerPhrase[] = [];
		for (const tracker of group) {
			if (!enabledTrackers.includes(tracker)) continue;
			const value = checkIn[tracker] as number | null;
			if (value === null) continue;
			const phrase = getPhraseForTracker(tracker, value, p);
			if (phrase) items.push({ tracker, value: tracker === 'sports' ? 3 : value, phrase });
		}
		if (items.length === 0) continue;
		clauses.push(combineGroupPhrases(items, p));
	}

	if (clauses.length === 0) return '';
	return clauses.map(capitalize).join('. ') + '.';
}

function getQualifier(avg: number, p: CheckInSummaryRecords): string {
	if (avg >= 4.5 || avg <= 1.5) return p.period_qualifier_consistently;
	if (avg >= 3.5) return p.period_qualifier_generally;
	if (avg <= 2.5) return p.period_qualifier_often;
	return '';
}

export function buildPeriodSummary(
	checkIns: CheckIn[],
	enabledTrackers: CheckInType[],
	p: CheckInSummaryRecords
): string {
	if (checkIns.length === 0) return '';

	const clauses: string[] = [];

	for (const group of GROUPS) {
		const items: TrackerPhrase[] = [];

		for (const tracker of group) {
			if (!enabledTrackers.includes(tracker)) continue;

			if (tracker === 'sports') {
				const count = checkIns.filter((c) => c.sports !== null).length;
				if (count === 0) continue;
				const phrase =
					count === 1
						? p.period_sports_singular
						: p.period_sports_plural.replace('{n}', String(count));
				// value 3 = neutral so sports never triggers contrast logic
				items.push({ tracker, value: 3, phrase });
				continue;
			}

			const values = checkIns
				.map((c) => c[tracker] as number | null)
				.filter((v): v is number => v !== null);

			if (values.length === 0) continue;

			const avg = values.reduce((a, b) => a + b, 0) / values.length;
			const rounded = Math.round(avg) as 1 | 2 | 3 | 4 | 5;
			const basePhrase = getPhraseForTracker(tracker, rounded, p);
			if (!basePhrase) continue;

			const qualifier = getQualifier(avg, p);
			const phrase = qualifier ? `${qualifier} ${basePhrase}` : basePhrase;
			items.push({ tracker, value: rounded, phrase });
		}

		if (items.length === 0) continue;
		clauses.push(combineGroupPhrases(items, p));
	}

	if (clauses.length === 0) return '';
	return clauses.map(capitalize).join('. ') + '.';
}

export function getDayLabel(date: Date, p: CheckInSummaryRecords): string {
	if (isDateToday(date)) return p.day_today;
	if (isDateYesterday(date)) return p.day_yesterday;
	return p[`day_${date.getDay()}` as keyof CheckInSummaryRecords];
}
