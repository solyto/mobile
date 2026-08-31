import { describe, it, expect, vi, afterEach } from 'vitest';
import { LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
import { CookieConsent } from '$lib/state/CookieConsent.svelte';
import { UiNotifications } from '$lib/state/UiNotifications.svelte';

describe('LoadingIndicator', () => {
	it('starts and stops', () => {
		const indicator = new LoadingIndicator();
		expect(indicator.active).toBe(false);
		indicator.start();
		expect(indicator.active).toBe(true);
		indicator.stop();
		expect(indicator.active).toBe(false);
	});

	it('tracks progress', () => {
		const indicator = new LoadingIndicator();
		indicator.setProgress(42);
		expect(indicator.progress).toBe(42);
	});
});

describe('CookieConsent', () => {
	it('defaults to acknowledged when nothing is stored', () => {
		const consent = new CookieConsent();
		expect(consent.acknowledged).toBe(true);
	});

	it('acknowledges', () => {
		const consent = new CookieConsent();
		consent.acknowledge();
		expect(consent.acknowledged).toBe(true);
	});
});

describe('UiNotifications', () => {
	afterEach(() => vi.useRealTimers());

	it('adds a notification with a generated id and removes it after the timeout', () => {
		vi.useFakeTimers();
		const notifications = new UiNotifications();
		notifications.success('Hello');

		expect(notifications.queue).toHaveLength(1);
		expect(notifications.queue[0].type).toBe('success');
		expect(notifications.queue[0].message).toBe('Hello');
		expect(notifications.queue[0].id).toBeTypeOf('string');

		vi.runAllTimers();
		expect(notifications.queue).toHaveLength(0);
	});

	it('respects a custom timeout', () => {
		vi.useFakeTimers();
		const notifications = new UiNotifications();
		notifications.add({ type: 'error', message: 'Boom', timeout: 100 });

		vi.advanceTimersByTime(50);
		expect(notifications.queue).toHaveLength(1);

		vi.advanceTimersByTime(50);
		expect(notifications.queue).toHaveLength(0);
	});

	it('exposes typed shortcuts', () => {
		const notifications = new UiNotifications();
		notifications.success('s');
		notifications.error('e');
		notifications.info('i');
		notifications.warning('w');
		expect(notifications.queue.map((n) => n.type)).toEqual([
			'success',
			'error',
			'info',
			'warning'
		]);
	});

	it('removes a specific notification', () => {
		const notifications = new UiNotifications();
		notifications.success('keep me');
		const [first] = notifications.queue;
		notifications.remove(first.id);
		expect(notifications.queue).toHaveLength(0);
	});

	it('clears the queue', () => {
		const notifications = new UiNotifications();
		notifications.success('a');
		notifications.error('b');
		notifications.clear();
		expect(notifications.queue).toHaveLength(0);
	});
});
