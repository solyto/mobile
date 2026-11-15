import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import userEvent from '@testing-library/user-event';
import { apiRoutes } from '$lib/config/apiRoutes';
import { RateLimitedError } from '$lib/services/ApiService';
import { renderWithContext } from './helpers/context';
import ExternalAccountModalHarness from './helpers/ExternalAccountModalHarness.svelte';
import type { ExternalCalendars } from '$lib/state/ExternalCalendars.svelte';
import type { ExternalAccountDialog, ExternalCalendarAccount, ExternalCalendarCandidate } from '$lib/types/calendar';

const routes = apiRoutes.calendars.externalAccounts;
const ACCOUNT: ExternalCalendarAccount = { id: 7, server_url: 'https://cloud.example.com', username: 'alice', calendars: [] };
const CANDIDATES: ExternalCalendarCandidate[] = [
	{ url: 'https://cloud.example.com/dav/personal/', name: 'Personal', color: '#f00', is_connected: true },
	{ url: 'https://cloud.example.com/dav/work/', name: 'Work', color: '#00f', is_connected: false }
];

function refused(code: string) {
	return { success: false, message: 'Refused.', errors: [code] };
}

function fakeApi(postRaw: (endpoint: string, body: object) => Promise<unknown>) {
	return {
		list: vi.fn(async () => ({ data: [], meta: { unavailable_calendars: [] } })),
		listRaw: vi.fn(async (): Promise<unknown> => ({ success: true, data: CANDIDATES })),
		postRaw: vi.fn(postRaw),
		putRaw: vi.fn(async (): Promise<unknown> => ({ success: true, data: ACCOUNT }))
	};
}

function render(api: ReturnType<typeof fakeApi>, dialog?: ExternalAccountDialog): ExternalCalendars {
	let store: ExternalCalendars | null = null;
	renderWithContext(
		ExternalAccountModalHarness,
		{ dialog, onStore: (s: ExternalCalendars) => (store = s) },
		{ stores: { auth: { apiService: api } } }
	);
	return store!;
}

async function fillForm(user: ReturnType<typeof userEvent.setup>): Promise<void> {
	await user.type(screen.getByLabelText('Server URL'), ' https://cloud.example.com ');
	await user.type(screen.getByLabelText('Username'), 'alice');
	await user.type(screen.getByLabelText('App password'), 'app-password');
}

function submitButton(): HTMLButtonElement {
	return screen.getByRole('button', { name: 'Find calendars' });
}

describe('ExternalAccountModal connect flow', () => {
	it('keeps the submit button disabled until every field is filled', async () => {
		const user = userEvent.setup();
		render(fakeApi(async () => ({ success: true, data: ACCOUNT })));

		expect(submitButton()).toBeDisabled();
		await fillForm(user);
		expect(submitButton()).toBeEnabled();
	});

	it('sends the account once, even when clicked twice while in flight', async () => {
		const user = userEvent.setup();
		let resolve: (value: unknown) => void = () => {};
		const api = fakeApi(() => new Promise((r) => (resolve = r)));
		render(api);
		await fillForm(user);

		await user.click(submitButton());
		expect(submitButton()).toBeDisabled();
		await user.click(submitButton());
		resolve({ success: true, data: ACCOUNT });

		await screen.findByText('Work');
		expect(api.postRaw).toHaveBeenCalledTimes(1);
		expect(api.postRaw).toHaveBeenCalledWith(routes.create, {
			server_url: 'https://cloud.example.com',
			username: 'alice',
			password: 'app-password'
		});
	});

	it.each([
		['external_server_unreachable', "The server couldn't be reached or isn't a CalDAV server. Please check the URL."],
		['external_url_not_allowed', 'This server URL is not allowed. Use the public URL of your server.'],
		['external_no_calendars', 'No calendars were found on this server.'],
		['external_credentials_rejected', 'The server rejected the username or app password.']
	])('shows the %s error in the form', async (code, shown) => {
		const user = userEvent.setup();
		render(fakeApi(async () => refused(code)));
		await fillForm(user);

		await user.click(submitButton());

		expect(await screen.findByText(shown)).toBeInTheDocument();
		expect(submitButton()).toBeEnabled();
	});

	it('links a field error to its input and announces it', async () => {
		const user = userEvent.setup();
		render(fakeApi(async () => refused('external_credentials_rejected')));
		await fillForm(user);

		await user.click(submitButton());

		const shown = 'The server rejected the username or app password.';
		expect(await screen.findByRole('alert')).toHaveTextContent(shown);
		expect(screen.getByLabelText('App password')).toHaveAccessibleDescription(shown);
		expect(screen.getByLabelText('Server URL')).not.toHaveAttribute('aria-describedby');
	});

	it('shows a generic error when the reply is not the API envelope', async () => {
		const user = userEvent.setup();
		render(fakeApi(async () => ({ success: false })));
		await fillForm(user);

		await user.click(submitButton());

		expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong. Please check your input and try again.');
		expect(submitButton()).toBeEnabled();
	});

	it('submits with Enter, once', async () => {
		const user = userEvent.setup();
		let resolve: (value: unknown) => void = () => {};
		const api = fakeApi(() => new Promise((r) => (resolve = r)));
		render(api);
		await fillForm(user);

		await user.keyboard('{Enter}');
		await user.keyboard('{Enter}');
		resolve({ success: true, data: ACCOUNT });

		await screen.findByText('Work');
		expect(api.postRaw).toHaveBeenCalledTimes(1);
	});

	it('sets the mobile keyboard hints on the inputs', () => {
		render(fakeApi(async () => ({ success: true, data: ACCOUNT })));

		const url = screen.getByLabelText('Server URL');
		expect(url).toHaveAttribute('inputmode', 'url');
		expect(url).toHaveAttribute('autocapitalize', 'off');
		expect(url).toHaveAttribute('autocorrect', 'off');
		expect(url).toHaveAttribute('spellcheck', 'false');
		expect(screen.getByLabelText('Username')).toHaveAttribute('autocapitalize', 'off');
		expect(screen.getByLabelText('App password')).toHaveAttribute('autocomplete', 'new-password');
	});

	it('stays closed when the dialog is closed while the account is being checked', async () => {
		const user = userEvent.setup();
		let resolve: (value: unknown) => void = () => {};
		const api = fakeApi(() => new Promise((r) => (resolve = r)));
		const store = render(api);
		await fillForm(user);
		await user.click(submitButton());

		flushSync(() => store.closeDialog());
		resolve({ success: true, data: ACCOUNT });

		await waitFor(() => expect(api.list).toHaveBeenCalled());
		expect(store.dialog).toBeNull();
		expect(api.listRaw).not.toHaveBeenCalled();
	});

	it('leaves a dialog opened in the meantime alone', async () => {
		const user = userEvent.setup();
		let resolve: (value: unknown) => void = () => {};
		const api = fakeApi(() => new Promise((r) => (resolve = r)));
		const store = render(api);
		await fillForm(user);
		await user.click(submitButton());

		const other = { ...ACCOUNT, id: 9 };
		flushSync(() => store.closeDialog());
		flushSync(() => store.openDialog({ step: 'credentials', account: other }));
		resolve({ success: true, data: ACCOUNT });

		await waitFor(() => expect(api.list).toHaveBeenCalled());
		expect(store.dialog).toEqual({ step: 'credentials', account: other });
	});

	it('shows an invalid URL under the URL field', async () => {
		const user = userEvent.setup();
		render(fakeApi(async () => ({ success: false, errors: { server_url: ['The server url field must be a valid URL.'] } })));
		await fillForm(user);

		await user.click(submitButton());

		expect(await screen.findByText('Enter a valid server URL, e.g. https://cloud.example.com.')).toBeInTheDocument();
	});

	it('shows the rate limit in the form', async () => {
		const user = userEvent.setup();
		render(fakeApi(async () => {
			throw new RateLimitedError(60, 'too_many_requests');
		}));
		await fillForm(user);

		await user.click(submitButton());

		expect(await screen.findByText('Too many attempts. Please try again in 1 minute.')).toBeInTheDocument();
	});

	it('lists the calendars of the new account and connects the selected ones', async () => {
		const user = userEvent.setup();
		const api = fakeApi(async (endpoint) => (endpoint === routes.create ? { success: true, data: ACCOUNT } : { success: true, data: [] }));
		render(api);
		await fillForm(user);
		await user.click(submitButton());

		const connect = await screen.findByRole('button', { name: 'Connect' });
		expect(api.listRaw).toHaveBeenCalledWith(routes.available.replace('%d', '7'));
		expect(screen.getByRole('checkbox', { name: 'Personal' })).toBeDisabled();
		expect(connect).toBeDisabled();

		await user.click(screen.getByText('Work'));
		expect(screen.getByRole('checkbox', { name: 'Work' })).toBeChecked();
		await user.click(connect);

		await waitFor(() => expect(screen.queryByRole('button', { name: 'Connect' })).toBeNull());
		expect(api.postRaw).toHaveBeenLastCalledWith(routes.connect.replace('%d', '7'), { urls: ['https://cloud.example.com/dav/work/'] });
		expect(api.list).toHaveBeenCalledWith(apiRoutes.calendars.listCalendars);
	});
});

describe('ExternalAccountModal app password flow', () => {
	it('returns to the calendar list after a rejected app password was changed there', async () => {
		const user = userEvent.setup();
		const api = fakeApi(async () => ({ success: true, data: [] }));
		api.listRaw.mockResolvedValueOnce(refused('external_credentials_rejected'));
		render(api, { step: 'calendars', account: ACCOUNT });

		await user.click(await screen.findByRole('button', { name: 'Change app password' }));
		await user.type(screen.getByLabelText('App password'), 'new-password');
		await user.click(screen.getByRole('button', { name: 'Save' }));

		expect(await screen.findByText('Work')).toBeInTheDocument();
		expect(api.putRaw).toHaveBeenCalledWith(routes.update.replace('%d', '7'), { username: 'alice', password: 'new-password' });
		expect(api.listRaw).toHaveBeenCalledTimes(2);
	});

	it('closes after an app password change started from the account list', async () => {
		const user = userEvent.setup();
		const api = fakeApi(async () => ({ success: true, data: [] }));
		const store = render(api, { step: 'credentials', account: ACCOUNT });

		await user.type(screen.getByLabelText('App password'), 'new-password');
		await user.click(screen.getByRole('button', { name: 'Save' }));

		await waitFor(() => expect(store.dialog).toBeNull());
		expect(api.listRaw).not.toHaveBeenCalled();
	});
});
