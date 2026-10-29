<script lang="ts">
	import IconTrash from '@lucide/svelte/icons/trash-2';

	let {
		onClick,
		inModal = true,
		buttonStyle = 'default',
		iconClass = 'size-5'
	}: {
		onClick: () => void | Promise<void>;
		inModal?: boolean;
		buttonStyle?: 'default' | 'plain' | 'minimal';
		iconClass?: string;
	} = $props();
</script>

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
>
	<IconTrash class={iconClass} />
</button>
