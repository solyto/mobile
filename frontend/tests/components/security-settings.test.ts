import { describe, it, expect, vi, afterEach } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/svelte';
import { Auth } from '$lib/state/Auth.svelte';
import type { KeyManager } from '$lib/state/KeyManager.svelte';
import type { Passkey, PasskeyRegistrationOptions } from '$lib/types/auth';
import SecuritySettings from '$lib/components/settings/SecuritySettings.svelte';
import { en } from '$lib/i18n/en';
import { renderWithContext } from './helpers/context';

vi.mock('@simplewebauthn/browser', () => ({ startRegistration: vi.fn().mockResolvedValue({ id: 'credential' }) }));

const passkey: Passkey = { id: 'pk-1', name: 'Laptop', created_at: '2026-11-01T10:00:00Z', last_used_at: null, transports: null };

let forward: ((event: KeyboardEvent) => void) | null = null;

afterEach(() => {
	if (forward) window.removeEventListener('keydown', forward);
	forward = null;
});

function renderSecurity(passkeys: Passkey[] = []) {
	vi.spyOn(Auth.prototype, 'getPasskeys').mockResolvedValue(passkeys);
	renderWithContext(SecuritySettings, {}, {
		onReady: (stores) => {
			const keyManager = stores.keyManager as KeyManager;
			forward = (event) => keyManager.handleKeyDown(event);
			window.addEventListener('keydown', forward);
		}
	});
}

function press(element: HTMLElement, key: string) {
	element.focus();
	return fireEvent.keyDown(element, { key });
}

async function openNameInput(): Promise<HTMLElement> {
	vi.spyOn(Auth.prototype, 'passkeyRegistrationOptions').mockResolvedValue({} as PasskeyRegistrationOptions);
	await fireEvent.click(await screen.findByRole('button', { name: en.settings.passkey_add }));
	return screen.findByPlaceholderText(en.settings.passkey_name_placeholder);
}

async function openRename(): Promise<HTMLElement> {
	const row = (await screen.findByText(passkey.name)).closest('li')!;
	await fireEvent.click(within(row).getAllByRole('button')[0]);
	return screen.findByDisplayValue(passkey.name);
}

describe('Security settings', () => {
	it('registers the passkey under the typed name on Enter', async () => {
		const register = vi.spyOn(Auth.prototype, 'passkeyRegister').mockResolvedValue();
		renderSecurity();
		const input = await openNameInput();

		await fireEvent.input(input, { target: { value: 'Phone' } });
		await press(input, 'Enter');

		await waitFor(() => expect(register).toHaveBeenCalledWith({ id: 'credential' }, 'Phone'));
		expect(register).toHaveBeenCalledTimes(1);
	});

	it('drops the new passkey on Escape', async () => {
		const register = vi.spyOn(Auth.prototype, 'passkeyRegister').mockResolvedValue();
		renderSecurity();
		const input = await openNameInput();

		await press(input, 'Escape');

		await waitFor(() => expect(screen.queryByPlaceholderText(en.settings.passkey_name_placeholder)).not.toBeInTheDocument());
		expect(register).not.toHaveBeenCalled();
	});

	it('renames a passkey on Enter and leaves the rename on Escape', async () => {
		const rename = vi.spyOn(Auth.prototype, 'renamePasskey').mockResolvedValue();
		renderSecurity([passkey]);

		let input = await openRename();
		await press(input, 'Escape');
		expect(await screen.findByText(passkey.name)).toBeInTheDocument();
		expect(rename).not.toHaveBeenCalled();

		input = await openRename();
		await fireEvent.input(input, { target: { value: 'Work laptop' } });
		await press(input, 'Enter');

		await waitFor(() => expect(rename).toHaveBeenCalledWith(passkey.id, 'Work laptop'));
		expect(await screen.findByText('Work laptop')).toBeInTheDocument();
		expect(rename).toHaveBeenCalledTimes(1);
	});

	it('ignores Enter and Escape that are not typed into the name field', async () => {
		const register = vi.spyOn(Auth.prototype, 'passkeyRegister').mockResolvedValue();
		renderSecurity();
		const input = await openNameInput();

		await fireEvent.input(input, { target: { value: 'Phone' } });
		input.blur();
		await fireEvent.keyDown(document.body, { key: 'Enter' });
		await fireEvent.keyDown(document.body, { key: 'Escape' });

		expect(register).not.toHaveBeenCalled();
		expect(screen.getByPlaceholderText(en.settings.passkey_name_placeholder)).toBeInTheDocument();
	});
});
