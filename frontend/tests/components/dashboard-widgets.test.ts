import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from './helpers/context';
import DueTodosWidget from '$lib/components/dashboard/widgets/DueTodosWidget.svelte';
import ScoredTodosWidget from '$lib/components/dashboard/widgets/ScoredTodosWidget.svelte';
import EventsTodayWidget from '$lib/components/dashboard/widgets/EventsTodayWidget.svelte';
import UpcomingEventsWidget from '$lib/components/dashboard/widgets/UpcomingEventsWidget.svelte';
import NewestNotesWidget from '$lib/components/dashboard/widgets/NewestNotesWidget.svelte';
import NewestLinksWidget from '$lib/components/dashboard/widgets/NewestLinksWidget.svelte';
import BookReleasesWidget from '$lib/components/dashboard/widgets/BookReleasesWidget.svelte';
import MovieReleasesWidget from '$lib/components/dashboard/widgets/MovieReleasesWidget.svelte';
import MusicReleasesWidget from '$lib/components/dashboard/widgets/MusicReleasesWidget.svelte';
import QuoteWidget from '$lib/components/dashboard/widgets/QuoteWidget.svelte';
import { todo } from '../unit/helpers/factories';
import type { CalendarEvent } from '$lib/types/calendar';
import type { Note } from '$lib/types/note';
import type { Link } from '$lib/types/library_link';
import type { BookRelease } from '$lib/types/library_book';
import type { MovieRelease } from '$lib/types/library_movie';
import type { MusicRelease } from '$lib/types/library_music';
import type { Quote } from '$lib/types/library_quote';
import type { TodoPriority } from '$lib/types/todo';

function calendarEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
	return {
		id: 1,
		uri: 'evt-1',
		title: 'Standup',
		description: '',
		location: '',
		start_date: new Date(2026, 7, 14, 9, 30),
		end_date: new Date(2026, 7, 14, 10, 0),
		is_all_day: false,
		is_recurring: false,
		recurrence_rule: null,
		recurrence_end: null,
		original_start_date: null,
		created_at: null,
		updated_at: null,
		calendar_id: 1,
		calendar_name: 'Work',
		calendar_color: '#ff0000',
		etag: '',
		...overrides
	};
}

function note(overrides: Partial<Note> = {}): Note {
	return {
		id: 'n1',
		title: 'Shopping list',
		content: '',
		category_id: null,
		tags: [],
		is_favorite: false,
		created_at: '2026-08-01T00:00:00',
		updated_at: '2026-08-10T00:00:00',
		...overrides
	};
}

function link(overrides: Partial<Link> = {}): Link {
	return {
		id: 'l1',
		title: 'Solyto',
		url: 'https://solyto.app',
		cover: null,
		tags: [],
		category: null,
		is_favorite: false,
		created_at: '',
		updated_at: '',
		...overrides
	};
}

describe('DueTodosWidget', () => {
	it('renders the heading and the due todos', () => {
		renderWithContext(
			DueTodosWidget,
			{},
			{
				prepare: (stores) => ({
					dueTodos: [todo({ id: '1', title: 'Buy milk', priority: 'high' })],
					handleCheck: vi.fn(),
					ts: stores.ts
				})
			}
		);
		expect(screen.getByText('Due Today')).toBeInTheDocument();
		expect(screen.getByText('Buy milk')).toBeInTheDocument();
	});

	it('colors the priority dot by priority', () => {
		const { container } = renderWithContext(
			DueTodosWidget,
			{},
			{
				prepare: (stores) => ({
					dueTodos: [
						todo({ id: '1', title: 'High', priority: 'high' }),
						todo({ id: '2', title: 'Medium', priority: 'medium' }),
						todo({ id: '3', title: 'Low', priority: 'low' }),
						todo({ id: '4', title: 'None', priority: null as unknown as TodoPriority })
					],
					handleCheck: vi.fn(),
					ts: stores.ts
				})
			}
		);
		const dots = container.querySelectorAll('.rounded-full');
		expect(dots[0].classList.contains('bg-c-danger')).toBe(true);
		expect(dots[1].classList.contains('bg-c-btn')).toBe(true);
		expect(dots[2].classList.contains('bg-c-success')).toBe(true);
		expect(dots[3].classList.contains('bg-c-btn')).toBe(true);
	});

	it('strikes through completed todos', () => {
		const { container } = renderWithContext(
			DueTodosWidget,
			{},
			{
				prepare: (stores) => ({
					dueTodos: [
						todo({ id: '1', title: 'Done', is_completed: true }),
						todo({ id: '2', title: 'Open', is_completed: false })
					],
					handleCheck: vi.fn(),
					ts: stores.ts
				})
			}
		);
		const titles = container.querySelectorAll('span.truncate');
		expect(titles[0].classList.contains('line-through')).toBe(true);
		expect(titles[0].classList.contains('opacity-50')).toBe(true);
		expect(titles[1].classList.contains('line-through')).toBe(false);
	});

	it('wires the checkbox to handleCheck', async () => {
		const user = userEvent.setup();
		const handleCheck = vi.fn();
		const dueTodo = todo({ id: '1', title: 'Buy milk' });
		renderWithContext(
			DueTodosWidget,
			{},
			{
				prepare: (stores) => ({ dueTodos: [dueTodo], handleCheck, ts: stores.ts })
			}
		);

		await user.click(screen.getByRole('checkbox'));
		expect(handleCheck).toHaveBeenCalledWith(expect.anything(), dueTodo);
	});
});

describe('ScoredTodosWidget', () => {
	it('renders the relevance score with two decimals', () => {
		renderWithContext(
			ScoredTodosWidget,
			{},
			{
				prepare: (stores) => ({
					scoredTodos: [todo({ id: '1', title: 'Urgent', relevance: 12.345 })],
					handleCheck: vi.fn(),
					ts: stores.ts
				})
			}
		);
		expect(screen.getByText('Relevant')).toBeInTheDocument();
		expect(screen.getByText('Urgent')).toBeInTheDocument();
		expect(screen.getByText('12.35')).toBeInTheDocument();
	});

	it('strikes through completed todos and wires the checkbox', async () => {
		const user = userEvent.setup();
		const handleCheck = vi.fn();
		const scoredTodo = todo({ id: '1', title: 'Done', is_completed: true, relevance: 5 });
		const { container } = renderWithContext(
			ScoredTodosWidget,
			{},
			{
				prepare: (stores) => ({ scoredTodos: [scoredTodo], handleCheck, ts: stores.ts })
			}
		);

		expect(container.querySelector('span.truncate')?.classList.contains('line-through')).toBe(
			true
		);
		await user.click(screen.getByRole('checkbox'));
		expect(handleCheck).toHaveBeenCalledWith(expect.anything(), scoredTodo);
	});
});

describe('EventsTodayWidget', () => {
	it('renders event titles with their start time', () => {
		renderWithContext(
			EventsTodayWidget,
			{},
			{
				prepare: (stores) => ({
					todayEvents: [
						calendarEvent({
							title: 'Standup',
							start_date: new Date(2026, 7, 14, 9, 30)
						})
					],
					ts: stores.ts
				})
			}
		);
		expect(screen.getByText('Standup')).toBeInTheDocument();
		expect(screen.getByText('9:30')).toBeInTheDocument();
	});

	it('marks all-day events as all day', () => {
		renderWithContext(
			EventsTodayWidget,
			{},
			{
				prepare: (stores) => ({
					todayEvents: [calendarEvent({ title: 'Holiday', is_all_day: true })],
					ts: stores.ts
				})
			}
		);
		expect(screen.getByText('Holiday')).toBeInTheDocument();
		expect(screen.getByText('all day')).toBeInTheDocument();
	});

	it('uses the calendar color for the event bar', () => {
		const { container } = renderWithContext(
			EventsTodayWidget,
			{},
			{
				prepare: (stores) => ({
					todayEvents: [calendarEvent({ calendar_color: '#00ff00' })],
					ts: stores.ts
				})
			}
		);
		const bar = container.querySelector('.w-\\[3px\\]');
		expect(bar).toHaveStyle('background-color: #00ff00');
	});
});

describe('UpcomingEventsWidget', () => {
	it('renders the event date (user format), title and time', () => {
		renderWithContext(
			UpcomingEventsWidget,
			{},
			{
				prepare: (stores) => ({
					upcomingEvents: [
						calendarEvent({
							title: 'Conference',
							start_date: new Date(2026, 7, 20, 14, 0)
						})
					],
					ts: stores.ts,
					auth: stores.auth
				})
			}
		);
		expect(screen.getByText('Coming Up')).toBeInTheDocument();
		expect(screen.getByText('Conference')).toBeInTheDocument();
		expect(screen.getByText('14:00')).toBeInTheDocument();
	});

	it('omits the time for all-day events', () => {
		renderWithContext(
			UpcomingEventsWidget,
			{},
			{
				prepare: (stores) => ({
					upcomingEvents: [calendarEvent({ title: 'Birthday', is_all_day: true })],
					ts: stores.ts,
					auth: stores.auth
				})
			}
		);
		expect(screen.getByText('Birthday')).toBeInTheDocument();
		expect(screen.queryByText(/\d{2}:\d{2}/)).not.toBeInTheDocument();
	});
});

describe('NewestNotesWidget', () => {
	it('renders note titles linking to the note', () => {
		const { container } = renderWithContext(
			NewestNotesWidget,
			{},
			{
				prepare: (stores) => ({
					newestNotes: [note({ id: 'n9', title: 'Ideas' })],
					ts: stores.ts
				})
			}
		);
		expect(screen.getByText('Recent Notes')).toBeInTheDocument();
		expect(screen.getByText('Ideas')).toBeInTheDocument();
		expect(container.querySelector('a')).toHaveAttribute('href', '/notes/n9');
	});
});

describe('NewestLinksWidget', () => {
	it('renders link titles pointing to the url', () => {
		const { container } = renderWithContext(
			NewestLinksWidget,
			{},
			{
				prepare: (stores) => ({
					newestLinks: [link({ title: 'Solyto', url: 'https://solyto.app' })],
					ts: stores.ts
				})
			}
		);
		expect(screen.getByText('Newest Links')).toBeInTheDocument();
		const anchor = container.querySelector('a');
		expect(anchor).toHaveAttribute('href', 'https://solyto.app');
		expect(anchor).toHaveAttribute('target', '_blank');
	});
});

describe('BookReleasesWidget', () => {
	function bookRelease(overrides: Partial<BookRelease> = {}): BookRelease {
		return {
			id: 1,
			author: 'Tolkien',
			author_id: null,
			title: 'The Silmarillion',
			description: null,
			page_count: null,
			url: 'https://example.com/book',
			cover: null,
			provider: 'gbooks',
			release_date: '2026-09-01',
			...overrides
		};
	}

	it('renders the release title, author and date', () => {
		renderWithContext(
			BookReleasesWidget,
			{},
			{
				prepare: (stores) => ({ bookReleases: [bookRelease()], ts: stores.ts })
			}
		);
		expect(screen.getByText('New Books')).toBeInTheDocument();
		expect(screen.getByText('The Silmarillion')).toBeInTheDocument();
		expect(screen.getByText(/Tolkien/)).toBeInTheDocument();
		expect(screen.getByText(/01\.09\.2026/)).toBeInTheDocument();
	});

	it('shows the cover image when one is available', () => {
		const { container } = renderWithContext(
			BookReleasesWidget,
			{},
			{
				prepare: (stores) => ({
					bookReleases: [bookRelease({ cover: 'https://example.com/cover.jpg' })],
					ts: stores.ts
				})
			}
		);
		expect(container.querySelector('img')).toHaveAttribute(
			'src',
			'https://example.com/cover.jpg'
		);
	});
});

describe('MovieReleasesWidget', () => {
	function movieRelease(overrides: Partial<MovieRelease> = {}): MovieRelease {
		return {
			id: 'mr1',
			type: 'movie',
			title: 'Dune 3',
			description: null,
			url: 'https://example.com/movie',
			cover: null,
			provider: 'tmdb',
			release_year: 2027,
			runtime: null,
			genres: [],
			...overrides
		} as MovieRelease;
	}

	it('renders the release title with its type label', () => {
		renderWithContext(
			MovieReleasesWidget,
			{},
			{
				prepare: (stores) => ({
					movieReleases: [movieRelease({ type: 'movie', title: 'Dune 3' })],
					ts: stores.ts
				})
			}
		);
		expect(screen.getByText('Dune 3')).toBeInTheDocument();
		expect(screen.getByText(/^Movie/)).toBeInTheDocument();
	});

	it('labels tv releases as Series', () => {
		renderWithContext(
			MovieReleasesWidget,
			{},
			{
				prepare: (stores) => ({
					movieReleases: [movieRelease({ type: 'tv', title: 'Silo' })],
					ts: stores.ts
				})
			}
		);
		expect(screen.getByText(/^Series/)).toBeInTheDocument();
	});
});

describe('MusicReleasesWidget', () => {
	function musicRelease(overrides: Partial<MusicRelease> = {}): MusicRelease {
		return {
			id: 1,
			artist: 'Radiohead',
			artist_id: 1,
			title: 'New Album',
			url: 'https://example.com/music',
			cover: '',
			provider: 'itunes',
			release_date: '2026-10-15',
			genres: [],
			record_type: null,
			...overrides
		};
	}

	it('renders the release title, artist and date', () => {
		renderWithContext(
			MusicReleasesWidget,
			{},
			{
				prepare: (stores) => ({ musicReleases: [musicRelease()], ts: stores.ts })
			}
		);
		expect(screen.getByText('New Music')).toBeInTheDocument();
		expect(screen.getByText('New Album')).toBeInTheDocument();
		expect(screen.getByText(/Radiohead/)).toBeInTheDocument();
		expect(screen.getByText(/15\.10\.2026/)).toBeInTheDocument();
	});
});

describe('QuoteWidget', () => {
	function quote(overrides: Partial<Quote> = {}): Quote {
		return {
			id: 'q1',
			summary: null,
			author: 'Nietzsche',
			quote: 'What does not kill me',
			source: null,
			tags: [],
			created_at: '',
			updated_at: '',
			...overrides
		};
	}

	it('renders the quote and its author', () => {
		renderWithContext(QuoteWidget, { quote: quote() });
		expect(screen.getByText('What does not kill me')).toBeInTheDocument();
		expect(screen.getByText('Nietzsche')).toBeInTheDocument();
	});

	it('renders without an author when the quote has none', () => {
		renderWithContext(QuoteWidget, { quote: quote({ author: null }) });
		expect(screen.getByText('What does not kill me')).toBeInTheDocument();
		expect(screen.queryByText('Nietzsche')).not.toBeInTheDocument();
	});
});
