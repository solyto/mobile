<script lang="ts">
	import type { UserNotification } from '$lib/types/user_notification';
	import { getUserNotifications } from '$lib/state/UserNotifications.svelte';
	import { formatDate } from '$lib/helpers/DateHelper';

	const userNotifications = getUserNotifications();

	let {
		notification,
		onClose = () => {},
		variant = 'row'
	} = $props<{
		notification: UserNotification;
		onClose?: () => void;
		variant?: 'row' | 'card';
	}>();

	function goTo(): void {
		onClose();
	}
</script>

{#snippet rowContent()}
	<div class="flex items-center gap-2">
		{#if !notification.read_at}
			<div class="size-2 shrink-0 rounded-full bg-c-btn-hover shadow-sm"></div>
		{/if}
		<span class="text-sm font-bold">{notification.title}</span>
		<span class="ml-auto shrink-0 text-xs text-c-neutral-4">{formatDate(notification.created_at)}</span>
	</div>
	<p class="text-sm">
		{notification.body}
	</p>
{/snippet}

{#if notification.link}
	<a
		class="relative flex w-full cursor-pointer flex-col gap-1 hover:bg-c-neutral"
		class:px-4={variant === 'row'}
		class:py-2={variant === 'row'}
		class:dark:hover:bg-s-dark-2={variant === 'row'}
		class:transition-all={variant === 'card'}
		class:rounded-md={variant === 'card'}
		class:p-4={variant === 'card'}
		class:shadow-sm={variant === 'card'}
		class:dark:shadow-s-dark-shadow={variant === 'card'}
		class:dark:bg-s-dark-2={variant === 'card'}
		class:dark:hover:bg-s-dark-3={variant === 'card'}
		href={notification.link}
		onclick={goTo}
	>
		{@render rowContent()}
	</a>
{:else}
	<div
		class="relative flex w-full cursor-pointer flex-col gap-1 hover:bg-c-neutral"
		class:px-4={variant === 'row'}
		class:py-2={variant === 'row'}
		class:dark:hover:bg-s-dark-2={variant === 'row'}
		class:transition-all={variant === 'card'}
		class:rounded-md={variant === 'card'}
		class:p-4={variant === 'card'}
		class:shadow-sm={variant === 'card'}
		class:dark:shadow-s-dark-shadow={variant === 'card'}
		class:dark:bg-s-dark-2={variant === 'card'}
		class:dark:hover:bg-s-dark-3={variant === 'card'}
		onclick={goTo}
	>
		{@render rowContent()}
	</div>
{/if}
