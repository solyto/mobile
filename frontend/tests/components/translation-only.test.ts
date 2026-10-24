import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from './helpers/context';
import PasswordInput from '$lib/components/forms/PasswordInput.svelte';
import PasswordStrengthIndicator from '$lib/components/forms/PasswordStrengthIndicator.svelte';
import PasswordMatchIndicator from '$lib/components/forms/PasswordMatchIndicator.svelte';
import CookieBanner from '$lib/components/ui/CookieBanner.svelte';
import PopupConfirmationModal from '$lib/components/ui/PopupConfirmationModal.svelte';
import BottomSheetConfirmationModal from '$lib/components/ui/BottomSheetConfirmationModal.svelte';
import ImportButton from '$lib/components/ui/buttons/ImportButton.svelte';
import GoodreadsImportButton from '$lib/components/ui/buttons/GoodreadsImportButton.svelte';
import HardcoverImportButton from '$lib/components/ui/buttons/HardcoverImportButton.svelte';
import BggImportButton from '$lib/components/ui/buttons/BggImportButton.svelte';
import SteamImportButton from '$lib/components/ui/buttons/SteamImportButton.svelte';
import DeezerImportButton from '$lib/components/ui/buttons/DeezerImportButton.svelte';
import DiscogsImportButton from '$lib/components/ui/buttons/DiscogsImportButton.svelte';
import ImdbImportButton from '$lib/components/ui/buttons/ImdbImportButton.svelte';
import ChefkochImportButton from '$lib/components/ui/buttons/ChefkochImportButton.svelte';
import NavLegalEntry from '$lib/components/ui/NavLegalEntry.svelte';

describe('PasswordInput', () => {
	it('renders a password field', () => {
		renderWithContext(PasswordInput, { value: 'secret', placeholder: 'Password' });
		const input = screen.getByPlaceholderText('Password');
		expect(input).toHaveAttribute('type', 'password');
		expect(input).toHaveValue('secret');
	});

	it('toggles the visibility and the aria-label', async () => {
		const user = userEvent.setup();
		const { container } = renderWithContext(PasswordInput, {
			value: 'secret',
			showToggle: true
		});
		const input = container.querySelector('input')!;

		const toggle = screen.getByRole('button');
		expect(toggle).toHaveAttribute('aria-label', 'Show password');
		expect(input).toHaveAttribute('type', 'password');

		await user.click(toggle);
		expect(input).toHaveAttribute('type', 'text');
		expect(toggle).toHaveAttribute('aria-label', 'Hide password');
	});

	it('omits the toggle when showToggle is not set', () => {
		renderWithContext(PasswordInput, { value: 'secret' });
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});
});

describe('PasswordStrengthIndicator', () => {
	it('shows the min-length hint with a check when satisfied', () => {
		renderWithContext(PasswordStrengthIndicator, { password: 'very-long-password' });
		const hint = screen.getByText('At least 12 characters');
		expect(hint).toHaveClass('text-green-600');
	});

	it('shows an X when the password is too short', () => {
		renderWithContext(PasswordStrengthIndicator, { password: 'short' });
		const hint = screen.getByText('At least 12 characters');
		expect(hint).not.toHaveClass('text-green-600');
	});

	it('renders nothing for an empty password', () => {
		const { container } = renderWithContext(PasswordStrengthIndicator, { password: '' });
		expect(container.textContent).toBe('');
	});
});

describe('PasswordMatchIndicator', () => {
	it('shows a success state when the passwords match', () => {
		renderWithContext(PasswordMatchIndicator, {
			password: 'same',
			passwordConfirmation: 'same'
		});
		const hint = screen.getByText('Passwords match');
		expect(hint).toHaveClass('text-green-600');
	});

	it('shows a failure state when they differ', () => {
		renderWithContext(PasswordMatchIndicator, {
			password: 'same',
			passwordConfirmation: 'other'
		});
		const hint = screen.getByText('Passwords match');
		expect(hint).not.toHaveClass('text-green-600');
	});

	it('renders nothing when the confirmation is empty', () => {
		const { container } = renderWithContext(PasswordMatchIndicator, {
			password: 'same',
			passwordConfirmation: ''
		});
		expect(container.textContent).toBe('');
	});
});

describe('CookieBanner', () => {
	it('is hidden once the consent is acknowledged', () => {
		const { container } = renderWithContext(
			CookieBanner,
			{},
			{
				stores: { cookieConsent: { acknowledged: true } }
			}
		);
		expect(container.textContent).toBe('');
	});

	it('renders the consent text and acknowledges on accept', async () => {
		const user = userEvent.setup();
		renderWithContext(CookieBanner, {}, { stores: { cookieConsent: { acknowledged: false } } });

		expect(screen.getByText('Storage Notice')).toBeInTheDocument();
		expect(screen.getByText(/We use local storage/)).toBeInTheDocument();
		expect(screen.getByText('Privacy Policy')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Got it' }));
		expect(screen.queryByText('Storage Notice')).not.toBeInTheDocument();
	});
});

describe('PopupConfirmationModal', () => {
	it('renders the explanation and the confirm/cancel buttons, firing the handlers', async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn().mockResolvedValue(undefined);
		const onCancel = vi.fn();

		renderWithContext(PopupConfirmationModal, {
			title: 'Delete?',
			description: 'This cannot be undone.',
			type: 'confirm-delete',
			onConfirm,
			onCancel
		});

		// the modal fades in via a setTimeout(0)
		await new Promise((r) => setTimeout(r, 10));

		expect(screen.getByText('Delete?')).toBeInTheDocument();
		expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
		expect(screen.getByText('Confirm')).toBeInTheDocument();
		expect(screen.getByText('Cancel')).toBeInTheDocument();

		await user.click(screen.getByText('Cancel'));
		expect(onCancel).toHaveBeenCalled();

		await user.click(screen.getByText('Confirm'));
		expect(onConfirm).toHaveBeenCalled();
	});
});

describe('BottomSheetConfirmationModal', () => {
	it('renders the confirm button and fires onConfirm', async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		renderWithContext(BottomSheetConfirmationModal, {
			title: 'Sheet title',
			onConfirm,
			onCancel
		});

		expect(screen.getByText('Sheet title')).toBeInTheDocument();
		await user.click(screen.getByText('Confirm'));
		expect(onConfirm).toHaveBeenCalled();
	});

	it('uses a danger confirm button for confirm-delete', () => {
		const { container } = renderWithContext(BottomSheetConfirmationModal, {
			type: 'confirm-delete',
			onConfirm: vi.fn(),
			onCancel: vi.fn()
		});
		const buttons = container.querySelectorAll('button');
		const dangerButton = Array.from(buttons).find((b) => b.textContent === 'Confirm');
		expect(dangerButton?.classList.contains('bg-c-danger')).toBe(true);
	});
});

describe('ImportButton', () => {
	it('fires onClick and forwards the title', () => {
		const onClick = vi.fn();
		render(ImportButton, { props: { onClick, title: 'Import' } });
		expect(screen.getByTitle('Import')).toBeInTheDocument();
		fireEvent.click(screen.getByTitle('Import'));
		expect(onClick).toHaveBeenCalled();
	});
});

describe('NavLegalEntry', () => {
	it('renders nothing when no legal urls are configured', () => {
		// the shared component setup mocks $env/dynamic/public with an empty env,
		// so hasLegalUrls is false and the entry is hidden
		const { container } = renderWithContext(NavLegalEntry, {});
		expect(container.textContent).toBe('');
	});
});

describe('provider import buttons', () => {
	it.each([
		[GoodreadsImportButton, 'Import from goodreads'],
		[HardcoverImportButton, 'Import from Hardcover'],
		[BggImportButton, 'Import from BGG'],
		[SteamImportButton, 'Import from Steam'],
		[DeezerImportButton, 'Import from Deezer'],
		[DiscogsImportButton, 'Import from Discogs'],
		[ImdbImportButton, 'Import from IMDb'],
		[ChefkochImportButton, 'Import from Chefkoch']
	])('renders the translated label and fires onClick', async (Component, label) => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		renderWithContext(Component, { onClick, loading: false });
		expect(screen.getByText(label)).toBeInTheDocument();
		await user.click(screen.getByText(label));
		expect(onClick).toHaveBeenCalled();
	});
});
