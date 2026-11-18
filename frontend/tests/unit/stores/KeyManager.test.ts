import { describe, it, expect, vi } from 'vitest';
import { KeyManager } from '$lib/state/KeyManager.svelte';

function keydown(key: string): KeyboardEvent {
	return { key, preventDefault: vi.fn() } as unknown as KeyboardEvent;
}

describe('KeyManager', () => {
	it('runs a registered Enter handler and prevents the default', () => {
		const keyManager = new KeyManager();
		const handler = vi.fn();
		keyManager.registerKeyDown('Enter', handler);

		const event = keydown('Enter');
		keyManager.handleKeyDown(event);

		expect(handler).toHaveBeenCalledWith(event);
		expect(event.preventDefault).toHaveBeenCalled();
	});

	it.each(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'] as const)('runs a registered %s handler', (key) => {
		const keyManager = new KeyManager();
		const handler = vi.fn();
		keyManager.registerKeyDown(key, handler);

		const event = keydown(key);
		keyManager.handleKeyDown(event);

		expect(handler).toHaveBeenCalledWith(event);
		expect(event.preventDefault).toHaveBeenCalled();
	});

	it.each(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'] as const)(
		'respects preventDefault: false for %s',
		(key) => {
			const keyManager = new KeyManager();
			const handler = vi.fn();
			keyManager.registerKeyDown(key, handler, { preventDefault: false });

			const event = keydown(key);
			keyManager.handleKeyDown(event);

			expect(handler).toHaveBeenCalledWith(event);
			expect(event.preventDefault).not.toHaveBeenCalled();
		}
	);

	it.each(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'] as const)('no longer runs %s after unregister', (key) => {
		const keyManager = new KeyManager();
		const handler = vi.fn();
		const id = keyManager.registerKeyDown(key, handler);

		keyManager.unregisterKeyDown(id);
		keyManager.handleKeyDown(keydown(key));

		expect(handler).not.toHaveBeenCalled();
	});

	it('runs a Control+K handler only while Control is held', () => {
		const keyManager = new KeyManager();
		const handler = vi.fn();
		keyManager.registerKeyDown('k', handler, { withHelperKey: 'Control' });

		keyManager.handleKeyDown(keydown('k'));
		expect(handler).not.toHaveBeenCalled();

		keyManager.handleKeyDown(keydown('Control'));
		const event = keydown('k');
		keyManager.handleKeyDown(event);

		expect(handler).toHaveBeenCalledWith(event);
		expect(event.preventDefault).toHaveBeenCalled();
	});
});
