<script lang="ts">
	import type { UserNotification } from '$lib/types/user_notification';
	import { getUserNotifications } from '$lib/state/UserNotifications.svelte';

	const userNotifications = getUserNotifications();

	let { notification, onClose } = $props<{
		notification: UserNotification;
		onClose: () => void;
	}>();

	function goTo(): void {
		onClose();
	}
</script>

<a
	class="relative flex w-full cursor-pointer flex-col gap-1 px-4 py-2 hover:bg-c-neutral dark:hover:bg-s-dark-2"
	href={notification.link ?? '#'}
	onclick={goTo}
>
	<div class="flex items-center gap-2">
		{#if !notification.read_at}
			<div class="size-2 rounded-full bg-c-btn-hover shadow-sm"></div>
		{/if}
		<span class="text-sm font-bold">{notification.title}</span>
	</div>
	<p class="text-sm">
		{notification.body}
	</p>
</a>
