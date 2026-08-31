import { describe, it, expect, vi } from 'vitest';

async function loadUrls(env: Record<string, string> = {}) {
	vi.resetModules();
	vi.doMock('$env/dynamic/public', () => ({ env }));
	return import('$lib/config/urls');
}

describe('legalUrls', () => {
	it('is null when no URLs are configured', async () => {
		const { legalUrls, hasLegalUrls } = await loadUrls();
		expect(legalUrls).toEqual({ legalNotice: null, privacy: null, terms: null });
		expect(hasLegalUrls).toBe(false);
	});

	it('reads the configured URLs from the environment', async () => {
		const { legalUrls, hasLegalUrls } = await loadUrls({
			PUBLIC_LEGAL_NOTICE_URL: 'https://solyto.app/imprint',
			PUBLIC_PRIVACY_URL: 'https://solyto.app/privacy'
		});
		expect(legalUrls.legalNotice).toBe('https://solyto.app/imprint');
		expect(legalUrls.privacy).toBe('https://solyto.app/privacy');
		expect(legalUrls.terms).toBeNull();
		expect(hasLegalUrls).toBe(true);
	});
});

describe('urls', () => {
	it('defines the core routes', async () => {
		const { urls } = await loadUrls();
		expect(urls.home).toBe('/');
		expect(urls.login).toBe('/auth/login');
		expect(urls.todos).toBe('/todos');
		expect(urls.admin.users).toBe('/admin/users');
		expect(urls.landingPage).toBe('https://solyto.app');
	});
});

describe('getDeepLinkUrl', () => {
	it('returns the platform-specific deep link', async () => {
		const { getDeepLinkUrl } = await loadUrls();
		expect(getDeepLinkUrl('mobile')).toBe('app.solyto://auth/login');
		expect(getDeepLinkUrl('desktop')).toBe('solyto://auth/login');
	});

	it('returns null for unknown platforms or no platform', async () => {
		const { getDeepLinkUrl } = await loadUrls();
		expect(getDeepLinkUrl('web')).toBeNull();
		expect(getDeepLinkUrl(null)).toBeNull();
	});
});
