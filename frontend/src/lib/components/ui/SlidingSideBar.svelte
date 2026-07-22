<script lang="ts">
	import { fly } from 'svelte/transition';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import EditButton from '$lib/components/ui/buttons/EditButton.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';

	let {
		onClose,
		onEdit,
		onDelete,
		children,
		title = null
	} = $props<{
		onClose?: () => void | Promise<void>;
		onEdit?: () => void | Promise<void>;
		onDelete?: () => void | Promise<void>;
		children?: any;
		title?: string | null;
	}>();
</script>

<div
	class="fixed top-0 right-0 z-60 flex h-screen flex-col items-start justify-start bg-c-bg-modal p-8 shadow-xl transition-all max-lg:w-full max-lg:overflow-y-auto max-lg:p-4 modal"
	transition:fly={{ x: 200, duration: 200 }}
>
	{#if title}
		<div class="mb-8 text-2xl font-bold tracking-wide text-c-heading dark:text-c-primary">
			{title}
		</div>
	{/if}
	{#if onClose || onEdit || onDelete}
		{#if onClose}
			<CloseButton onClick={onClose} />
		{/if}
		{#if onEdit}
			<EditButton onClick={onEdit} />
		{/if}
		{#if onDelete}
			<DeleteButton onClick={onDelete} />
		{/if}
	{/if}
	{@render children?.()}
</div>
