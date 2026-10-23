<script lang="ts">
	import type { Component } from 'svelte';

	let {
		title,
		icon: Icon,
		onClick
	}: {
		title: string;
		icon: Component<{ class?: string }>;
		onClick: () => void;
	} = $props();
</script>

<button
	type="button"
	class="group size-14 cursor-pointer rounded-lg border-3 border-c-neutral-1 p-3 shadow-xs transition-all hover:bg-c-neutral dark:border-s-dark dark:hover:bg-s-dark-3"
	onclick={onClick}
	{title}
>
	<Icon class="size-full" />
</button>
