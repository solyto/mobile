<script lang="ts">
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { useSwipe } from 'svelte-gestures';
	import IconTriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import IconCheck from '@lucide/svelte/icons/check';
	import IconInfo from '@lucide/svelte/icons/info';
	import IconOctagonX from '@lucide/svelte/icons/octagon-x';

	const notifications = getUiNotifications();

	let queue = $derived(notifications.queue);
</script>

<div class="fixed top-5 right-5 z-90 flex flex-col gap-2">
	{#each queue as notification (notification.id)}
		<div
			class="flex h-full w-full flex-row gap-2 bg-c-neutral/60 border-l-3 rounded-md p-4 drop-shadow-lg backdrop-blur-sm 2xl:min-w-60 dark:bg-s-dark/80"
			class:border-c-success={notification.type === 'success'}
			class:border-c-danger={notification.type === 'error'}
			class:border-c-btn-hover={notification.type === 'info'}
			class:border-c-action={notification.type === 'warning'}
			in:fly={{ x: 150 }}
			out:fly={{ y: -150 }}
			animate:flip={{ duration: 300 }}
			{...useSwipe(
				() => {
					notifications.remove(notification.id);
				},
				() => ({ timeframe: 300, minSwipeDistance: 60, touchAction: 'pan-y' })
			)}
		>
			{#if notification.type === 'info'}
				<IconInfo class="text-c-btn-hover" />
			{:else if notification.type === 'success'}
				<IconCheck class="text-c-success" />
			{:else if notification.type === 'error'}
				<IconOctagonX class="text-c-danger" />
			{:else if notification.type === 'warning'}
				<IconTriangleAlert class="text-c-action" />
			{/if}
			<p>{notification.message}</p>
		</div>
	{/each}
</div>
