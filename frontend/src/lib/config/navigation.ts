import { urls } from '$lib/config/urls';
import type { NavigationRecords } from '$lib/types/translation';

export type FeatureType =
	| 'calendar'
	| 'todos'
	| 'notes'
	| 'libraries'
	| 'contacts'
	| 'checkIn'
	| 'finances'
	| 'clipboard'
	| 'dev_requests'
	| 'feeds'
	| 'timeTracking';

export interface Feature {
	type: FeatureType;
	visible: boolean;
	order?: number | null;
}

export type FeatureUsage = Partial<Record<FeatureType, number>>;

export type NavItem = {
	slug: string;
	href: string;
	iconType: string;
	translationKey: keyof NavigationRecords;
	featureFlag: FeatureType | null;
	dataTour?: string;
};

export const navItems: Record<string, NavItem> = {
	'home':          { slug: 'home',          href: urls.home,         iconType: 'home',         translationKey: 'home',         featureFlag: null,           dataTour: 'home' },
	'todos':         { slug: 'todos',         href: urls.todos,        iconType: 'todos',        translationKey: 'todos',        featureFlag: 'todos',        dataTour: 'todos' },
	'notes':         { slug: 'notes',         href: urls.notes,        iconType: 'notes',        translationKey: 'notes',        featureFlag: 'notes',        dataTour: 'notes' },
	'check-in':      { slug: 'check-in',      href: urls.checkIn,      iconType: 'checkIn',      translationKey: 'checkIn',      featureFlag: 'checkIn',      dataTour: 'checkIn' },
	'libraries':     { slug: 'libraries',     href: urls.libraries,    iconType: 'libraries',    translationKey: 'libraries',    featureFlag: 'libraries',    dataTour: 'libraries' },
	'calendar':      { slug: 'calendar',      href: urls.calendar,     iconType: 'calendar',     translationKey: 'calendar',     featureFlag: 'calendar',     dataTour: 'calendar' },
	'contacts':      { slug: 'contacts',      href: urls.contacts,     iconType: 'contacts',     translationKey: 'contacts',     featureFlag: 'contacts',     dataTour: 'contacts' },
	'finances':      { slug: 'finances',      href: urls.finances,     iconType: 'finances',     translationKey: 'finances',     featureFlag: 'finances',     dataTour: 'finances' },
	'time-tracking': { slug: 'time-tracking', href: urls.timeTracking, iconType: 'timer',        translationKey: 'timeTracking', featureFlag: 'timeTracking', dataTour: 'timeTracking' },
	'feeds':         { slug: 'feeds',         href: urls.feeds,        iconType: 'feeds',        translationKey: 'feeds',        featureFlag: 'feeds',        dataTour: 'feeds' },
	'clipboard':     { slug: 'clipboard',     href: urls.clipboard,    iconType: 'clipboard',    translationKey: 'clipboard',    featureFlag: 'clipboard',    dataTour: 'clipboard' },
	'dev-requests':  { slug: 'dev-requests',  href: urls.devRequests,  iconType: 'dev_requests', translationKey: 'dev_requests', featureFlag: 'dev_requests', dataTour: 'dev_requests' },
};

export const desktopOrder: string[] = [
	'home', 'calendar', 'todos', 'notes', 'libraries', 'contacts', 'check-in', 'finances', 'time-tracking', 'feeds', 'clipboard',
];

export const mobileDefaultOrder: string[] = [
	'home', 'todos', 'calendar', 'check-in', 'libraries', 'notes', 'contacts', 'finances', 'time-tracking', 'feeds', 'clipboard', 'dev-requests',
];

export const mobileVisibleCount = 5;