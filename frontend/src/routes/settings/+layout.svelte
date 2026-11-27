<script lang="ts">
	import { onMount } from 'svelte';
	import { setTags } from '$lib/state/Tags.svelte';
	import { setPlugins } from '$lib/state/Plugins.svelte';
	import { setTelegramBot } from '$lib/state/TelegramBot.svelte';
	import { setNotificationPreferences } from '$lib/state/NotificationPreferences.svelte';
	import { setPushNotifications } from '$lib/state/PushNotifications.svelte';
	import { setDataExport } from '$lib/state/DataExport.svelte';
	import { getIntegrations } from '$lib/state/Integrations.svelte';

	setTags();
	setPlugins();
	setTelegramBot();
	setNotificationPreferences();
	setPushNotifications();
	setDataExport();

	const integrations = getIntegrations();

	onMount(() => {
		integrations.load();
	});

	let { children } = $props();
</script>

{@render children?.()}
