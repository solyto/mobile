import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen } from '@testing-library/svelte';
import ApiService from '$lib/services/ApiService';
import { setIntegrations } from '$lib/state/Integrations.svelte';
import { setTelegramBot } from '$lib/state/TelegramBot.svelte';
import { setNotificationPreferences } from '$lib/state/NotificationPreferences.svelte';
import { setPushNotifications } from '$lib/state/PushNotifications.svelte';
import { WidgetBridge } from '$lib/state/WidgetBridge';
import NotificationSettings from '$lib/components/settings/notifications/NotificationSettings.svelte';
import { en } from '$lib/i18n/en';
import { renderWithContext } from './helpers/context';
import StoreHarness from './helpers/StoreHarness.svelte';

vi.mock('$lib/config/platform', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/config/platform')>()),
	PLATFORM: 'mobile',
	IS_WEB: false,
	IS_MOBILE: true
}));

function renderSettings(hasNativePush: boolean) {
	vi.spyOn(ApiService.prototype, 'get').mockResolvedValue(null as never);
	vi.spyOn(WidgetBridge.prototype, 'hasNativePush').mockReturnValue(hasNativePush);
	vi.spyOn(WidgetBridge.prototype, 'pushStatus').mockResolvedValue({ enabled: false, permission: 'prompt' });
	renderWithContext(StoreHarness, {
		component: NotificationSettings,
		provide: () => {
			setIntegrations();
			setTelegramBot();
			setPushNotifications();
			return setNotificationPreferences();
		}
	});
}

describe('Notification settings in the Android app', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('offers the push switch for this phone', () => {
		renderSettings(true);

		expect(screen.getByRole('checkbox', { name: en.settings.enable_push_notifications })).toBeInTheDocument();
	});

	it('hides the push switch when the app has no push bridge', () => {
		renderSettings(false);

		expect(screen.queryByRole('checkbox', { name: en.settings.enable_push_notifications })).not.toBeInTheDocument();
	});
});
