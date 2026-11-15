import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from './helpers/context';
import ExternalAccountsHarness from './helpers/ExternalAccountsHarness.svelte';
import type { ExternalCalendarAccount } from '$lib/types/calendar';

const ACCOUNT: ExternalCalendarAccount = { id: 7, server_url: 'https://cloud.example.com', username: 'alice', calendars: [] };

function render(list: () => Promise<unknown>) {
	const api = { list: vi.fn(list) };
	renderWithContext(ExternalAccountsHarness, {}, { stores: { auth: { apiService: api } } });
	return api;
}

describe('ExternalAccounts', () => {
	it('shows an error with a retry when the accounts cannot be loaded', async () => {
		const user = userEvent.setup();
		const api = render(async () => null);

		expect(await screen.findByRole('alert')).toHaveTextContent("Your connected accounts couldn't be loaded.");

		api.list.mockResolvedValue({ data: [] });
		await user.click(screen.getByRole('button', { name: 'Reload' }));

		expect(await screen.findByText('Connect a calendar from your own CalDAV server, e.g. Nextcloud or iCloud.')).toBeInTheDocument();
		expect(screen.queryByRole('alert')).toBeNull();
	});

	it('shows nothing but a loading state while the accounts load', () => {
		render(() => new Promise(() => {}));

		expect(screen.queryByText('Connect a calendar from your own CalDAV server, e.g. Nextcloud or iCloud.')).toBeNull();
		expect(screen.queryByRole('alert')).toBeNull();
	});

	it('offers to add calendars to an account without any', async () => {
		render(async () => ({ data: [ACCOUNT] }));

		expect(await screen.findByText('No calendars connected yet.')).toBeInTheDocument();
		expect(screen.getAllByRole('button', { name: 'Add calendars' })).toHaveLength(1);
	});
});
