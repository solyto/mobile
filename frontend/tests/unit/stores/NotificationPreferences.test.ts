import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationPreferences } from '$lib/state/NotificationPreferences.svelte';
import { api, resetStoreMocks } from '../setup/storeMocks';
import type { NotificationSettings } from '$lib/types/notification_settings';

const settings = { friend_request_ui: true, friend_request_email: false } as NotificationSettings;

beforeEach(() => {
	resetStoreMocks();
});

describe('NotificationPreferences store', () => {
	it('loads the settings', async () => {
		api.get.mockResolvedValue({ data: settings });
		const preferences = new NotificationPreferences();

		await preferences.load();

		expect(api.get).toHaveBeenCalledWith(expect.stringMatching(/\/notifications\/settings$/), null);
		expect(preferences.settings).toEqual(settings);
	});

	it('keeps the previous settings when loading fails', async () => {
		api.get.mockResolvedValue({ data: settings });
		const preferences = new NotificationPreferences();
		await preferences.load();

		api.get.mockResolvedValue(null);
		await preferences.load();

		expect(preferences.settings).toEqual(settings);
	});

	it('sends only the changed setting and applies it on success', async () => {
		api.get.mockResolvedValue({ data: settings });
		api.put.mockResolvedValue(true);
		const preferences = new NotificationPreferences();
		await preferences.load();

		expect(await preferences.update('friend_request_email', true)).toBe(true);

		expect(api.put).toHaveBeenCalledWith(expect.stringMatching(/\/notifications\/settings$/), { friend_request_email: true });
		expect(preferences.settings).toEqual({ ...settings, friend_request_email: true });
	});

	it('leaves the settings as they were when saving fails', async () => {
		api.get.mockResolvedValue({ data: settings });
		api.put.mockResolvedValue(false);
		const preferences = new NotificationPreferences();
		await preferences.load();

		expect(await preferences.update('friend_request_ui', false)).toBe(false);

		expect(preferences.settings).toEqual(settings);
	});

	it('saves nothing before the settings are loaded', async () => {
		const preferences = new NotificationPreferences();

		expect(await preferences.update('friend_request_ui', false)).toBe(false);

		expect(api.put).not.toHaveBeenCalled();
	});
});
