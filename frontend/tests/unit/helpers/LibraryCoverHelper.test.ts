import { describe, it, expect } from 'vitest';
import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
import type { User } from '$lib/types/auth';
import { libraryCoverUrl, previewFilename } from '$lib/helpers/LibraryCoverHelper';

describe('LibraryCoverHelper', () => {
	it('finds a cover in the user\'s folder of the library', () => {
		const library = { auth: { user: { id: 'u1' } as User }, config: { type: 'books' as const } };
		expect(libraryCoverUrl(library, 'dune.jpg')).toBe(`${API_USER_STORAGE_URL}/u1/books/dune.jpg`);
	});

	it('names the preview after the cover, before the extension', () => {
		expect(previewFilename('dune.cover.jpg')).toBe('dune.cover_preview.jpg');
		expect(previewFilename('dune')).toBe('dune_preview');
	});
});
