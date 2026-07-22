<script lang="ts">
	import IconRefreshCw from '@lucide/svelte/icons/refresh-cw';

	let {
		onClick,
		running = false,
		disabled = false
	} = $props<{
		onClick: Function;
		running: boolean;
		disabled: boolean;
	}>();
</script>

<button
	class="z-40 cursor-pointer rounded-full p-[7px] text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
	class:bg-c-danger-hover={!disabled}
	class:bg-c-neutral-3={disabled}
	onclick={onClick}
	{disabled}
>
	<IconRefreshCw class="size-5 {running ? 'animate-spin' : ''}" />
</button>

<!-- animate-spin -->
