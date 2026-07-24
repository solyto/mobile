<script lang="ts">
	import { fade, blur, fly } from 'svelte/transition';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let {
		title = null,
		description = null,
		type = 'default',
		children,
		onConfirm,
		onCancel,
	} = $props<{
		title?: string;
		description?: string;
		type?: 'default' | 'confirm' | 'confirm-delete' | 'info';
		children?: any;
		onConfirm: () => void | Promise<any>;
		onCancel: () => void | Promise<any>;
	}>();
</script>

<div
	class="fixed top-0 left-0 z-[60] flex h-dvh w-screen items-end bg-transparent backdrop-blur-xs modal-blur pb-16 2xl:pb-0 overflow-x-hidden"
	in:fly|global={{ y: 400, duration: 350 }}
	out:fly|global={{ y: 400, duration: 250 }}
>
	<div
		class="relative w-full"
	>
		<CloseButton onClick={onCancel} />
		<div class="relative z-30 w-full overflow-y-auto rounded-t-2xl bg-c-bg-modal p-6 shadow-md not-dark:border-t-1 not-dark:border-c-neutral-2 dark:shadow-s-dark-shadow max-h-[calc(100dvh-4rem)]">
			{#if title}
				<p class="mb-4 text-xl font-bold text-c-heading dark:text-c-primary">{title}</p>
			{/if}
			{@render children?.()}
			<div class="mt-8 flex w-full flex-row justify-center gap-4">
				<TextButton
					title={ts.get.layout.modal_confirm}
					type={type === 'confirm-delete' ? 'danger' : 'action'}
					onclick={onConfirm}
					class="w-100"
				/>
			</div>
		</div>
	</div>
</div>
