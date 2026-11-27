import { describe, it, expect, beforeEach } from 'vitest';
import { PushNotifications } from '$lib/state/PushNotifications.svelte';
import { api, resetStoreMocks } from '../setup/storeMocks';

beforeEach(() => {
	resetStoreMocks();
});

describe('PushNotifications store', () => {
	it('loads the server key', async () => {
		api.get.mockResolvedValue({ data: { public_key: 'AQID' } });
		const push = new PushNotifications();

		await push.loadVapidKey();

		expect(api.get).toHaveBeenCalledWith(expect.stringMatching(/\/notifications\/push\/vapid-key$/), null);
		expect(push.vapidPublicKey).toBe('AQID');
	});

	it('has no server key when loading fails', async () => {
		const push = new PushNotifications();

		await push.loadVapidKey();

		expect(push.vapidPublicKey).toBe('');
	});

	it('registers a subscription and says whether the server took it', async () => {
		const subscription = { endpoint: 'https://push.example/1', keys: { auth: 'a' } };
		api.create.mockResolvedValue({ data: {} });
		const push = new PushNotifications();

		expect(await push.subscribe(subscription)).toBe(true);
		expect(api.create).toHaveBeenCalledWith(expect.stringMatching(/\/notifications\/push\/subscribe$/), subscription);

		api.create.mockResolvedValue(null);
		expect(await push.subscribe(subscription)).toBe(false);
	});

	it('tells the server which endpoint to drop', async () => {
		const push = new PushNotifications();

		await push.unsubscribe('https://push.example/1');

		expect(api.create).toHaveBeenCalledWith(expect.stringMatching(/\/notifications\/push\/unsubscribe$/), { endpoint: 'https://push.example/1' });
	});
});
