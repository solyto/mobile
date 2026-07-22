import { SvelteDate } from 'svelte/reactivity';

export interface Calendar {
	id: number;
	name: string;
	color: string;
	description: string;
	timezone: string;
	order: number;
	is_shared: boolean;
	share_owner: string | null;
	invite_status: 'pending' | 'accepted' | null;
	share_token: string | null;
}

export interface ShareCalendarRequest {
	friend_id: string;
}

export interface CalendarSharee {
	user_id: string;
	user_name: string;
	user_email: string;
	access: number;
	status: 'pending' | 'accepted' | 'declined';
}

export interface CalendarEvent {
	id: number;
	uri: string;
	title: string;
	description: string;
	location: string;
	start_date: Date;
	end_date: Date;
	is_all_day: boolean;
	is_recurring: boolean;
	recurrence_rule: string | null;
	recurrence_end: Date | null;
	original_start_date: Date | null;
	created_at: string | null;
	updated_at: string | null;
	calendar_id: number;
	calendar_name: string;
	calendar_color: string;
	etag: string;
}

export interface CalendarDay {
	number: number;
	weekday: number;
	date: Date;
	entries: CalendarEvent[];
	is_grayed_out: boolean;
}

export interface OutOfScopeCalendarDay {
	number: number;
	weekday: number;
	date: Date;
	is_grayed_out: boolean;
}

export interface CalendarWeek {
	number: number;
	days: (CalendarDay | OutOfScopeCalendarDay)[];
}

export interface CalendarMonth {
	weeks: CalendarWeek[];
}

export interface CreateCalendarRequest {
	name: string;
}

export interface UpdateCalendarRequest {
	is_active?: boolean;
	color?: string | null;
}

export interface CreateEventRequest {
	calendar_id: number;
	title: string;
	description: string | null;
	location: string | null;
	start_date: string;
	end_date: string;
	is_all_day: boolean;
	is_recurring: boolean;
	recurrence_rule: string | null;
	recurrence_end: string | null;
	etag: null;
}

export interface UpdateEventRequest {
	calendar_id: number;
	title: string;
	description: string | null;
	location: string | null;
	start_date: string;
	end_date: string;
	is_all_day: boolean;
	is_recurring: boolean;
	recurrence_rule: string | null;
	recurrence_end: string | null;
	etag: string;
}

export interface EventForm {
	calendar_id: number;
	title: string;
	description: string;
	location: string;
	start_date: SvelteDate;
	start_hours: number;
	start_minutes: number;
	end_date: SvelteDate;
	end_hours: number;
	end_minutes: number;
	is_all_day: boolean;
	is_recurring: boolean;
	recurrence_rule: string | null;
	recurrence_end: Date | null;
}

export interface ImportForm {
	url: string;
	username: string;
	secret: string;
}

export interface ImportRequest {
	url: string;
	username: string;
	secret: string;
}

export interface SelectImportCalendarsRequest {
	calendars: string[];
}

export interface ImportState {
	stage: 'started' | 'select' | 'calendars' | 'events' | 'finished';
	calendars: string[];
	calendars_count: number;
	calendars_done: number;
	calendars_current: string | null;
	events_count: number;
	events_done: number;
}
