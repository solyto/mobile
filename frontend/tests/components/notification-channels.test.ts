import { describe, it, expect, vi, afterEach } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/svelte';
import ApiService from '$lib/services/ApiService';
import type { UiNotifications } from '$lib/state/UiNotifications.svelte';
import { setTelegramBot } from '$lib/state/TelegramBot.svelte';
import { setNotificationPreferences } from '$lib/state/NotificationPreferences.svelte';
import { setPushNotifications } from '$lib/state/PushNotifications.svelte';
import { WidgetBridge } from '$lib/state/WidgetBridge';
import type { Connection } from '$lib/types/telegram_bot_connection';
import TelegramBotConnection from '$lib/components/settings/TelegramBotConnection.svelte';
import ManageNotificationTypes from '$lib/components/settings/notifications/ManageNotificationTypes.svelte';
import ManagePushNotifications from '$lib/components/settings/notifications/ManagePushNotifications.svelte';
import { en } from '$lib/i18n/en';
import { renderWithContext } from './helpers/context';
import StoreHarness from './helpers/StoreHarness.svelte';

function connection(overrides: Partial<Connection> = {}): Connection {
	return {
		token: 'abc123',
		is_confirmed: false,
		your_day_alert: false,
		check_in_alert: false,
		chat_id: null,
		created_at: '2026-11-20T10:15:00Z',
		...overrides
	};
}

function respondToGet(responses: Record<string, unknown>) {
	return vi.spyOn(ApiService.prototype, 'get').mockImplementation(async (url: string) => {
		const match = Object.keys(responses).find((suffix) => url.endsWith(suffix));
		return (match ? responses[match] : null) as never;
	});
}

function renderNotificationTypes(showTelegram = true) {
	renderWithContext(StoreHarness, {
		component: ManageNotificationTypes,
		props: { showTelegram },
		provide: () => {
			setTelegramBot();
			setPushNotifications();
			return setNotificationPreferences();
		}
	});
}

describe('Telegram bot connection', () => {
	it('creates a connection and shows the command to send', async () => {
		const get = respondToGet({ '/telegram/token-request': { data: connection() } });
		renderWithContext(StoreHarness, { component: TelegramBotConnection, provide: setTelegramBot });

		await fireEvent.click(await screen.findByRole('button', { name: en.settings.telegram_bot_create }));

		expect(await screen.findByText('/connect abc123')).toBeInTheDocument();
		expect(get).toHaveBeenCalledWith(expect.stringMatching(/\/telegram\/request$/), null);
		expect(get).toHaveBeenCalledWith(expect.stringMatching(/\/telegram\/token-request$/), null);
	});

	it('names the chat once the connection is confirmed', async () => {
		respondToGet({ '/telegram/request': { data: connection({ is_confirmed: true, chat_id: '4711' }) } });
		renderWithContext(StoreHarness, { component: TelegramBotConnection, provide: setTelegramBot });

		expect(await screen.findByText(en.settings.telegram_bot_integration_success.replace('%s', '4711'))).toBeInTheDocument();
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});
});

describe('Notification types', () => {
	it('saves a toggled channel and shows the new value', async () => {
		respondToGet({ '/notifications/settings': { data: { friend_request_ui: true } } });
		const put = vi.spyOn(ApiService.prototype, 'put').mockResolvedValue(true);
		renderNotificationTypes();

		const row = await screen.findByRole('row', { name: new RegExp(en.notifications.type_friend_request) });
		const [ui] = within(row).getAllByRole('checkbox');
		expect(ui).toBeChecked();

		await fireEvent.click(ui);

		await waitFor(() => expect(put).toHaveBeenCalledWith(expect.stringMatching(/\/notifications\/settings$/), { friend_request_ui: false }));
		await waitFor(() => expect(ui).not.toBeChecked());
	});

	it('offers the telegram channel only once the bot is connected', async () => {
		respondToGet({ '/notifications/settings': { data: {} }, '/telegram/request': { data: connection() } });
		renderNotificationTypes();

		expect(await screen.findByText(en.settings.telegram_bot_not_connected)).toBeInTheDocument();
		const row = screen.getByRole('row', { name: new RegExp(en.notifications.type_friend_request) });
		expect(within(row).getAllByRole('checkbox')).toHaveLength(2);
	});

	it('offers the push channel once push is on for this phone', async () => {
		vi.spyOn(WidgetBridge.prototype, 'hasNativePush').mockReturnValue(true);
		vi.spyOn(WidgetBridge.prototype, 'pushStatus').mockResolvedValue({ enabled: true, permission: 'granted' });
		respondToGet({ '/notifications/settings': { data: {} }, '/telegram/request': { data: connection() } });
		renderNotificationTypes();

		const row = await screen.findByRole('row', { name: new RegExp(en.notifications.type_friend_request) });
		expect(within(row).getAllByRole('checkbox')).toHaveLength(3);
	});

	it('offers the telegram channel when the bot is connected', async () => {
		respondToGet({ '/notifications/settings': { data: {} }, '/telegram/request': { data: connection({ is_confirmed: true }) } });
		renderNotificationTypes();

		const row = await screen.findByRole('row', { name: new RegExp(en.notifications.type_friend_request) });
		expect(within(row).getAllByRole('checkbox')).toHaveLength(3);
		expect(screen.queryByText(en.settings.telegram_bot_not_connected)).not.toBeInTheDocument();
	});
});

describe('Push notifications', () => {
	const subscription = {
		endpoint: 'https://push.example/1',
		toJSON: () => ({ endpoint: 'https://push.example/1', keys: { auth: 'a' } }),
		unsubscribe: vi.fn()
	};
	const pushManager = { getSubscription: vi.fn(), subscribe: vi.fn() };

	function stubBrowser(permission: NotificationPermission, requested: NotificationPermission = permission) {
		vi.stubGlobal('Notification', { permission, requestPermission: vi.fn().mockResolvedValue(requested) });
		Object.defineProperty(navigator, 'serviceWorker', { value: { ready: Promise.resolve({ pushManager }) }, configurable: true });
	}

	function renderPush() {
		let notifications: UiNotifications | null = null;
		renderWithContext(
			StoreHarness,
			{ component: ManagePushNotifications, provide: setPushNotifications },
			{ onReady: (stores) => (notifications = stores.uiNotifications as UiNotifications) }
		);
		return () => notifications!.queue.map((n) => n.message);
	}

	afterEach(() => {
		vi.unstubAllGlobals();
		Reflect.deleteProperty(navigator, 'serviceWorker');
		pushManager.getSubscription.mockReset();
		pushManager.subscribe.mockReset();
		subscription.unsubscribe.mockReset();
	});

	it('subscribes with the server key and registers the subscription', async () => {
		stubBrowser('default', 'granted');
		pushManager.getSubscription.mockResolvedValue(null);
		pushManager.subscribe.mockResolvedValue(subscription);
		respondToGet({ '/notifications/push/vapid-key': { data: { public_key: 'AQID' } } });
		const create = vi.spyOn(ApiService.prototype, 'create').mockResolvedValue({ data: {} } as never);
		renderPush();

		const toggle = screen.getByRole('checkbox', { name: en.settings.enable_push_notifications });
		await waitFor(() => expect(ApiService.prototype.get).toHaveBeenCalled());
		await fireEvent.click(toggle);

		await waitFor(() => expect(create).toHaveBeenCalledWith(expect.stringMatching(/\/notifications\/push\/subscribe$/), subscription.toJSON()));
		expect(pushManager.subscribe.mock.calls[0][0].applicationServerKey).toEqual(new Uint8Array([1, 2, 3]));
		await waitFor(() => expect(toggle).toBeChecked());
	});

	it('says so when the server does not take the subscription', async () => {
		stubBrowser('granted');
		pushManager.getSubscription.mockResolvedValue(null);
		pushManager.subscribe.mockResolvedValue(subscription);
		respondToGet({ '/notifications/push/vapid-key': { data: { public_key: 'AQID' } } });
		vi.spyOn(ApiService.prototype, 'create').mockResolvedValue(null);
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const messages = renderPush();

		const toggle = screen.getByRole('checkbox', { name: en.settings.enable_push_notifications });
		await waitFor(() => expect(ApiService.prototype.get).toHaveBeenCalled());
		await fireEvent.click(toggle);

		await waitFor(() => expect(messages()).toEqual([en.settings.push_notification_error]));
		expect(toggle).not.toBeChecked();
	});

	it('says so when the permission is denied', async () => {
		stubBrowser('default', 'denied');
		respondToGet({ '/notifications/push/vapid-key': { data: { public_key: 'AQID' } } });
		const create = vi.spyOn(ApiService.prototype, 'create');
		const messages = renderPush();
		const toggle = screen.getByRole('checkbox', { name: en.settings.enable_push_notifications });

		await fireEvent.click(toggle);

		await waitFor(() => expect(messages()).toEqual([en.settings.notification_permission_denied]));
		expect(create).not.toHaveBeenCalled();
		expect(toggle).not.toBeChecked();
	});

	it('unsubscribes and tells the server which endpoint to drop', async () => {
		stubBrowser('granted');
		pushManager.getSubscription.mockResolvedValue(subscription);
		respondToGet({ '/notifications/push/vapid-key': { data: { public_key: 'AQID' } } });
		const create = vi.spyOn(ApiService.prototype, 'create').mockResolvedValue({ data: {} } as never);
		renderPush();

		const toggle = screen.getByRole('checkbox', { name: en.settings.enable_push_notifications });
		await waitFor(() => expect(toggle).toBeChecked());
		await fireEvent.click(toggle);

		await waitFor(() => expect(create).toHaveBeenCalledWith(expect.stringMatching(/\/notifications\/push\/unsubscribe$/), { endpoint: subscription.endpoint }));
		expect(subscription.unsubscribe).toHaveBeenCalled();
		expect(toggle).not.toBeChecked();
	});
});

describe('Push notifications on the phone', () => {
	function renderPhonePush(status: { enabled: boolean; permission: 'granted' | 'denied' | 'prompt' }) {
		vi.spyOn(WidgetBridge.prototype, 'hasNativePush').mockReturnValue(true);
		vi.spyOn(WidgetBridge.prototype, 'pushStatus').mockResolvedValue(status);
		let notifications: UiNotifications | null = null;
		renderWithContext(
			StoreHarness,
			{ component: ManagePushNotifications, provide: setPushNotifications },
			{ onReady: (stores) => (notifications = stores.uiNotifications as UiNotifications) }
		);
		return () => notifications!.queue.map((n) => n.message);
	}

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('shows whether push is on for this phone', async () => {
		renderPhonePush({ enabled: true, permission: 'granted' });

		await waitFor(() => expect(screen.getByRole('checkbox', { name: en.settings.enable_push_notifications })).toBeChecked());
	});

	it('turns push on through the phone instead of the browser', async () => {
		const enable = vi.spyOn(WidgetBridge.prototype, 'enablePush').mockResolvedValue({ enabled: true, permission: 'granted' });
		renderPhonePush({ enabled: false, permission: 'prompt' });

		const toggle = screen.getByRole('checkbox', { name: en.settings.enable_push_notifications });
		await waitFor(() => expect(WidgetBridge.prototype.pushStatus).toHaveBeenCalled());
		await fireEvent.click(toggle);

		expect(enable).toHaveBeenCalled();
		await waitFor(() => expect(toggle).toBeChecked());
	});

	it('says so when the phone denies the permission', async () => {
		vi.spyOn(WidgetBridge.prototype, 'enablePush').mockResolvedValue({ enabled: false, permission: 'denied' });
		const messages = renderPhonePush({ enabled: false, permission: 'prompt' });

		const toggle = screen.getByRole('checkbox', { name: en.settings.enable_push_notifications });
		await waitFor(() => expect(WidgetBridge.prototype.pushStatus).toHaveBeenCalled());
		await fireEvent.click(toggle);

		await waitFor(() => expect(messages()).toEqual([en.settings.notification_permission_denied]));
		expect(toggle).not.toBeChecked();
	});

	it('turns push off through the phone', async () => {
		const disable = vi.spyOn(WidgetBridge.prototype, 'disablePush').mockResolvedValue({ enabled: false, permission: 'granted' });
		renderPhonePush({ enabled: true, permission: 'granted' });

		const toggle = screen.getByRole('checkbox', { name: en.settings.enable_push_notifications });
		await waitFor(() => expect(toggle).toBeChecked());
		await fireEvent.click(toggle);

		expect(disable).toHaveBeenCalled();
		await waitFor(() => expect(toggle).not.toBeChecked());
	});
});
