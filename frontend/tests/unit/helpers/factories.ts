import type { Todo, TodoCategory, TodoWorkspace } from '$lib/types/todo';
import type { DevRequest } from '$lib/types/dev_request';
import type { Tag } from '$lib/types/tag';
import type { CheckInTracker, CheckInValue } from '$lib/types/check_in';
import type { Goal } from '$lib/types/goal';
import type { Calendar, CalendarEvent, CalendarEventResponse, ImportState } from '$lib/types/calendar';
import type { FeedImportEntry, FeedImportState, FeedItem, FeedSubscription } from '$lib/types/feed';
import type { ClipboardEntry } from '$lib/types/clipboard';
import type { Book, BookGenre } from '$lib/types/library_book';
import type { Music, MusicGenre } from '$lib/types/library_music';
import type { Movie, MovieGenre } from '$lib/types/library_movie';
import type { Game, GameGenre } from '$lib/types/library_game';
import type { Plant } from '$lib/types/library_plant';
import type { Quote } from '$lib/types/library_quote';
import type { Recipe } from '$lib/types/library_recipe';
import type { Link, LinkCategory } from '$lib/types/library_link';
import type { Budget, WealthField } from '$lib/types/finance';
import type { Note, NoteCategory } from '$lib/types/note';
import type { AddressBook, Contact, ImportState as ContactImportState } from '$lib/types/contact';
import type { TimeTrackingCategory, TimeTrackingEntry, TimeTrackingProject } from '$lib/types/time_tracking';

export function todo(overrides: Partial<Todo> = {}): Todo {
	return {
		id: '1',
		title: 'Test todo',
		description: '',
		link: null,
		priority: 'medium',
		status: 'pending',
		effort: null,
		progress: null,
		is_completed: false,
		due_at: '',
		category: null,
		tags: [],
		subtasks: [],
		relevance: null,
		recurrence_frequency: null,
		recurrence_interval: 1,
		recurrence_ends_at: null,
		parent_task_id: null,
		auto_generated: false,
		created_at: '',
		updated_at: '',
		completed_at: '',
		...overrides
	};
}

export function category(id: number, title = 'Category'): TodoCategory {
	return { id, title, created_at: '', updated_at: '' };
}

export function tag(id: number, name = 'tag'): Tag {
	return { id, name, color: '#000000', created_at: '', updated_at: '' };
}

export function devRequest(overrides: Partial<DevRequest> = {}): DevRequest {
	return {
		id: 1,
		type: 'bug',
		status: 'pending',
		priority: 2,
		title: 'Login fails',
		description: 'The login button does nothing',
		screenshot: '',
		url: '',
		created_at: '2026-10-01T10:00:00Z',
		updated_at: '2026-10-01T10:00:00Z',
		upvotes: 0,
		downvotes: 0,
		score: 0,
		user_vote: 'up',
		comment_count: 0,
		fixed_in_version: null,
		created_by_user_id: null,
		created_by_user: { id: '', name: 'Ada' },
		...overrides
	};
}

export function checkInTracker(overrides: Partial<CheckInTracker> = {}): CheckInTracker {
	return {
		id: 1,
		key: null,
		name: 'Meditated',
		type: 'yes_no',
		icon: null,
		position: 0,
		enabled: true,
		scored: false,
		...overrides
	};
}

export function checkInValue(trackerId: number, date: string, value: number): CheckInValue {
	return { tracker_id: trackerId, date, value };
}

export function goal(overrides: Partial<Goal> = {}): Goal {
	return {
		id: 1,
		source: 'check_in_tracker',
		check_in_tracker_id: 1,
		period: 'week',
		comparison: 'at_least',
		target: 3,
		notify_when_reached: false,
		progress: { current: null, met: false, period_start: '', period_end: '', history: [] },
		...overrides
	};
}

export function calendar(overrides: Partial<Calendar> = {}): Calendar {
	return {
		id: 1,
		name: 'Personal',
		color: '#fff',
		description: '',
		timezone: 'UTC',
		order: 0,
		is_shared: false,
		is_read_only: false,
		share_owner: null,
		invite_status: null,
		share_token: null,
		is_external: false,
		is_unavailable: false,
		is_credentials_rejected: false,
		...overrides
	};
}

export function calendarImportState(overrides: Partial<ImportState> = {}): ImportState {
	return {
		stage: 'events',
		source: 'file',
		calendars: [],
		calendars_count: 1,
		calendars_done: 1,
		calendars_current: 'Holidays',
		events_count: 10,
		events_done: 0,
		events_skipped: 0,
		...overrides
	};
}

export function calendarEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
	return {
		id: 1,
		uri: 'event-1',
		title: 'Event',
		description: '',
		location: '',
		start_date: new Date(2026, 7, 10, 10, 0),
		end_date: new Date(2026, 7, 10, 11, 0),
		is_all_day: false,
		is_recurring: false,
		recurrence_rule: null,
		recurrence_end: null,
		original_start_date: null,
		created_at: null,
		updated_at: null,
		calendar_id: 1,
		calendar_name: 'Personal',
		calendar_color: '#fff',
		etag: '',
		...overrides
	};
}

export function calendarEventResponse(overrides: Partial<CalendarEventResponse> = {}): CalendarEventResponse {
	return {
		id: 1,
		uri: 'event-1',
		title: 'Event',
		description: '',
		location: '',
		start_date: '2026-08-10T10:00:00Z',
		end_date: '2026-08-10T11:00:00Z',
		is_all_day: false,
		is_recurring: false,
		recurrence_rule: null,
		recurrence_end: null,
		original_start_date: null,
		created_at: null,
		updated_at: null,
		calendar_id: 1,
		calendar_name: 'Personal',
		calendar_color: '#fff',
		etag: '',
		...overrides
	};
}

export function feedSubscription(overrides: Partial<FeedSubscription> = {}): FeedSubscription {
	return {
		id: 'sub-1',
		feed_id: 'feed-1',
		title: 'My Feed',
		url: 'https://example.com/rss',
		whitelist: '',
		blacklist: '',
		created_at: '',
		updated_at: '',
		...overrides
	};
}

export function feedItem(overrides: Partial<FeedItem> = {}): FeedItem {
	return {
		id: 'item-1',
		title: 'An item',
		description: '',
		image_url: null,
		feed_id: 'feed-1',
		link: 'https://example.com/item-1',
		published_at: '2026-08-01T10:00:00Z',
		saved_link_id: null,
		...overrides
	};
}

export function feedImportEntry(overrides: Partial<FeedImportEntry> = {}): FeedImportEntry {
	return {
		url: 'https://a.test/feed',
		title: 'A feed',
		already_subscribed: false,
		status: null,
		...overrides
	};
}

export function feedImportState(overrides: Partial<FeedImportState> = {}): FeedImportState {
	return {
		stage: 'parsed',
		total: 0,
		processed: 0,
		feeds: [],
		...overrides
	};
}

export function clipboardEntry(overrides: Partial<ClipboardEntry> = {}): ClipboardEntry {
	return {
		id: 1,
		content: 'Copied text',
		type: 'text',
		file_path: null,
		created_at: '2026-11-20T10:00:00',
		updated_at: '2026-11-20T10:00:00',
		...overrides
	};
}

export function book(overrides: Partial<Book> = {}): Book {
	return {
		id: 'b1',
		title: 'Book',
		author: 'Author',
		series: null,
		volume: null,
		pages: null,
		current_page: null,
		lent_to: null,
		is_where: null,
		cover: null,
		link: null,
		rating: null,
		publication_year: null,
		wishlist: false,
		summary: null,
		genres: [],
		tags: [],
		started_at: null,
		finished_at: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

export function music(overrides: Partial<Music> = {}): Music {
	return {
		id: 'm1',
		title: 'Album',
		artist: 'Artist',
		type: null,
		format: null,
		condition: null,
		acquired_where: null,
		additional_info: null,
		cover: null,
		link: null,
		rating: null,
		publication_year: null,
		wishlist: false,
		genres: [],
		created_at: '',
		updated_at: '',
		...overrides
	};
}

export function movie(overrides: Partial<Movie> = {}): Movie {
	return {
		id: 'mo1',
		title: 'Movie',
		category: '',
		cover: null,
		link: null,
		rating: null,
		publication_year: null,
		wishlist: false,
		genres: [],
		tags: [],
		started_at: null,
		finished_at: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

export function game(overrides: Partial<Game> = {}): Game {
	return {
		id: 'g1',
		title: 'Game',
		platform: 'PC',
		developer: null,
		publisher: null,
		cover: null,
		link: null,
		rating: null,
		publication_year: null,
		playtime_hours: null,
		completed: false,
		wishlist: false,
		genres: [],
		tags: [],
		started_at: null,
		finished_at: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

export function plant(overrides: Partial<Plant> = {}): Plant {
	return {
		id: 'p1',
		name: 'Monstera',
		latin_name: 'Monstera deliciosa',
		location: null,
		sunlight: null,
		current_size: null,
		max_size: null,
		acquired_at: null,
		winter_hardy: null,
		instructions: null,
		cover: null,
		link: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

export function quote(overrides: Partial<Quote> = {}): Quote {
	return {
		id: 'q1',
		summary: null,
		author: 'Author',
		quote: 'Words',
		source: null,
		tags: [],
		created_at: '',
		updated_at: '',
		...overrides
	};
}

export function recipe(overrides: Partial<Recipe> = {}): Recipe {
	return {
		id: 'r1',
		title: 'Recipe',
		cover: null,
		link: null,
		rating: null,
		calories: null,
		time_to_make: null,
		servings: null,
		ingredients: [],
		steps: [],
		description: null,
		type: null,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

export function link(overrides: Partial<Link> = {}): Link {
	return {
		id: 'l1',
		title: 'Link',
		url: 'https://example.com',
		cover: null,
		tags: [],
		category: null,
		is_favorite: false,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

export function linkCategory(id: number, title: string): LinkCategory {
	return { id, title, color: null };
}

export function genre(id: number, title: string): BookGenre & MusicGenre & MovieGenre & GameGenre {
	return { id, title, created_at: '', updated_at: '' };
}

export function budget(overrides: Partial<Budget> = {}): Budget {
	return { id: 1, title: 'Rent', type: 'expense', value: 900, tags: [], created_at: '', updated_at: '', ...overrides };
}

export function wealthField(overrides: Partial<WealthField> = {}): WealthField {
	return { id: 2, title: 'Savings', values: [], currentValue: null, created_at: '', updated_at: '', ...overrides };
}

export function timeTrackingCategory(overrides: Partial<TimeTrackingCategory> = {}): TimeTrackingCategory {
	return { id: 1, title: 'Category', color: null, created_at: '', updated_at: '', ...overrides };
}

export function timeTrackingProject(overrides: Partial<TimeTrackingProject> = {}): TimeTrackingProject {
	return { id: 'p1', title: 'Project', description: null, color: null, categories: [], total_duration: 0, created_at: '', updated_at: '', ...overrides };
}

export function timeTrackingEntry(overrides: Partial<TimeTrackingEntry> = {}): TimeTrackingEntry {
	return {
		id: 'e1',
		description: null,
		started_at: '2026-10-01T09:00:00.000Z',
		stopped_at: '2026-10-01T10:00:00.000Z',
		duration_minutes: 60,
		has_exact_times: false,
		project: timeTrackingProject(),
		created_at: '',
		updated_at: '',
		...overrides
	};
}

export function note(overrides: Partial<Note> = {}): Note {
	return {
		id: 'n1',
		title: 'Note',
		content: '',
		category_id: null,
		tags: [],
		is_favorite: false,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

export function noteCategory(id: number, overrides: Partial<NoteCategory> = {}): NoteCategory {
	return {
		id,
		title: 'Category',
		parent_id: null,
		sort_order: 0,
		is_system: false,
		is_hidden: false,
		created_at: '',
		updated_at: '',
		children: [],
		...overrides
	};
}

export function todoWorkspace(id: number, categories: TodoCategory[], hideable = false): TodoWorkspace {
	return { id, title: 'Workspace', is_hideable: hideable, categories, created_at: '', updated_at: '' };
}

export function contact(overrides: Partial<Contact> = {}): Contact {
	return {
		uid: 'u1',
		uri: 'contact-1',
		full_name: 'Alice Example',
		first_name: 'Alice',
		last_name: 'Example',
		middle_name: '',
		prefix: '',
		suffix: '',
		email: null,
		phone: null,
		groups: null,
		organization: '',
		title: '',
		note: '',
		street: '',
		city: '',
		state: '',
		postal_code: '',
		country: '',
		etag: '',
		address_book_id: 1,
		address_book_color: '#fff',
		...overrides
	};
}

export function addressBook(overrides: Partial<AddressBook> = {}): AddressBook {
	return { id: 1, name: 'Personal', uri: 'ab-1', color: '#ff0000', description: '', ...overrides };
}

export function contactImportState(overrides: Partial<ContactImportState> = {}): ContactImportState {
	return {
		stage: 'contacts',
		source: 'file',
		address_books: null,
		address_books_count: 1,
		address_books_done: 1,
		address_books_current: 'Friends',
		contacts_count: 10,
		contacts_done: 0,
		contacts_skipped: 0,
		...overrides
	};
}
