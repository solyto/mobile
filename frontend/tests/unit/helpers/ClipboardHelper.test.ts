import { describe, it, expect } from 'vitest';
import { clipboardImageFileName } from '$lib/helpers/ClipboardHelper';
import { clipboardEntry } from './factories';

describe('clipboardImageFileName', () => {
	it('keeps the extension of the stored file', () => {
		expect(clipboardImageFileName(clipboardEntry({ id: 7, file_path: 'clipboard/abc.webp' }), 'image/png')).toBe('clipboard-7.webp');
	});

	it('takes the extension from the image type when the path has none', () => {
		expect(clipboardImageFileName(clipboardEntry({ id: 7, file_path: null }), 'image/gif')).toBe('clipboard-7.gif');
	});

	it('writes jpeg as jpg', () => {
		expect(clipboardImageFileName(clipboardEntry({ id: 7 }), 'image/jpeg')).toBe('clipboard-7.jpg');
	});

	it('falls back to png when the type is unknown', () => {
		expect(clipboardImageFileName(clipboardEntry({ id: 7 }), '')).toBe('clipboard-7.png');
	});
});
