<script lang="ts">
	import { scale } from 'svelte/transition';
	import IconBell from '@lucide/svelte/icons/bell';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { getUserNotifications } from '$lib/state/UserNotifications.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import Entry from '$lib/components/ui/user-notifications/Entry.svelte';

	const ts = getTranslation();
	const userNotifications = getUserNotifications();

	onMount(async () => {
		await userNotifications.load();
	});

	onDestroy(() => {
		userNotifications.destroy();
	});


	let open = $state<boolean>(false);
	let unreadNotificationCount = $derived(userNotifications.getUnread().length);
	let x = $state<number>(0);
	let y = $state<number>(0);

	async function toggleOpen(e: MouseEvent): Promise<void> {
		if (userNotifications.notifications.length === 0) return;

		x = e.clientX + 45;
		y = window.innerHeight - e.clientY;
		open = !open;

		if (open) {
			await userNotifications.markAllRead();
		}
	}

	const onClose = () => (open = false);
</script>

<div class="relative w-full">
	<button
		class="relative flex h-14 w-full cursor-pointer items-center justify-center rounded-sm transition-all hover:bg-c-nav-hover"
		title={ts.get.nav.notifications}
		onclick={(e) => toggleOpen(e)}
	>
		{#if unreadNotificationCount > 0}
			<Badge
				i={unreadNotificationCount}
				color="var(--color-c-btn-hover)"
				top="-2px"
				right="-2px"
			/>
		{/if}
		<IconBell />
	</button>
	{#if open}
		<div
			class="fixed z-50 flex min-w-60 flex-col gap-2 rounded-lg bg-c-bg-elevated py-4 shadow-sm"
			style="bottom: {y}px; left: {x}px;"
			transition:scale
			use:clickOutside={() => (open = false)}
		>
			{#each userNotifications.notifications as notification (notification.id)}
				<Entry {notification} {onClose} />
			{/each}
		</div>
	{/if}
</div>
