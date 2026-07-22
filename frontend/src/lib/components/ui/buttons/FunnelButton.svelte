<script lang="ts">
	import IconFunnel from '@lucide/svelte/icons/funnel';

	let { onclick, top, left } = $props<{
		onclick: () => void;
		top?: number;
		left?: number;
	}>();
</script>

<button
	class="absolute z-40 cursor-pointer rounded-full shadow-md p-2 not-dark:bg-c-primary hover:bg-c-neutral-2 lg:hidden dark:hover:bg-s-dark-3 {top ? `top-${top}` : 'top-4'} {left ? `left-${left}` : 'left-4'}"
	{onclick}
>
	<IconFunnel class="text-c-neutral-1" />
</button>

<!-- top-2 top-4 top-6 top-8 left-2 left-4 left-6 left-8 -->