<script lang="ts">
	import type { Component } from 'svelte';

	let {
		title,
		position,
		replacing,
		icon: Icon,
		onClick
	}: {
		title: string;
		position: number;
		replacing: boolean;
		icon: Component<{ class?: string }>;
		onClick: () => void;
	} = $props();
</script>

<button
	type="button"
	class="group relative size-14 cursor-pointer rounded-lg border-3 p-3 shadow-xs transition-all {replacing ? 'border-c-action bg-c-action/10' : 'border-c-neutral-1 bg-c-neutral hover:bg-c-neutral-1 dark:border-s-dark dark:bg-s-dark-3 dark:hover:bg-s-dark'}"
	onclick={onClick}
	{title}
>
	<span class="absolute top-0.5 right-1 text-xs font-bold {replacing ? 'text-c-action' : 'text-c-neutral-4 dark:text-c-neutral-5'}">{position}</span>
	<Icon class="size-full" />
</button>
