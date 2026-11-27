import { describe, it, expect, vi } from 'vitest';
import { waitFor } from '@testing-library/svelte';
import ApiService from '$lib/services/ApiService';
import type { LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
import { renderWithContext } from './helpers/context';
import { rejectionsDuring } from './helpers/rejections';
import SettingsPageHarness from './helpers/SettingsPageHarness.svelte';

const stub = vi.hoisted(() => async () => ({ default: (await import('$lib/icons/lucide/plus.svelte')).default }));

vi.mock('$lib/components/settings/AppearanceSettings.svelte', stub);
vi.mock('$lib/components/settings/LocalizationSettings.svelte', stub);
vi.mock('$lib/components/settings/FeatureSettings.svelte', stub);
vi.mock('$lib/components/settings/notifications/NotificationSettings.svelte', stub);
vi.mock('$lib/components/settings/alerts/AlertSettings.svelte', stub);
vi.mock('$lib/components/settings/TagSettings.svelte', stub);
vi.mock('$lib/components/settings/PluginSettings.svelte', stub);
vi.mock('$lib/components/settings/SecuritySettings.svelte', stub);
vi.mock('$lib/components/settings/ExportSettings.svelte', stub);
vi.mock('$lib/components/settings/AppSettings.svelte', stub);

function sectionIds(container: HTMLElement): string[] {
	return [...container.querySelectorAll('section[id^="settings-section-"]')].map((section) => section.id.replace('settings-section-', ''));
}

describe('Settings page', () => {
	it('shows the alerts after the notifications while check-in is on', () => {
		vi.spyOn(ApiService.prototype, 'list').mockResolvedValue(null);
		const { container } = renderWithContext(SettingsPageHarness, { checkIn: true });

		expect(sectionIds(container)).toEqual(['6', '3', '4', '5', '11', '2', '10', '8', '9', '7']);
	});

	it('leaves the alerts out while check-in is off', () => {
		vi.spyOn(ApiService.prototype, 'list').mockResolvedValue(null);
		const { container } = renderWithContext(SettingsPageHarness, { checkIn: false });

		expect(sectionIds(container)).toEqual(['6', '3', '4', '5', '2', '10', '8', '9', '7']);
	});

	it('loads the trackers and alerts even while check-in is off, for switching it on here', async () => {
		const list = vi.spyOn(ApiService.prototype, 'list').mockResolvedValue(null);

		renderWithContext(SettingsPageHarness, { checkIn: false });

		await waitFor(() => expect(list).toHaveBeenCalledWith(expect.stringMatching(/\/alerts$/)));
		expect(list).toHaveBeenCalledWith(expect.stringMatching(/\/check-in\/trackers$/));
	});

	it('stops the loading indicator when loading fails', async () => {
		const offline = new Error('offline');
		vi.spyOn(ApiService.prototype, 'list').mockRejectedValue(offline);
		let loadingIndicator: LoadingIndicator | null = null;

		const rejections = await rejectionsDuring(async () => {
			renderWithContext(SettingsPageHarness, { checkIn: false }, {
				onReady: (stores) => (loadingIndicator = stores.loadingIndicator as LoadingIndicator)
			});
		});

		expect(rejections).toEqual([offline]);
		expect(loadingIndicator!.active).toBe(false);
	});
});
