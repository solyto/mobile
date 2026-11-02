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

<div class="fixed inset-x-4 top-4 z-90 flex flex-col gap-2 2xl:inset-x-auto 2xl:top-5 2xl:right-5">
	{#each queue as notification (notification.id)}
		<div
			class="notification-toast relative isolate flex h-full w-full flex-row gap-2 rounded-lg bg-c-bg-surface p-4 shadow-lg 2xl:min-w-60"
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
			<div
				class={[
					'absolute inset-0 -z-10 rounded-lg',
					{
						'bg-c-success/10': notification.type === 'success',
						'bg-c-danger/10': notification.type === 'error',
						'bg-c-btn-hover/10': notification.type === 'info',
						'bg-c-action/10': notification.type === 'warning'
					}
				]}
			></div>
			<div
				class="absolute top-0 left-0 h-full w-1 rounded-l-lg"
				class:bg-c-success={notification.type === 'success'}
				class:bg-c-danger={notification.type === 'error'}
				class:bg-c-btn-hover={notification.type === 'info'}
				class:bg-c-action={notification.type === 'warning'}
			></div>
			{#if notification.type === 'info'}
				<IconInfo class="mt-0.5 shrink-0 text-c-btn-hover" />
			{:else if notification.type === 'success'}
				<IconCheck class="mt-0.5 shrink-0 text-c-success" />
			{:else if notification.type === 'error'}
				<IconOctagonX class="mt-0.5 shrink-0 text-c-danger" />
			{:else if notification.type === 'warning'}
				<IconTriangleAlert class="mt-0.5 shrink-0 text-c-action" />
			{/if}
			<p>{notification.message}</p>
		</div>
	{/each}
</div>
