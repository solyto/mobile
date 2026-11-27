import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/svelte';
import ApiService from '$lib/services/ApiService';
import { renderWithContext } from './helpers/context';
import AdminPageHarness from './helpers/AdminPageHarness.svelte';

const FIELDS = [
	'users', 'active_users', 'confirmed_users', 'friends', 'ui_notifications', 'calendars', 'calendar_events', 'todos', 'todo_categories',
	'todo_workspaces', 'notes', 'note_folders', 'books', 'albums', 'movies', 'recipes', 'links', 'quotes', 'library_games', 'address_books',
	'contacts', 'check_in_entries', 'income_entries', 'wealth_entries', 'time_tracking_entries', 'time_tracking_categories',
	'time_tracking_projects', 'feed_subscriptions', 'tags'
];

describe('Admin dashboard', () => {
	it('shows every statistic under its section, in order', async () => {
		const overview = Object.fromEntries(FIELDS.map((field, i) => [field, i + 1]));
		vi.spyOn(ApiService.prototype, 'get').mockResolvedValue({ data: overview });

		renderWithContext(AdminPageHarness);

		await screen.findAllByRole('heading', { level: 2 });
		const sections = [...document.querySelectorAll('section')].map((section) => ({
			title: within(section).getByRole('heading', { level: 2 }).textContent,
			statistics: [...section.querySelectorAll('.grid > div')].map((widget) => widget.textContent?.replace(/\s+/g, ' ').trim())
		}));

		expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Dashboard');
		expect(screen.getByText('Overview of platform statistics')).toBeTruthy();
		expect(sections).toEqual([
			{ title: 'Users', statistics: ['Users 1', 'Active users 2', 'Confirmed users 3', 'Friends 4', 'Notifications 5'] },
			{ title: 'Calendars', statistics: ['Calendars 6', 'Events 7'] },
			{ title: 'Todos', statistics: ['Todos 8', 'Categories 9', 'Workspaces 10'] },
			{ title: 'Notes', statistics: ['Notes 11', 'Folders 12'] },
			{ title: 'Libraries', statistics: ['Books 13', 'Albums 14', 'Movies 15', 'Recipes 16', 'Links 17', 'Quotes 18', 'Games 19'] },
			{ title: 'Contacts', statistics: ['Address books 20', 'Contacts 21'] },
			{ title: 'Check-in', statistics: ['Entries 22'] },
			{ title: 'Finances', statistics: ['Income entries 23', 'Wealth entries 24'] },
			{ title: 'Time tracking', statistics: ['Entries 25', 'Categories 26', 'Projects 27'] },
			{ title: 'Feeds', statistics: ['Subscribed feeds 28'] },
			{ title: 'Other', statistics: ['Tags 29'] }
		]);
	});
});
