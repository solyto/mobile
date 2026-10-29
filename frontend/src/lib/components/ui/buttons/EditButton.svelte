<script lang="ts">
	import IconPen from '@lucide/svelte/icons/pen';

	let {
		onClick,
		title = '',
		inModal = true,
		buttonStyle = 'default'
	}: {
		onClick: () => void;
		title?: string;
		inModal?: boolean;
		buttonStyle?: 'default' | 'plain' | 'minimal';
	} = $props();
</script>

<button
	class="z-40 flex cursor-pointer items-center justify-center rounded-full drop-shadow-md transition-all hover:drop-shadow-xl"
	class:bg-c-btn={buttonStyle === 'default'}
	class:text-white={buttonStyle === 'default'}
	class:size-[34px]={buttonStyle === 'default'}
	class:text-c-btn={buttonStyle === 'plain'}
	class:text-c-neutral-3={buttonStyle === 'minimal'}
	class:drop-shadow-none={buttonStyle === 'minimal'}
	class:hover:text-c-btn={buttonStyle === 'minimal'}
	class:hover:text-c-heading={buttonStyle !== 'minimal'}
	class:absolute={inModal}
	class:top-20={inModal}
	class:right-4={inModal}
	onclick={onClick}
	{title}
>
	<IconPen class="size-5" />
</button>