<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getTelegramBot } from '$lib/state/TelegramBot.svelte';
	import { getNotificationPreferences } from '$lib/state/NotificationPreferences.svelte';
	import { getPushNotifications } from '$lib/state/PushNotifications.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import type {
		NotificationSettings,
		NotificationType,
		NotificationChannel
	} from '$lib/types/notification_settings';

	let { showTelegram }: { showTelegram: boolean } = $props();

	const telegramBot = getTelegramBot();
	const preferences = getNotificationPreferences();
	const pushNotifications = getPushNotifications();
	const ts = getTranslation();

	let pushEnabled = $state<boolean>(false);
	let loaded = $state<boolean>(false);
	let updating = $state<boolean>(false);

	const notificationTypes: NotificationType[] = [
		'book_release',
		'music_release',
		'movie_release',
		'friend_request',
		'daily_check_in_reminder',
		'alert',
		'daily_day_reminder',
		'calendar_share',
		'dev_request_comment',
		'export_ready'
	];

	const channels: NotificationChannel[] = ['ui', 'email', 'push', 'telegram'];

	onMount(async () => {
		await Promise.all([preferences.load(), telegramBot.load(), checkPushStatus()]);
		loaded = true;
	});

	async function checkPushStatus() {
		try {
			pushEnabled = await hasPushSubscription();
		} catch {
			pushEnabled = false;
		}
	}

	async function hasPushSubscription(): Promise<boolean> {
		if (pushNotifications.isNative()) return (await pushNotifications.nativeStatus()).enabled;
		if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
		if (Notification.permission !== 'granted') return false;

		const reg = await navigator.serviceWorker.getRegistration();
		if (!reg) return false;

		return (await reg.pushManager.getSubscription()) !== null;
	}

	function visibleChannels(): NotificationChannel[] {
		return showTelegram ? channels : channels.filter((channel) => channel !== 'telegram');
	}

	function getSettingKey(type: NotificationType, channel: NotificationChannel): keyof NotificationSettings {
		return `${type}_${channel}` as keyof NotificationSettings;
	}

	function isChecked(type: NotificationType, channel: NotificationChannel): boolean {
		if (!preferences.settings) return false;
		const key = getSettingKey(type, channel);
		return preferences.settings[key] ?? false;
	}

	function isChannelAvailable(channel: NotificationChannel): boolean {
		if (channel === 'telegram') {
			return telegramBot.isConnected;
		}
		if (channel === 'push') {
			return pushEnabled;
		}
		return true;
	}

	async function toggleSetting(type: NotificationType, channel: NotificationChannel) {
		if (!preferences.settings || updating) return;

		const key = getSettingKey(type, channel);

		updating = true;
		await preferences.update(key, !preferences.settings[key]);
		updating = false;
	}

	function typeLabel(type: NotificationType): string {
		return ts.get.notifications[`type_${type}`];
	}

	function channelLabel(channel: NotificationChannel): string {
		return ts.get.notifications[`channel_${channel}`];
	}

	function getChannelTooltip(channel: NotificationChannel): string {
		if (channel === 'telegram' && !isChannelAvailable('telegram')) {
			return ts.get.notifications.channel_telegram_unavailable;
		}
		if (channel === 'push' && !isChannelAvailable('push')) {
			return ts.get.notifications.channel_push_unavailable;
		}
		if (channel === 'email') {
			return ts.get.notifications.channel_email_coming_soon;
		}
		return '';
	}
</script>

{#if loaded}
	<div in:fade class="w-full overflow-x-auto">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-c-neutral-2 dark:border-s-dark-2">
					<th class="px-1 py-2 text-left font-semibold"></th>
					{#each visibleChannels() as channel (channel)}
						<th class="min-w-[60px] px-2 py-2 text-center font-semibold">
							<span
								class:opacity-40={!isChannelAvailable(channel)}
								title={getChannelTooltip(channel)}
							>
								{channelLabel(channel)}
							</span>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each notificationTypes as type (type)}
					<tr class="border-b border-c-neutral-1 last:border-0 dark:border-s-dark-3">
						<td class="px-1 py-3 text-left">{typeLabel(type)}</td>
						{#each visibleChannels() as channel (channel)}
							<td class="px-2 py-3 text-center">
								{#if isChannelAvailable(channel)}
									<Checkbox
										isChecked={isChecked(type, channel)}
										onchange={() => toggleSetting(type, channel)}
									/>
								{:else}
									<div
										class="inline-flex cursor-not-allowed items-center opacity-30"
										title={getChannelTooltip(channel)}
									>
										<div
											class="dark:bg-s-dark-4 h-5 w-5 rounded border border-c-neutral-3 bg-c-neutral-1 dark:border-s-dark-2"
										></div>
									</div>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>

		{#if showTelegram && !isChannelAvailable('telegram')}
			<p class="mt-4 text-xs text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.settings.telegram_bot_not_connected}
			</p>
		{/if}

		{#if !isChannelAvailable('push')}
			<p class="mt-4 text-xs text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.settings.push_notifications_hint}
			</p>
		{/if}
	</div>
{:else}
	<div class="flex h-40 items-center justify-center">
		<div class="animate-pulse text-c-neutral-4">{ts.get.layout.loading}</div>
	</div>
{/if}
