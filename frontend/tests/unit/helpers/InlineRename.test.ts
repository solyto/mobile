import { describe, it, expect, vi } from 'vitest';
import { InlineRename } from '$lib/helpers/InlineRename.svelte';
import type { KeyManager } from '$lib/state/KeyManager.svelte';
import type { LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';

function setUp(currentTitle = 'Home', save = vi.fn().mockResolvedValue(true)) {
	const handlers: Record<string, () => unknown> = {};
	const keyManager = {
		registerKeyDown: vi.fn((key: string, handler: () => unknown) => {
			handlers[key] = handler;
			return key;
		}),
		unregisterAll: vi.fn()
	} as unknown as KeyManager;
	const loadingIndicator = { start: vi.fn(), stop: vi.fn() } as unknown as LoadingIndicator;
	const rename = new InlineRename(() => currentTitle, save, keyManager, loadingIndicator);
	return { rename, save, keyManager, loadingIndicator, handlers };
}

describe('InlineRename', () => {
	it('starts with the current title and listens for Enter and Escape', async () => {
		const { rename, keyManager } = setUp();
		await rename.start();

		expect(rename.editing).toBe(true);
		expect(rename.title).toBe('Home');
		expect(keyManager.registerKeyDown).toHaveBeenCalledWith('Enter', rename.finish, { priority: 2 });
		expect(keyManager.registerKeyDown).toHaveBeenCalledWith('Escape', rename.cancel, { priority: 2 });
	});

	it('saves a trimmed, changed title with the loading indicator', async () => {
		const { rename, save, loadingIndicator, handlers } = setUp();
		await rename.start();
		rename.title = ' Work ';

		await handlers.Enter();

		expect(save).toHaveBeenCalledWith('Work');
		expect(loadingIndicator.start).toHaveBeenCalled();
		expect(loadingIndicator.stop).toHaveBeenCalled();
		expect(rename.editing).toBe(false);
	});

	it('stops the loading indicator when saving throws', async () => {
		const { rename, loadingIndicator } = setUp('Home', vi.fn().mockRejectedValue(new Error('offline')));
		await rename.start();
		rename.title = 'Work';

		await expect(rename.finish()).rejects.toThrow('offline');
		expect(loadingIndicator.stop).toHaveBeenCalled();
	});

	it.each(['Home', '  ', ''])('does not save %j', async (title) => {
		const { rename, save, loadingIndicator } = setUp();
		await rename.start();
		rename.title = title;

		await rename.finish();

		expect(save).not.toHaveBeenCalled();
		expect(loadingIndicator.start).not.toHaveBeenCalled();
	});

	it('saves only once when blur follows Enter', async () => {
		const { rename, save } = setUp();
		await rename.start();
		rename.title = 'Work';

		await rename.finish();
		await rename.finish();

		expect(save).toHaveBeenCalledTimes(1);
	});

	it('cancels back to the current title', async () => {
		const { rename, save, keyManager } = setUp();
		await rename.start();
		rename.title = 'Work';

		rename.cancel();

		expect(rename.editing).toBe(false);
		expect(rename.title).toBe('Home');
		expect(save).not.toHaveBeenCalled();
		expect(keyManager.unregisterAll).toHaveBeenCalled();
	});
});
