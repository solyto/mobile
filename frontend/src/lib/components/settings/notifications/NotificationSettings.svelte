<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import SettingsSection from '$lib/components/settings/SettingsSection.svelte';
	import ManagePushNotifications from '$lib/components/settings/notifications/ManagePushNotifications.svelte';
	import ManageNotificationTypes from '$lib/components/settings/notifications/ManageNotificationTypes.svelte';
	import TelegramBotConnection from '$lib/components/settings/TelegramBotConnection.svelte';
	import { PLATFORM } from '$lib/config/platform';

	const ts = getTranslation();
</script>

<div class="flex flex-col gap-6">
	<div class="flex gap-6 max-lg:flex-col md:p-4">
		<SettingsSection label={ts.get.settings.telegram_bot}>
			<TelegramBotConnection />
		</SettingsSection>
		{#if PLATFORM === 'web'}
			<SettingsSection label={ts.get.settings.push_notifications}>
				<ManagePushNotifications />
			</SettingsSection>
		{/if}
	</div>

	<div class="md:p-4">
		<SettingsSection label={ts.get.settings.notifications}>
			<p class="mb-4 text-sm text-c-neutral-6 dark:text-c-neutral-4">
				Choose which notifications you want to receive and through which channels.
			</p>
			<ManageNotificationTypes />
		</SettingsSection>
	</div>
</div>
