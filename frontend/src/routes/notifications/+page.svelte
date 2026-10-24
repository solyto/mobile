<script lang="ts">
	import { onMount } from 'svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getUserNotifications } from '$lib/state/UserNotifications.svelte';
	import Entry from '$lib/components/ui/user-notifications/Entry.svelte';
	import SubHeading from '$lib/components/ui/SubHeading.svelte';

	const ts = getTranslation();
	const userNotifications = getUserNotifications();

	onMount(async () => {
		if (!userNotifications.loaded) {
			await userNotifications.load();
		}
		await userNotifications.markAllRead();
	});
</script>

<div class="flex h-full w-full flex-col px-4 py-2">
	<SubHeading title={ts.get.nav.notifications} my={2} mb={2} />
	{#if userNotifications.notifications.length > 0}
		<div class="flex w-full flex-col gap-3">
			{#each userNotifications.notifications as notification (notification.id)}
				<Entry {notification} variant="card" onClose={() => {}} />
			{/each}
		</div>
	{:else if userNotifications.loaded}
		<p class="text-sm text-c-neutral-4 dark:text-c-neutral-5">
			{ts.get.nav.notifications_empty}
		</p>
	{/if}
</div>
