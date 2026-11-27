import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import ApiService from '$lib/services/ApiService';
import type { FeatureType } from '$lib/config/navigation';
import type { ListResponse } from '$lib/types/api';
import { renderWithContext } from './helpers/context';
import DashboardPageHarness from './helpers/DashboardPageHarness.svelte';

const ALL_FEATURES: FeatureType[] = ['calendar', 'todos', 'notes', 'libraries', 'checkIn', 'timeTracking'];

const NOW = new Date(2026, 10, 20, 10, 0);

const responses: Record<string, unknown> = {
	'/calendars/events/widget': [
		{ id: 1, title: 'Standup today', start_date: '2026-11-20T09:00:00', is_all_day: false, calendar_color: '#f00' },
		{ id: 2, title: 'Dentist next week', start_date: '2026-11-25T09:00:00', is_all_day: false, calendar_color: '#0f0' }
	],
	'/libraries/quotes/random': { id: 1, quote: 'Stay curious', author: 'Someone' },
	'/libraries/music/releases': Array.from({ length: 7 }, (_, i) => ({ id: i + 1, title: `Album ${i + 1}`, artist: 'Band', url: null, cover: null, release_date: null })),
	'/libraries/books/releases': [{ id: 1, title: 'New Novel', author: 'Writer', url: null, cover: null, release_date: null }],
	'/libraries/links/newest': [{ id: 1, title: 'Svelte docs', url: 'https://svelte.dev' }],
	'/notes/recent': [{ id: 'n1', title: 'Shopping list', created_at: '2026-11-19T00:00:00', updated_at: '2026-11-19T00:00:00' }],
	'/shortcuts': [{ id: 1, title: 'My shortcut', url: 'https://example.com' }],
	'/time-tracking/projects': [{ id: 'p1', title: 'Client work', color: '#00f' }],
	'/time-tracking/entries': [{ id: 'e1', project: { id: 'p1', title: 'Client work', color: '#00f' }, started_at: '2026-11-19T08:00:00', stopped_at: '2026-11-19T09:30:00', duration_minutes: 90 }]
};

function path(url: string): string {
	return url.replace(/^.*\/api\/v1/, '');
}

function stubApi() {
	const list = vi.spyOn(ApiService.prototype, 'list').mockImplementation(async (url: string) => ({ data: responses[path(url).split('?')[0]] ?? [] }) as ListResponse);
	const get = vi.spyOn(ApiService.prototype, 'get').mockImplementation(async (url: string) => {
		const data = responses[path(url)];
		return data ? { data } : null;
	});
	return () => [...list.mock.calls.map(([url]) => 'list ' + path(url)), ...get.mock.calls.map(([url]) => 'get ' + path(url))].sort();
}

function renderDashboard(enabled: FeatureType[]) {
	const features = Object.fromEntries(ALL_FEATURES.map((feature) => [feature, enabled.includes(feature)]));
	renderWithContext(DashboardPageHarness, { features });
}

afterEach(() => {
	vi.useRealTimers();
});

describe('Dashboard loading', () => {
	it('loads every widget once when all features are on', async () => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(NOW);
		const requests = stubApi();

		renderDashboard(ALL_FEATURES);

		await waitFor(() => expect(requests()).toContain('list /notes/recent'));
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(requests()).toEqual([
			'get /libraries/quotes/random',
			'get /weather/today',
			'list /calendars/events/widget',
			'list /check-in/trackers',
			'list /check-in/values?from=2026-10-21',
			'list /goals',
			'list /libraries/books/releases',
			'list /libraries/links/newest',
			'list /libraries/music/releases',
			'list /notes/recent',
			'list /shortcuts',
			'list /time-tracking/categories',
			'list /time-tracking/entries',
			'list /time-tracking/projects',
			'list /todos',
			'list /todos/categories',
			'list /todos/workspaces'
		]);
	});

	it('loads only the weather and the shortcuts when every feature is off', async () => {
		const requests = stubApi();

		renderDashboard([]);

		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(requests()).toEqual(['get /weather/today', 'list /shortcuts']);
	});

	it('shows what was loaded', async () => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(NOW);
		stubApi();

		renderDashboard(ALL_FEATURES);

		expect(await screen.findByText('Standup today')).toBeTruthy();
		expect(screen.getByText('Dentist next week')).toBeTruthy();
		expect(await screen.findByText('Stay curious')).toBeTruthy();
		expect(screen.getByText('Album 5')).toBeTruthy();
		expect(screen.queryByText('Album 6')).toBeNull();
		expect(screen.getByText('New Novel')).toBeTruthy();
		expect(screen.getByText('Svelte docs')).toBeTruthy();
		expect(await screen.findByText('Shopping list')).toBeTruthy();
		expect(await screen.findByText('My shortcut')).toBeTruthy();
		expect(await screen.findByText('Client work')).toBeTruthy();
	});

	it('shows the empty inspiration state only once the notes have loaded', async () => {
		const pendingNotes = Promise.withResolvers<ListResponse>();
		vi.spyOn(ApiService.prototype, 'get').mockResolvedValue(null);
		vi.spyOn(ApiService.prototype, 'list').mockImplementation(async (url: string) => (path(url) === '/notes/recent' ? pendingNotes.promise : ({ data: [] } as ListResponse)));

		renderDashboard(['notes']);

		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(screen.queryByText('More to come.')).toBeNull();
		pendingNotes.resolve({ data: [] } as ListResponse);
		expect(await screen.findByText('More to come.')).toBeTruthy();
	});
});
