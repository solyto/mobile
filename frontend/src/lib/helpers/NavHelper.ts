import { page } from '$app/state';
import { navItems, type FeatureType } from '$lib/config/navigation';
import { urls } from '$lib/config/urls';

export function getPageSlug(): string {
	return page.url.pathname.substring(1).split('/')[0] || 'home';
}

export function getPageFeature(): FeatureType | null {
	return navItems[getPageSlug()]?.featureFlag ?? null;
}

export function showNavbar(): boolean {
	return !isAuthRoute() && !isAdminRoute() && !isSetupRoute();
}

export function isDashboard(): boolean {
	return page.url.pathname === urls.home;
}

export function isAdminRoute(): boolean {
	return page.url.pathname.startsWith('/admin');
}

export function isAuthRoute(): boolean {
	return page.url.pathname.startsWith('/auth');
}

export function isSetupRoute(): boolean {
	return page.url.pathname.startsWith('/setup');
}