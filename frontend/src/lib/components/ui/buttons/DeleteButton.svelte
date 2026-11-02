<script lang="ts">
	import IconTrash from '@lucide/svelte/icons/trash-2';

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
	<button
		type="button"
		class="group relative flex size-[34px] cursor-pointer items-center justify-center rounded-full text-c-neutral-3"
		onclick={onClick}
		{title}
		aria-label={title || undefined}
	>
		<span class="absolute h-0 w-0 rounded-full bg-c-danger transition-all group-hover:h-full group-hover:w-full group-focus-visible:h-full group-focus-visible:w-full"></span>
		<IconTrash class="relative {iconClass} transition-colors group-hover:text-white group-focus-visible:text-white" />
	</button>
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
