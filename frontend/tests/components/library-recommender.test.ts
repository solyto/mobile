import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import ApiService from '$lib/services/ApiService';
import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
import { renderWithContext } from './helpers/context';
import RecommenderHarness from './helpers/RecommenderHarness.svelte';

const found = { id: 7, title: 'Found', author: null, artist: null, cover: 'https://img/cover.jpg', release_year: null, provider: 'x', url: 'https://found' };

describe('Library recommender', () => {
	it.each([
		['books', 'hardcover'],
		['music', 'deezer']
	] as const)('looks up a new %s recommendation in its own library\'s search (%s)', async (type, provider) => {
		vi.spyOn(ApiService.prototype, 'list').mockResolvedValue(null);
		let library: BookLibrary | MusicLibrary | null = null;
		renderWithContext(RecommenderHarness, { type, onReady: (l: BookLibrary | MusicLibrary) => (library = l) });
		vi.spyOn(library!, 'recommend').mockResolvedValue({ id: null, title: 'Dune', creator: 'Frank Herbert', genre: 'Sci-Fi', cover: null, link: null });
		const search = vi.spyOn(library!, 'searchAt').mockResolvedValue([found]);

		await fireEvent.click(screen.getByRole('button', { name: /Recommendations/ }));
		await fireEvent.click(await screen.findByRole('button', { name: 'Something new' }));

		await waitFor(() => expect(search).toHaveBeenCalledWith(provider, 'Frank Herbert Dune'));
	});
});
