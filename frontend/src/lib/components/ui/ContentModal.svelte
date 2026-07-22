<script lang="ts">
	import { fade, blur, scale } from 'svelte/transition';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import EditButton from '$lib/components/ui/buttons/EditButton.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';

	let {
		onClose,
		onEdit,
		onDelete,
		children,
		small = false,
		rounded = null,
		p = '8',
		width = null,
		title = null,
		transparent = false,
		higherZIndex = false,
		showTitleOnMobile = false
	} = $props<{
		onClose?: () => void | Promise<void>;
		onEdit?: () => void | Promise<void>;
		onDelete?: () => void | Promise<void>;
		children?: any;
		small?: boolean;
		rounded?: string | null;
		p?: string;
		width?: string | null;
		title?: string | null;
		transparent?: boolean;
		higherZIndex?: boolean;
		showTitleOnMobile?: boolean;
	}>();
</script>

<div
	class="fixed top-0 left-0 flex h-dvh w-screen justify-center bg-transparent backdrop-blur-xs transition-all modal-blur max-md:h-[calc(100dvh-4rem)]"
	class:z-40={!higherZIndex}
	class:z-50={higherZIndex}
	out:fade
	in:blur={{ duration: 300 }}
>
	<div class="relative my-auto p-8 max-md:p-0 modal-container" in:scale={{ start: 0.75 }}>
		{#if title}
			<div
				class="absolute text-2xl font-bold tracking-wide text-c-heading max-md:hidden dark:text-c-primary"
				class:z-40={!higherZIndex}
				class:z-50={higherZIndex}
				class:top-[-20px]={!transparent}
				class:left-12={!transparent}
				class:top-3={transparent}
				class:left-15={transparent}
			>
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
		<div
			class="
				relative max-h-dvh w-full max-w-screen overflow-y-auto p-4 not-dark:border-c-neutral-2 max-md:w-screen max-md:max-h-[calc(100dvh-4rem)]
				{rounded ? 'md:rounded-' + rounded : ''}
				{p ? 'md:p-' + p : 'md:p-4'}
				{width ? 'md:w-' + width : ''}
			"
			class:z-30={!higherZIndex}
			class:z-40={higherZIndex}
			class:md:min-w-120={!small && !width}
			class:bg-c-bg-modal={!transparent}
			class:not-dark:border-1={!transparent}
			class:shadow-md={!transparent}
			class:dark:shadow-s-dark-shadow={!transparent}
			in:scale={{ start: 0.75 }}
		>
			{#if showTitleOnMobile}
				<div class="text-2xl font-bold tracking-wide text-c-heading dark:text-c-primary md:hidden mb-6">
					{title}
				</div>
			{/if}
			{@render children?.()}
		</div>
	</div>
</div>

<!-- md:rounded-lg md:rounded-xl md:rounded-2xl md:w-60 md:w-72 md:w-96 md:w-2xl md:w-3xl md:w-4xl p-8 p-10 p-12 p-16 -->
