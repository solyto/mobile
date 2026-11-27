<script lang="ts">
	import IconTrash from '$lib/icons/lucide/trash.svelte';
	import FillOnHoverButton from '$lib/components/ui/buttons/FillOnHoverButton.svelte';

	let {
		onClick,
		title = '',
		inModal = true,
		buttonStyle = 'default',
		iconClass = 'size-5'
	}: {
		onClick: (e: MouseEvent) => void | Promise<void>;
		title?: string;
		inModal?: boolean;
		buttonStyle?: 'default' | 'plain' | 'minimal' | 'fill-on-hover';
		iconClass?: string;
	} = $props();
</script>

{#if buttonStyle === 'fill-on-hover'}
	<FillOnHoverButton {onClick} {title} icon={IconTrash} fill="bg-c-danger" {iconClass} />
{:else}
	<button
		class="z-40 flex cursor-pointer items-center justify-center rounded-full drop-shadow-md transition-all hover:drop-shadow-xl"
		class:bg-c-danger={buttonStyle === 'default'}
		class:text-white={buttonStyle === 'default'}
		class:size-[34px]={buttonStyle === 'default'}
		class:text-c-danger={buttonStyle === 'plain'}
		class:text-c-neutral-3={buttonStyle === 'minimal'}
		class:drop-shadow-none={buttonStyle === 'minimal'}
		class:hover:text-c-danger={buttonStyle === 'minimal'}
		class:hover:text-c-heading={buttonStyle !== 'minimal'}
		class:absolute={inModal}
		class:top-32={inModal}
		class:right-4={inModal}
		onclick={onClick}
		{title}
		aria-label={title || undefined}
	>
		<IconTrash class={iconClass} />
	</button>
{/if}
