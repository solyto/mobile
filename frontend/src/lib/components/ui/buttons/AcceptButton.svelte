<script lang="ts">
	import IconCheck from '@lucide/svelte/icons/check';

	let { onClick, colorOnHover = false, inModal = false }: {
		onClick: () => void;
		colorOnHover?: boolean;
		inModal?: boolean;
	} = $props();
</script>

<button
	class="z-40 flex cursor-pointer items-center justify-center rounded-full p-[7px] drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
	class:bg-c-success={!colorOnHover}
	class:text-white={!colorOnHover}
	class:text-c-neutral-3={colorOnHover}
	class:bg-c-neutral={colorOnHover}
	class:dark:bg-s-dark-2={colorOnHover}
	class:hover:bg-c-success={colorOnHover}
	class:absolute={inModal}
	class:top-20={inModal}
	class:right-4={inModal}
	onclick={onClick}
>
	<IconCheck class="size-5" />
</button>
