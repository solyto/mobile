import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { apiRoutes } from '$lib/config/apiRoutes';
import { LinkLibrary } from '$lib/state/LinkLibrary.svelte';
import { renderWithContext } from './helpers/context';
import CategoryNavigationMobileHarness from './helpers/CategoryNavigationMobileHarness.svelte';

const work = { id: 7, title: 'Work', color: '#ff0000' };
const home = { id: 9, title: 'Home', color: null };

function fakeApi() {
	const links = [
		{ id: 1, title: 'a', url: 'https://a.test', is_favorite: true, category: work },
		{ id: 2, title: 'b', url: 'https://b.test', is_favorite: false, category: work },
		{ id: 3, title: 'c', url: 'https://c.test', is_favorite: false, category: null }
	];
	return {
		list: vi.fn(async (endpoint: string) => {
			if (endpoint === apiRoutes.libraries.links.list) return { data: links };
			if (endpoint === apiRoutes.libraries.links.listCategories) return { data: [work, home] };
			return { data: [] };
		})
	};
}

async function openMenu() {
	const user = userEvent.setup();
	renderWithContext(CategoryNavigationMobileHarness, {}, { stores: { auth: { apiService: fakeApi() } } });
	await user.click(screen.getByRole('button'));
	const panel = screen.getByText('Links').closest('.secondary-nav-mobile-container') as HTMLElement;
	await waitFor(() => expect(within(panel).getByRole('button', { name: /Work/ })).toBeTruthy());
	return { user, panel };
}

function rows(panel: HTMLElement): HTMLElement[] {
	return within(panel).getAllByRole('button').filter((button) => button.textContent?.trim());
}

describe('CategoryNavigationMobile', () => {
	it('lists All, Favorites, Uncategorized and each category with its count', async () => {
		const { panel } = await openMenu();

		expect(rows(panel).map((row) => row.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
			'All 3',
			'Favorites 1',
			'Uncategorized 1',
			'Work 2',
			'Home 0'
		]);
	});

	it('marks the active row with aria-current', async () => {
		const { user, panel } = await openMenu();

		expect(rows(panel).filter((row) => row.getAttribute('aria-current') === 'true').map((row) => row.textContent?.trim())).toEqual([
			expect.stringContaining('All')
		]);

		await user.click(within(panel).getByRole('button', { name: /Work/ }));
		await waitFor(() => expect(screen.queryByText('Links')).toBeNull());
		await user.click(screen.getByRole('button'));
		const reopened = screen.getByText('Links').closest('.secondary-nav-mobile-container') as HTMLElement;
		const current = rows(reopened).filter((row) => row.getAttribute('aria-current') === 'true');
		expect(current).toHaveLength(1);
		expect(current[0].textContent).toContain('Work');
	});

	it.each([
		['All', 'filterByCategory', [null]],
		['Favorites', 'filterByFavorite', []],
		['Uncategorized', 'filterByCategory', [0]],
		['Work', 'filterByCategory', [7]]
	] as const)('picking %s calls %s and closes the panel', async (label, method, args) => {
		const spy = vi.spyOn(LinkLibrary.prototype, method);
		const { user, panel } = await openMenu();

		await user.click(within(panel).getByRole('button', { name: new RegExp(`^${label}`) }));

		expect(spy).toHaveBeenCalledWith(...args);
		await waitFor(() => expect(screen.queryByText('Links')).toBeNull());
	});
});
