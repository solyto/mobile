import { describe, it, expect, vi, afterEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import type { Auth } from '$lib/state/Auth.svelte';
import type ApiService from '$lib/services/ApiService';
import type LocalStorageService from '$lib/services/LocalStorageService';
import { BookLibrary } from '$lib/state/BookLibrary.svelte';
import CardsView from '$lib/components/libraries/shared/CardsView.svelte';
import ListView from '$lib/components/libraries/shared/ListView.svelte';
import Header from '$lib/components/libraries/shared/Header.svelte';
import ShelfView from '$lib/components/libraries/shared/ShelfView.svelte';
import Cover from '$lib/components/libraries/shared/Cover.svelte';
import ViewSwitcher from '$lib/components/libraries/shared/ViewSwitcher.svelte';
import Filter from '$lib/components/libraries/filters/Filter.svelte';
import MusicRelease from '$lib/components/libraries/shared/MusicRelease.svelte';
import BookRelease from '$lib/components/libraries/shared/BookRelease.svelte';
import { MovieLibrary } from '$lib/state/MovieLibrary.svelte';
import { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
import RealLocalStorageService from '$lib/services/LocalStorageService';
import type { UiNotifications } from '$lib/state/UiNotifications.svelte';
import { en } from '$lib/i18n/en';
import { renderWithContext } from './helpers/context';
import { book, genre, music, plant } from '../unit/helpers/factories';

const storage = { get: vi.fn(() => null), set: vi.fn() } as unknown as LocalStorageService;

function renderWithLibrary(component: Parameters<typeof renderWithContext>[0], entries = [book({ id: 'b1', title: 'Dune', cover: 'dune.jpg' })]) {
	let library: BookLibrary | null = null;
	const result = renderWithContext(component, {}, {
		stores: { auth: { user: { id: 'u1' } } },
		prepare: (instances) => {
			library = new BookLibrary(instances.auth as Auth, {} as ApiService, storage);
			library.entries = entries;
			library.filteredEntries = entries;
			return { library };
		}
	});
	return { ...result, library: library! };
}

describe('Library entry views', () => {
	it.each([
		['cards', CardsView],
		['list', ListView]
	])('opens the detail of a clicked entry in the %s view', async (_, View) => {
		const { library } = renderWithLibrary(View);
		const open = vi.spyOn(library, 'openDetailModal');

		await fireEvent.click(screen.getByRole('button', { name: /Dune/ }));

		expect(open).toHaveBeenCalledWith(library.entries[0]);
	});

	it('loads the cover and its preview from the user\'s storage folder', async () => {
		const { container } = renderWithLibrary(CardsView);
		for (const loader of container.querySelectorAll('img[hidden]')) await fireEvent.load(loader);
		const sources = [...container.querySelectorAll('img:not([hidden])')].map((img) => img.getAttribute('src') ?? '');

		expect(sources.some((src) => src.endsWith('/u1/books/dune.jpg'))).toBe(true);
		expect(sources.some((src) => src.endsWith('/u1/books/dune_preview.jpg'))).toBe(true);
		expect(container.querySelector('img[alt="Cover"]')).not.toBeNull();
	});
});

describe('Library header', () => {
	it('shows how many entries the library has', () => {
		renderWithLibrary(Header, [book({ id: '1' }), book({ id: '2' })]);
		expect(screen.getByText('2 entries')).toBeInTheDocument();
	});
});

describe('Library shelf view', () => {
	it('moves between entries with the previous and next buttons', async () => {
		const { library } = renderWithLibrary(ShelfView, [book({ id: '1', title: 'Dune' }), book({ id: '2', title: 'Emma' })]);

		await fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		expect(library.shelfIndex).toBe(1);

		await fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
		expect(library.shelfIndex).toBe(0);
	});
});

describe('Library cover', () => {
	it('describes the cover by the entry title', () => {
		renderWithContext(Cover, { entry: book({ title: 'Dune', cover: 'dune.jpg' }), library: { auth: { user: null }, config: { type: 'books' } } });
		expect(screen.getByAltText('Dune cover')).toBeInTheDocument();
	});

	it('describes a plant cover by its name, else its Latin name', () => {
		const config = { type: 'plants' as const };
		renderWithContext(Cover, { entry: plant({ name: 'Monstera', latin_name: 'Monstera deliciosa', cover: 'a.jpg' }), library: { auth: { user: null }, config } });
		renderWithContext(Cover, { entry: plant({ name: null, latin_name: 'Ficus lyrata', cover: 'b.jpg' }), library: { auth: { user: null }, config } });

		expect(screen.getByAltText('Monstera cover')).toBeInTheDocument();
		expect(screen.getByAltText('Ficus lyrata cover')).toBeInTheDocument();
	});

	it('shows the missing-cover placeholder when the image fails to load', async () => {
		const { container } = renderWithContext(Cover, { entry: book({ title: 'Dune', cover: 'dune.jpg' }), library: { auth: { user: null }, config: { type: 'books' } } });

		await fireEvent.error(screen.getByAltText('Dune cover'));

		expect(screen.queryByAltText('Dune cover')).toBeNull();
		expect(container.querySelector('svg')).not.toBeNull();
	});

	it('falls back to the title when the entry has an empty name', () => {
		renderWithContext(Cover, { entry: { ...book({ title: 'Dune', cover: 'dune.jpg' }), name: null }, library: { auth: { user: null }, config: { type: 'books' } } });
		expect(screen.getByAltText('Dune cover')).toBeInTheDocument();
	});
});

describe('Library view switcher', () => {
	it('offers the shelf views only for libraries with a shelf', () => {
		renderWithLibrary(ViewSwitcher);
		expect(['List', 'Cards', 'Shelf', 'Browse'].map((title) => screen.getByTitle(title))).toHaveLength(4);
	});
});

describe('Library view switcher choices', () => {
	afterEach(() => localStorage.clear());

	it('shows the chosen view and remembers it', async () => {
		let library: BookLibrary | null = null;
		renderWithContext(ViewSwitcher, {}, {
			prepare: (instances) => {
				library = new BookLibrary(instances.auth as Auth, {} as ApiService, new RealLocalStorageService());
				return { library };
			}
		});

		await fireEvent.click(screen.getByTitle('Shelf'));

		expect(library!.view).toBe('spine');
		expect(localStorage.getItem('books_view')).toBe('spine');
	});

	it('remembers the chosen view of a library without a shelf', async () => {
		let library: MovieLibrary | null = null;
		renderWithContext(ViewSwitcher, {}, {
			prepare: (instances) => {
				library = new MovieLibrary(instances.auth as Auth, {} as ApiService);
				return { library };
			}
		});

		await fireEvent.click(screen.getByTitle('List'));

		expect(library!.view).toBe('list');
		expect(localStorage.getItem('movies_view')).toBe('list');
	});
});

describe('Library filter', () => {
	it('drops the genre and rating filters when filtering by wishlist', async () => {
		const entries = [music({ id: '1', wishlist: true }), music({ id: '2' })];
		let created: MusicLibrary | null = null;
		renderWithContext(Filter, {}, {
			prepare: (instances) => {
				created = new MusicLibrary(instances.auth as Auth, {} as ApiService, storage);
				created.entries = entries;
				created.filteredEntries = entries;
				return { library: created };
			}
		});
		const library = created!;
		library.addGenreFilter(genre(1, 'Rock'));
		library.addRatingFilter(4);

		await fireEvent.click(screen.getAllByRole('button')[0]);
		await fireEvent.click(screen.getByRole('button', { name: en.libraries.wishlist }));

		expect(library.genreFilter).toBeNull();
		expect(library.ratingFilter).toBeNull();
		expect(library.wishlistFilter).toBe(true);
		expect(library.filteredEntries.map((entry) => entry.id)).toEqual(['1']);
	});
});

describe('Adding a release to the wishlist', () => {
	const musicRelease = { id: 1, artist: 'Muse', artist_id: 2, title: 'Drones', url: 'https://deezer.com/album/1', cover: 'https://cdn/drones.jpg', provider: 'deezer', release_date: '2026-11-20', genres: [], record_type: null };
	const bookRelease = { id: 1, author: 'Le Guin', author_id: 2, title: 'Earthsea', description: 'Wizards', page_count: 300, url: 'https://hardcover.app/books/1', cover: null, provider: 'hardcover', release_date: '2026-11-20' };

	const cases = [
		['music', MusicRelease, musicRelease, { title: 'Drones', artist: 'Muse', cover_path: 'https://cdn/drones.jpg', publication_year: 2026, link: 'https://deezer.com/album/1', wishlist: true }],
		['book', BookRelease, bookRelease, { title: 'Earthsea', author: 'Le Guin', cover_path: null, publication_year: 2026, link: 'https://hardcover.app/books/1', pages: 300, summary: 'Wizards', wishlist: true }]
	] as const;

	function renderRelease(component: Parameters<typeof renderWithContext>[0], release: unknown, created: boolean) {
		let notifications: UiNotifications | null = null;
		const create = vi.fn().mockResolvedValue(created);
		renderWithContext(component, {}, {
			prepare: (instances) => {
				notifications = instances.uiNotifications as UiNotifications;
				const library = component === MusicRelease
					? new MusicLibrary(instances.auth as Auth, {} as ApiService, storage)
					: new BookLibrary(instances.auth as Auth, {} as ApiService, storage);
				library.create = create;
				return { release, library };
			}
		});
		return { create, notifications: () => notifications! };
	}

	it.each(cases)('adds a %s release to the wishlist once', async (_, component, release, request) => {
		const { create, notifications } = renderRelease(component, release, true);

		await fireEvent.click(screen.getByRole('button', { name: en.libraries.add_to_wishlist }));

		expect(create).toHaveBeenCalledWith(request);
		const added = await screen.findByRole('button', { name: en.libraries.added_to_wishlist });
		expect(added).toBeDisabled();
		expect(notifications().queue).toHaveLength(0);
	});

	it.each(cases)('tells when a %s release could not be added', async (_, component, release) => {
		const { notifications } = renderRelease(component, release, false);

		await fireEvent.click(screen.getByRole('button', { name: en.libraries.add_to_wishlist }));

		await vi.waitFor(() => expect(notifications().queue.map((n) => n.message)).toEqual([en.libraries.add_to_wishlist_error]));
		expect(screen.getByRole('button', { name: en.libraries.add_to_wishlist })).toBeEnabled();
	});
});
