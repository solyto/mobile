import { describe, it, expect } from 'vitest';
import { notePreview } from '$lib/helpers/NotePreviewHelper';

describe('notePreview', () => {
	it('turns editor HTML into one line of text', () => {
		expect(notePreview('<h1>Title</h1><p>First <strong>bold</strong> line</p><p>Second</p>')).toBe(
			'Title First bold line Second'
		);
	});

	it('strips markdown from notes written before the rich-text editor', () => {
		expect(notePreview('# Heading\n\n**bold** and _italic_ with `code`')).toBe('Heading bold and italic with');
		expect(notePreview('- one\n2. two\n> quote ~x~')).toBe('one two quote x');
		expect(notePreview('see [the docs](https://example.com)')).toBe('see the docs');
	});

	it('returns an empty string for empty content', () => {
		expect(notePreview('<p></p>')).toBe('');
	});
});
