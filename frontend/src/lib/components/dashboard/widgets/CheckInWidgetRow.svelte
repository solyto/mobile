<script lang="ts">
	import type { Component } from 'svelte';
	import { getScoreColor } from '$lib/helpers/CheckInHelper';

	let {
		label,
		value,
		icon: Icon
	}: {
		label: string;
		value: number;
		icon: Component<{ class?: string }> | null;
	} = $props();
</script>

<div class="flex items-center gap-2.5">
	{#if Icon}
		<Icon
			class="h-3.5 w-3.5 shrink-0 text-c-neutral-4 dark:text-c-neutral-5"
		/>
	{/if}
	<div class="min-w-0 flex-1">
		<div class="mb-0.5 flex items-center justify-between">
			<span class="text-xs text-c-neutral-6 dark:text-c-neutral-4">
				{label}
			</span>
			<span class="text-xs font-medium text-c-neutral-8 dark:text-white">
				{#if isNaN(value)}
					-
				{:else}
					{value.toFixed(2)}
				{/if}
			</span>
		</div>
		<div class="h-1 overflow-hidden rounded-full bg-c-neutral-1 dark:bg-s-dark-3">
			<div
				class="h-full rounded-full transition-all duration-300 {getScoreColor(value)}"
				style="width: {isNaN(value) ? 0 : (value / 5) * 100}%"
			></div>
		</div>
	</div>
</div>
