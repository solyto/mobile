import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QuickAdd } from '$lib/state/QuickAdd.svelte';
import { api, resetStoreMocks } from '../setup/storeMocks';

// QuickAdd reads getTranslation() and getUiNotifications() at field
// initialisation; the storeMocks setup does not cover those modules, so they
// are stubbed per file.
const notifications = { error: vi.fn(), success: vi.fn() };
const ts = {
	get: {
		quick_add: {
			detect_error: 'Failed to detect content type.',
			commit_error: "Couldn't add this. Try again.",
			commit_success: 'Added to %s.',
			destinations: {
				music: 'your music library',
				books: 'your book library',
				movies: 'your movie library',
				games: 'your game library',
				links: 'your links',
				recipes: 'your recipe library',
				plants: 'your plant library',
				quotes: 'your quote library',
				todo: 'your todos',
				note: 'your notes',
				feed: 'your feeds',
				clipboard: 'your clipboard'
			}
		}
	}
};

vi.mock('$lib/state/Translation.svelte', () => ({
	getTranslation: () => ts
}));

vi.mock('$lib/state/UiNotifications.svelte', () => ({
	getUiNotifications: () => notifications
}));

beforeEach(() => {
	resetStoreMocks();
	notifications.error.mockClear();
	notifications.success.mockClear();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('QuickAdd store', () => {
	describe('isUrl', () => {
		it('detects valid urls', () => {
			const s = new QuickAdd();
			s.content = 'https://example.com/article';
			expect(s.isUrl).toBe(true);
		});

		it('rejects plain text', () => {
			const s = new QuickAdd();
			s.content = 'just some text';
			expect(s.isUrl).toBe(false);
		});

		it('rejects empty content', () => {
			const s = new QuickAdd();
			expect(s.isUrl).toBe(false);
		});
	});

	describe('modal state', () => {
		it('openModal resets and opens', () => {
			const s = new QuickAdd();
			s.content = 'leftover';
			s.error = 'boom';
			s.openModal();
			expect(s.open).toBe(true);
			expect(s.content).toBe('');
			expect(s.error).toBeNull();
		});

		it('closeModal closes and resets', () => {
			const s = new QuickAdd();
			s.openModal();
			s.content = 'x';
			s.closeModal();
			expect(s.open).toBe(false);
			expect(s.content).toBe('');
		});
	});

	describe('detect', () => {
		it('ignores empty content', async () => {
			const s = new QuickAdd();
			await s.detect();
			expect(api.create).not.toHaveBeenCalled();
		});

		it('reports the error state and a notification on failure', async () => {
			api.create.mockResolvedValue(null);
			const s = new QuickAdd();
			s.content = 'https://example.com';
			await s.detect();
			expect(s.error).toBe('Failed to detect content type.');
			expect(notifications.error).toHaveBeenCalledWith('Failed to detect content type.');
		});

		it('stores the detection and waits for confirmation when needed', async () => {
			api.create.mockResolvedValue({
				data: {
					url: 'https://example.com',
					content_type: 'links',
					confidence: 0.9,
					needs_confirmation: true,
					metadata: { title: 'Example' }
				}
			});
			const s = new QuickAdd();
			s.content = 'https://example.com';
			await s.detect();
			expect(s.detectedType).toBe('links');
			expect(s.confidence).toBe(0.9);
			expect(s.metadata).toEqual({ title: 'Example' });
			expect(s.needsConfirmation).toBe(true);
			expect(s.loading).toBe(false);
			// no commit call while waiting for confirmation
			expect(api.create).toHaveBeenCalledTimes(1);
		});

		it('auto-commits when no confirmation is needed', async () => {
			api.create
				.mockResolvedValueOnce({
					data: {
						url: 'https://example.com',
						content_type: 'todo',
						confidence: 0.8,
						needs_confirmation: false,
						metadata: null
					}
				})
				.mockResolvedValueOnce({ data: null });

			const s = new QuickAdd();
			s.content = 'Buy milk';
			await s.detect();

			expect(api.create).toHaveBeenCalledTimes(2);
			expect(s.open).toBe(false);
			expect(notifications.success).toHaveBeenCalledWith('Added to your todos.');
		});
	});

	describe('confirm', () => {
		it('commits with the given type and shows the success notification', async () => {
			api.create.mockResolvedValue({ data: null });
			const s = new QuickAdd();
			s.content = 'https://example.com/song';
			s.metadata = { artist: 'X' };
			await s.confirm('music');
			expect(api.create).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					content: 'https://example.com/song',
					content_type: 'music',
					metadata: { artist: 'X' }
				})
			);
			expect(notifications.success).toHaveBeenCalledWith('Added to your music library.');
			expect(s.open).toBe(false);
		});

		it('shows the error state when the commit fails', async () => {
			api.create.mockResolvedValue(null);
			const s = new QuickAdd();
			await s.confirm('note');
			expect(s.error).toBe("Couldn't add this. Try again.");
			expect(notifications.error).toHaveBeenCalled();
		});
	});

	describe('detection flow helpers', () => {
		it('rejectDetection switches to the type selector', () => {
			const s = new QuickAdd();
			s.needsConfirmation = true;
			s.rejectDetection();
			expect(s.needsConfirmation).toBe(false);
			expect(s.showTypeSelector).toBe(true);
		});

		it('backToConfirmation restores the confirmation state', () => {
			const s = new QuickAdd();
			s.showTypeSelector = true;
			s.detectedType = 'links';
			s.backToConfirmation();
			expect(s.showTypeSelector).toBe(false);
			expect(s.needsConfirmation).toBe(true);
		});

		it('backToConfirmation is a no-op without a detected type', () => {
			const s = new QuickAdd();
			s.showTypeSelector = true;
			s.backToConfirmation();
			expect(s.showTypeSelector).toBe(true);
		});

		it('selectType clears metadata and commits', async () => {
			api.create.mockResolvedValue({ data: null });
			const s = new QuickAdd();
			s.metadata = { stale: true };
			await s.selectType('books');
			expect(s.metadata).toBeNull();
			expect(api.create).toHaveBeenCalledTimes(1);
		});
	});
});
