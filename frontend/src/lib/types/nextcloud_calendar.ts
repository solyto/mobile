export interface Calendar {
	id: number;
	title: string;
	url: string;
	is_active: boolean;
	color: string | null;
}

export interface CalendarEntry {
	id: string;
	title: string;
	description: string;
	location: string;
	start_date: Date;
	end_date: Date;
	is_all_day: boolean;
	is_recurring: boolean;
	recurrence_rule: string | null;
	recurrence_end: Date | null;
	created_at: string | null;
	updated_at: string | null;
	calendar?: Calendar;
}

export interface CalendarDay {
	number: number;
	weekday: number;
	date: Date;
	entries: CalendarEntry[];
	is_grayed_out: boolean;
}

export interface OutOfScopeCalendarDay {
	weekday: number;
	date: Date;
}

export interface CalendarWeek {
	number: number;
	days: (CalendarDay | OutOfScopeCalendarDay)[];
}

export interface CalendarMonth {
	weeks: CalendarWeek[];
}

export interface UpdateCalendarRequest {
	is_active?: boolean;
	color?: string | null;
}

export interface CreateCalendarEntryRequest {
	title: string;
	description: string | null;
	location: string | null;
	start_date: Date;
	end_date: Date;
	is_all_day: boolean;
	calendar_id: number;
}

export interface UpdateCalendarEntryRequest {
	title: string;
	description: string | null;
	location: string | null;
	start_date: Date;
	end_date: Date;
	is_all_day: boolean;
	calendar_id: number;
}

export interface CalendarEntryForm {
	title: string;
	description: string;
	location: string;
	start_date: Date;
	end_date: Date;
	is_all_day: boolean;
	is_recurring: boolean;
	recurrence_rule: string | null;
	recurrence_end: Date | null;
	calendar_id: number;
}

export interface CheckSyncResponse {
	done: boolean;
}
