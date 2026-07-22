<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getAuth } from '$lib/state/Auth.svelte';
	import ApiService from '$lib/services/ApiService';
	import { onMount } from 'svelte';
	import { apiRoutes } from '$lib/config/apiRoutes';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import type {
		NotificationSettings,
		NotificationType,
		NotificationChannel
	} from '$lib/types/notification_settings';
	import type { Connection } from '$lib/types/telegram_bot_connection';

	const auth = getAuth();
	const apiService = new ApiService(auth.getToken());
	const ts = getTranslation();

	let settings = $state<NotificationSettings | null>(null);
	let telegramConnection = $state<Connection | null>(null);
	let pushEnabled = $state<boolean>(false);
	let loaded = $state<boolean>(false);
	let updating = $state<boolean>(false);

	const notificationTypes: { key: NotificationType; label: string }[] = [
		{ key: 'book_release', label: 'New Book Releases' },
		{ key: 'music_release', label: 'New Music Releases' },
		{ key: 'movie_release', label: 'New Screen Release' },
		{ key: 'friend_request', label: 'New Friend Request' },
		{ key: 'daily_check_in_reminder', label: 'Reminder for daily check-in' },
		{ key: 'daily_day_reminder', label: 'Reminder for the upcoming day' },
		{ key: 'calendar_share', label: 'Calendar Shares' },
		{ key: 'dev_request_comment', label: 'Dev Request Comments' },
		{ key: 'export_ready', label: 'Export Ready' }
	];

	const channels: { key: NotificationChannel; label: string }[] = [
		{ key: 'ui', label: 'UI' },
		{ key: 'email', label: 'Email' },
		{ key: 'push', label: 'Push' },
		{ key: 'telegram', label: 'Bot' }
	];

	onMount(async () => {
		await Promise.all([loadSettings(), loadTelegramConnection(), checkPushStatus()]);
		loaded = true;
	});

	async function loadSettings() {
		const res = await apiService.get(apiRoutes.notifications.settings.get, null);
		if (res?.data) {
			settings = res.data as NotificationSettings;
		}
	}

	async function loadTelegramConnection() {
		const res = await apiService.get(apiRoutes.telegram.getRequest, null);
		if (res) {
			telegramConnection = res.data as Connection;
		}
	}

	async function checkPushStatus() {
		try {
			if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
				pushEnabled = false;
				return;
			}
			if (Notification.permission !== 'granted') {
				pushEnabled = false;
				return;
			}
			const reg = await navigator.serviceWorker.getRegistration();
			if (!reg) {
				pushEnabled = false;
				return;
			}
			const sub = await reg.pushManager.getSubscription();
			pushEnabled = sub !== null;
		} catch {
			pushEnabled = false;
		}
	}

	function getSettingKey(
		type: NotificationType,
		channel: NotificationChannel
	): keyof NotificationSettings {
		return `${type}_${channel}` as keyof NotificationSettings;
	}

	function isChecked(type: NotificationType, channel: NotificationChannel): boolean {
		if (!settings) return false;
		const key = getSettingKey(type, channel);
		return settings[key] ?? false;
	}

	function isChannelAvailable(channel: NotificationChannel): boolean {
		if (channel === 'telegram') {
			return telegramConnection?.is_confirmed ?? false;
		}
		if (channel === 'push') {
			return pushEnabled;
		}
		return true;
	}

	async function toggleSetting(type: NotificationType, channel: NotificationChannel) {
		if (!settings || updating) return;

		const key = getSettingKey(type, channel);
		const newValue = !settings[key];

		updating = true;
		const res = await apiService.put(apiRoutes.notifications.settings.update, {
			[key]: newValue
		});

		if (res) {
			settings = { ...settings, [key]: newValue };
		}
		updating = false;
	}

	function getChannelTooltip(channel: NotificationChannel): string {
		if (channel === 'telegram' && !isChannelAvailable('telegram')) {
			return 'Set up Telegram Bot in Integrations first';
		}
		if (channel === 'push' && !isChannelAvailable('push')) {
			return 'Enable Push Notifications above first';
		}
		if (channel === 'email') {
			return 'Email notifications coming soon';
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
					{#each channels as channel}
						<th class="min-w-[60px] px-2 py-2 text-center font-semibold">
							<span
								class:opacity-40={!isChannelAvailable(channel.key)}
								title={getChannelTooltip(channel.key)}
							>
								{channel.label}
							</span>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each notificationTypes as type}
					<tr class="border-b border-c-neutral-1 last:border-0 dark:border-s-dark-3">
						<td class="px-1 py-3 text-left">{type.label}</td>
						{#each channels as channel}
							<td class="px-2 py-3 text-center">
								{#if isChannelAvailable(channel.key)}
									<Checkbox
										isChecked={isChecked(type.key, channel.key)}
										onchange={() => toggleSetting(type.key, channel.key)}
									/>
								{:else}
									<div
										class="inline-flex cursor-not-allowed items-center opacity-30"
										title={getChannelTooltip(channel.key)}
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

		{#if !isChannelAvailable('telegram')}
			<p class="mt-4 text-xs text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.settings.telegram_bot_not_connected}
			</p>
		{/if}

		{#if !isChannelAvailable('push')}
			<p class="mt-4 text-xs text-c-neutral-5 dark:text-c-neutral-4">
				Enable Push Notifications above to receive push notifications.
			</p>
		{/if}
	</div>
{:else}
	<div class="flex h-40 items-center justify-center">
		<div class="animate-pulse text-c-neutral-4">Loading...</div>
	</div>
{/if}
