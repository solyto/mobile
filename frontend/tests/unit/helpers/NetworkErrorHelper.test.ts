import { describe, it, expect, vi } from 'vitest';
import { createNetworkErrorHandler } from '$lib/helpers/NetworkErrorHelper';
import { NetworkError } from '$lib/services/ApiService';

function rejection(reason: unknown) {
	return { reason, preventDefault: vi.fn() } as unknown as PromiseRejectionEvent;
}

describe('createNetworkErrorHandler', () => {
	it('stops loading and notifies on a network error', () => {
		const stop = vi.fn();
		const notify = vi.fn();
		const event = rejection(new NetworkError(new TypeError('Failed to fetch')));

		createNetworkErrorHandler(stop, notify)(event);

		expect(stop).toHaveBeenCalledOnce();
		expect(notify).toHaveBeenCalledOnce();
		expect(event.preventDefault).toHaveBeenCalled();
	});

	it('ignores every other rejection', () => {
		const stop = vi.fn();
		const notify = vi.fn();
		const event = rejection(new TypeError("Cannot read properties of undefined"));

		createNetworkErrorHandler(stop, notify)(event);

		expect(stop).not.toHaveBeenCalled();
		expect(notify).not.toHaveBeenCalled();
		expect(event.preventDefault).not.toHaveBeenCalled();
	});

	it('notifies once per burst but always stops loading', () => {
		let time = 1000;
		const stop = vi.fn();
		const notify = vi.fn();
		const handle = createNetworkErrorHandler(stop, notify, () => time);

		handle(rejection(new NetworkError(new Error('offline'))));
		time += 1000;
		handle(rejection(new NetworkError(new Error('offline'))));
		time += 5000;
		handle(rejection(new NetworkError(new Error('offline'))));

		expect(stop).toHaveBeenCalledTimes(3);
		expect(notify).toHaveBeenCalledTimes(2);
	});
});
