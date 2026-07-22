export interface CheckInNavigationItem {
	url: string;
	label: string;
}

export type CheckInType =
	| 'mood'
	| 'sports'
	| 'water'
	| 'sleep'
	| 'dreams'
	| 'work'
	| 'food_quality'
	| 'food_amount'
	| 'menstruation'
	| 'alcohol'
	| 'smoking'
	| 'social_life';

export interface CheckIn {
	id: number;
	date: string;
	mood: number | null;
	sports: number | null;
	water: number | null;
	sleep: number | null;
	dreams: number | null;
	work: number | null;
	food_quality: number | null;
	food_amount: number | null;
	menstruation: number | null;
	alcohol: number | null;
	smoking: number | null;
	social_life: number | null;
	created_at: string;
	updated_at: string;
}

export const ALL_CHECK_IN_TRACKERS: CheckInType[] = [
	'mood',
	'sleep',
	'dreams',
	'food_quality',
	'food_amount',
	'water',
	'sports',
	'work',
	'menstruation',
	'alcohol',
	'smoking',
	'social_life'
];

export type SportId = 'dumbbell' | 'bike' | 'mountain' | 'footprints' | 'waves_ladder' | 'yoga';
export type SportLabelKey = 'sport_gym' | 'sport_cycling' | 'sport_hiking' | 'sport_walking' | 'sport_swimming' | 'sport_yoga';

export const AVAILABLE_SPORTS: { id: SportId; labelKey: SportLabelKey }[] = [
	{ id: 'dumbbell', labelKey: 'sport_gym' },
	{ id: 'bike', labelKey: 'sport_cycling' },
	{ id: 'mountain', labelKey: 'sport_hiking' },
	{ id: 'footprints', labelKey: 'sport_walking' },
	{ id: 'waves_ladder', labelKey: 'sport_swimming' },
	{ id: 'yoga', labelKey: 'sport_yoga' }
];

export const DEFAULT_SPORTS: SportId[] = ['dumbbell', 'bike', 'mountain', 'footprints', 'waves_ladder'];

export const SPORT_ID: Record<SportId, number> = {
	dumbbell: 1,
	bike: 2,
	mountain: 3,
	footprints: 4,
	waves_ladder: 5,
	yoga: 6
};

export const SPORT_BY_ID: Record<number, SportId> = {
	1: 'dumbbell',
	2: 'bike',
	3: 'mountain',
	4: 'footprints',
	5: 'waves_ladder',
	6: 'yoga'
};

export interface CheckInSettings {
	enabledTrackers: CheckInType[];
	selectedSports: SportId[];
}

export interface CreateCheckInRequest {
	date: string;
	mood?: number | null;
	sports?: number | null;
	water?: number | null;
	sleep?: number | null;
	dreams?: number | null;
	work?: number | null;
	food_quality?: number | null;
	food_amount?: number | null;
	menstruation?: number | null;
	alcohol?: number | null;
	smoking?: number | null;
	social_life?: number | null;
}
