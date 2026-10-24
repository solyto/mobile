<script lang="ts">
	import type { Component } from 'svelte';

	let {
		label,
		icon: Icon,
		confidencePercent
	}: {
		label: string;
		icon: Component<{ class?: string }>;
		confidencePercent: number;
	} = $props();
</script>

<div class="flex w-full items-center gap-4 rounded-xl border-1 border-c-neutral-2 p-4 dark:border-s-dark-3">
	<Icon class="h-8 w-8 shrink-0 text-c-neutral-5" />
	<div class="flex flex-1 flex-col gap-1.5">
		<span class="text-lg font-bold">{label}</span>
		<div class="flex items-center gap-2">
			<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-c-neutral-2 dark:bg-s-dark-3">
				<div class="h-full rounded-full bg-c-btn transition-all" style="width: {confidencePercent}%"></div>
			</div>
			<span class="text-xs text-c-neutral-5">{confidencePercent}%</span>
		</div>
	</div>
</div>
