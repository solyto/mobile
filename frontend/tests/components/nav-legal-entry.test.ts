import { vi } from 'vitest';

// The legal links come from the public env, so this file registers its own $env
// mock (overriding the empty one from the shared component setup) before
// importing the component.
vi.mock('$env/dynamic/public', () => ({
	env: {
		PUBLIC_LEGAL_NOTICE_URL: 'https://example.com/legal',
		PUBLIC_PRIVACY_URL: 'https://example.com/privacy',
		PUBLIC_TERMS_URL: 'https://example.com/terms'
	}
}));

import { describe, it, expect } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithContext } from './helpers/context';
import NavLegalEntry from '$lib/components/ui/NavLegalEntry.svelte';

describe('NavLegalEntry', () => {
	it('opens the legal links when the button is clicked', async () => {
		const user = userEvent.setup();
		renderWithContext(NavLegalEntry, {});

		await user.click(screen.getByTitle('Legal'));

		expect(screen.getByText('Legal Notice')).toBeInTheDocument();
		expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
		expect(screen.getByText('Terms of Service')).toBeInTheDocument();
		expect(screen.getByText('Open-source attributions')).toBeInTheDocument();
	});

	it('links to the configured legal urls', async () => {
		const user = userEvent.setup();
		renderWithContext(NavLegalEntry, {});

		await user.click(screen.getByTitle('Legal'));

		expect(screen.getByText('Legal Notice')).toHaveAttribute(
			'href',
			'https://example.com/legal'
		);
		expect(screen.getByText('Privacy Policy')).toHaveAttribute(
			'href',
			'https://example.com/privacy'
		);
		expect(screen.getByText('Terms of Service')).toHaveAttribute(
			'href',
			'https://example.com/terms'
		);
	});

	it('opens the attributions page inside the app', async () => {
		const user = userEvent.setup();
		renderWithContext(NavLegalEntry, {});

		await user.click(screen.getByTitle('Legal'));

		const link = screen.getByText('Open-source attributions');
		expect(link).toHaveAttribute('href', '/attributions');
		expect(link).not.toHaveAttribute('target');
	});
});

describe('NavLegalEntry position', () => {
	function popup(): HTMLElement {
		return screen.getByText('Open-source attributions').parentElement as HTMLElement;
	}

	it('opens to the right of the click on desktop', async () => {
		renderWithContext(NavLegalEntry, {});

		await fireEvent.click(screen.getByTitle('Legal'), { clientX: 100, clientY: 700 });

		expect(popup().style.bottom).toBe(`${window.innerHeight - 700}px`);
		expect(popup().style.left).toBe('120px');
	});

	it('opens to the left of and above the click on mobile', async () => {
		renderWithContext(NavLegalEntry, { mobile: true });

		await fireEvent.click(screen.getByTitle('Legal'), { clientX: 1000, clientY: 700 });

		expect(popup().style.bottom).toBe(`${window.innerHeight - 700 + 20}px`);
		expect(popup().style.right).toBe(`${window.innerWidth - 1000}px`);
	});

	it('closes again on a second click', async () => {
		renderWithContext(NavLegalEntry, {});

		await fireEvent.click(screen.getByTitle('Legal'));
		await fireEvent.click(screen.getByTitle('Legal'));

		expect(screen.queryByText('Open-source attributions')).not.toBeInTheDocument();
	});
});
