import { describe, it, expect, vi } from 'vitest';
import {
	createNetworkErrorHandler,
	exportRateLimitedMessage,
	rateLimitedMessage
} from '$lib/helpers/NetworkErrorHelper';
import { NetworkError, RateLimitedError } from '$lib/services/ApiService';
import { en } from '$lib/i18n/en';

function rejection(reason: unknown) {
	return { reason, preventDefault: vi.fn() } as unknown as PromiseRejectionEvent;
}

describe('createNetworkErrorHandler', () => {
	it('stops loading and notifies on a network error', () => {
		const stop = vi.fn();
		const notify = vi.fn();
		const event = rejection(new NetworkError(new TypeError('Failed to fetch')));

		createNetworkErrorHandler(stop, notify, vi.fn())(event);

		expect(stop).toHaveBeenCalledOnce();
		expect(notify).toHaveBeenCalledOnce();
		expect(event.preventDefault).toHaveBeenCalled();
	});

	it('ignores every other rejection', () => {
		const stop = vi.fn();
		const notify = vi.fn();
		const event = rejection(new TypeError("Cannot read properties of undefined"));

		createNetworkErrorHandler(stop, notify, vi.fn())(event);

		expect(stop).not.toHaveBeenCalled();
		expect(notify).not.toHaveBeenCalled();
		expect(event.preventDefault).not.toHaveBeenCalled();
	});

	it('notifies once per burst but always stops loading', () => {
		let time = 1000;
		const stop = vi.fn();
		const notify = vi.fn();
		const handle = createNetworkErrorHandler(stop, notify, vi.fn(), () => time);

		handle(rejection(new NetworkError(new Error('offline'))));
		time += 1000;
		handle(rejection(new NetworkError(new Error('offline'))));
		time += 5000;
		handle(rejection(new NetworkError(new Error('offline'))));

		expect(stop).toHaveBeenCalledTimes(3);
		expect(notify).toHaveBeenCalledTimes(2);
	});

	it('stops loading and passes a rate limit to its own callback', () => {
		const stop = vi.fn();
		const notifyNetwork = vi.fn();
		const notifyRateLimited = vi.fn();
		const error = new RateLimitedError(60, 'too_many_requests');
		const event = rejection(error);

		createNetworkErrorHandler(stop, notifyNetwork, notifyRateLimited)(event);

		expect(stop).toHaveBeenCalledOnce();
		expect(notifyRateLimited).toHaveBeenCalledWith(error);
		expect(notifyNetwork).not.toHaveBeenCalled();
		expect(event.preventDefault).toHaveBeenCalled();
	});

	it('shares one throttle between network errors and rate limits', () => {
		let time = 1000;
		const notifyNetwork = vi.fn();
		const notifyRateLimited = vi.fn();
		const handle = createNetworkErrorHandler(vi.fn(), notifyNetwork, notifyRateLimited, () => time);

		handle(rejection(new RateLimitedError(null, null)));
		time += 1000;
		handle(rejection(new NetworkError(new Error('offline'))));
		handle(rejection(new RateLimitedError(null, null)));

		expect(notifyRateLimited).toHaveBeenCalledOnce();
		expect(notifyNetwork).not.toHaveBeenCalled();
	});
});

describe('rateLimitedMessage', () => {
	it('says "in a moment" without a wait time', () => {
		expect(rateLimitedMessage(null, en.layout)).toBe(en.layout.rate_limited);
	});

	it('rounds the wait up to whole minutes', () => {
		expect(rateLimitedMessage(61, en.layout)).toBe('Too many attempts. Please try again in 2 minutes.');
	});

	it('uses the singular for one minute or less', () => {
		expect(rateLimitedMessage(60, en.layout)).toBe(en.layout.rate_limited_minutes_singular);
		expect(rateLimitedMessage(5, en.layout)).toBe(en.layout.rate_limited_minutes_singular);
	});
});

describe('exportRateLimitedMessage', () => {
	it('keeps the plain message without a wait time', () => {
		expect(exportRateLimitedMessage(null, en.settings)).toBe(en.settings.export_rate_limited);
	});

	it('rounds the wait up to whole hours', () => {
		expect(exportRateLimitedMessage(3601, en.settings)).toBe(
			'You can only export once every 24 hours. Try again in 2 hours.'
		);
		expect(exportRateLimitedMessage(600, en.settings)).toBe(en.settings.export_rate_limited_hours_singular);
	});
});
