<script lang="ts">
	import type { Component } from 'svelte';

	let {
		label,
		icon: Icon,
		onClick
	}: {
		label: string;
		icon: Component<{ class?: string }>;
		onClick: () => void;
	} = $props();
</script>

<button
	class="group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-1 border-c-neutral-2 bg-c-bg-elevated px-3 py-3.5 text-c-heading transition-colors hover:border-c-btn hover:shadow-sm dark:border-s-dark-3 dark:text-c-primary"
	onclick={onClick}
>
	<Icon class="size-6 text-c-neutral-5 transition-colors group-hover:text-c-btn" />
	<span class="text-sm font-bold">{label}</span>
</button>
