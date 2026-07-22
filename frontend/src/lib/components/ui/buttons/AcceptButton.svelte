<script lang="ts">
	import IconCheck from '@lucide/svelte/icons/check';

	let { onClick, colorOnHover = false } = $props<{
		onClick: Function;
		colorOnHover?: boolean;
	}>();
</script>

<button
	class="z-40 cursor-pointer rounded-full p-[7px] drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
	class:bg-c-success={!colorOnHover}
	class:text-white={!colorOnHover}
	class:text-c-neutral-3={colorOnHover}
	class:bg-c-neutral={colorOnHover}
	class:dark:bg-s-dark-2={colorOnHover}
	class:hover:bg-c-success={colorOnHover}
	onclick={onClick}
>
	<IconCheck class="size-5" />
</button>
