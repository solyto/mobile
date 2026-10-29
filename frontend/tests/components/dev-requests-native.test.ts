import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/svelte';
import FixedIn from '$lib/components/dev-requests/FixedIn.svelte';
import { renderWithContext } from './helpers/context';

vi.mock('$lib/config/platform', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/config/platform')>()),
	IS_WEB: false,
	CLIENT_VERSION: '1.1.1'
}));

describe('FixedIn in the native app', () => {
	it('marks a fix the installed version already has', () => {
		renderWithContext(FixedIn, { version: '1.1.0' });
		expect(screen.getByText('Fixed in 1.1.0 ✓')).toBeInTheDocument();
	});

	it('tells the user an update is pending when their version is older', () => {
		renderWithContext(FixedIn, { version: '1.2.0' });
		expect(screen.getByText('Fixed in 1.2.0 · update pending')).toHaveAttribute('title', "You're on 1.1.1");
	});
});
