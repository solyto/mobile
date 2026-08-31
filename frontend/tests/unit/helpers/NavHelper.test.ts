import { describe, it, expect, vi } from 'vitest';

vi.mock('$app/state', () => ({
	page: {
		url: {
			pathname: '/todos'
		}
	}
}));

import {
	getPageSlug,
	getPageFeature,
	showNavbar,
	isDashboard,
	isAdminRoute,
	isAuthRoute,
	isSetupRoute
} from '$lib/helpers/NavHelper';

import { page } from '$app/state';

function setPath(pathname: string) {
	// @ts-expect-error mock object is intentionally mutable
	page.url.pathname = pathname;
}

describe('getPageSlug', () => {
	it('extracts the first path segment', () => {
		setPath('/todos');
		expect(getPageSlug()).toBe('todos');
		setPath('/calendar/month');
		expect(getPageSlug()).toBe('calendar');
	});

	it('defaults to home for the root path', () => {
		setPath('/');
		expect(getPageSlug()).toBe('home');
	});
});

describe('getPageFeature', () => {
	it('maps a known slug to its feature flag', () => {
		setPath('/todos');
		expect(getPageFeature()).toBe('todos');
		setPath('/calendar');
		expect(getPageFeature()).toBe('calendar');
	});

	it('returns null for the home page and unknown slugs', () => {
		setPath('/');
		expect(getPageFeature()).toBeNull();
		setPath('/unknown');
		expect(getPageFeature()).toBeNull();
	});
});

describe('route guards', () => {
	it('isDashboard matches only the home url', () => {
		setPath('/');
		expect(isDashboard()).toBe(true);
		setPath('/todos');
		expect(isDashboard()).toBe(false);
	});

	it('isAdminRoute matches /admin paths', () => {
		setPath('/admin');
		expect(isAdminRoute()).toBe(true);
		setPath('/admin/users');
		expect(isAdminRoute()).toBe(true);
		setPath('/todos');
		expect(isAdminRoute()).toBe(false);
	});

	it('isAuthRoute matches /auth paths', () => {
		setPath('/auth/login');
		expect(isAuthRoute()).toBe(true);
		setPath('/todos');
		expect(isAuthRoute()).toBe(false);
	});

	it('isSetupRoute matches /setup paths', () => {
		setPath('/setup');
		expect(isSetupRoute()).toBe(true);
		setPath('/todos');
		expect(isSetupRoute()).toBe(false);
	});

	it('showNavbar hides the navbar on auth/admin/setup routes', () => {
		setPath('/todos');
		expect(showNavbar()).toBe(true);
		setPath('/auth/login');
		expect(showNavbar()).toBe(false);
		setPath('/admin');
		expect(showNavbar()).toBe(false);
		setPath('/setup');
		expect(showNavbar()).toBe(false);
	});
});
