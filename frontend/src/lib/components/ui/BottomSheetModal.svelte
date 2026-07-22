<script lang="ts">
	import { fade, blur, fly } from 'svelte/transition';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';

	let {
		onClose,
		children,
		title = null
	} = $props<{
		onClose?: () => void | Promise<void>;
		children?: any;
		title?: string | null;
	}>();
</script>

<div
	class="fixed top-0 left-0 z-40 flex h-dvh w-screen items-end bg-transparent backdrop-blur-xs modal-blur pb-16 2xl:pb-0"
	out:fade
	in:blur={{ duration: 300 }}
>
	<div
		class="relative w-full"
		in:fly={{ y: 400, duration: 350 }}
		out:fly={{ y: 400, duration: 250 }}
	>
		{#if onClose}
			<CloseButton onClick={onClose} />
		{/if}
		<div class="relative z-30 w-full overflow-y-auto rounded-t-2xl bg-c-bg-modal p-6 shadow-md not-dark:border-t-1 not-dark:border-c-neutral-2 dark:shadow-s-dark-shadow max-h-[calc(100dvh-4rem)]">
			{#if title}
				<p class="mb-4 text-xl font-bold text-c-heading dark:text-c-primary">{title}</p>
			{/if}
			{@render children?.()}
		</div>
	</div>
</div>
