<script lang="ts">
	import type { Component } from 'svelte';
	import { getScoreColor } from '$lib/helpers/CheckInHelper';

	let {
		label,
		value,
		position,
		icon: Icon
	}: {
		label: string;
		value: number;
		position: number;
		icon: Component<{ class?: string }> | null;
	} = $props();
</script>

<div class="flex items-center gap-3">
	{#if Icon}
		<div
			class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-c-neutral dark:bg-s-dark-3"
		>
			<Icon class="h-4 w-4 text-c-heading dark:text-c-primary" />
		</div>
	{:else}
		<div
			class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-c-neutral dark:bg-s-dark-3"
		>
			<span class="text-sm text-c-heading dark:text-c-primary"
				>#{position}</span
			>
		</div>
	{/if}
	<div class="min-w-0 flex-1">
		<div class="mb-1 flex items-center justify-between">
			<p class="text-sm font-medium text-c-neutral-7 dark:text-c-neutral-3">
				{label}
			</p>
			<p class="text-sm font-semibold text-c-neutral-9 dark:text-white">
				{#if isNaN(value)}
					-
				{:else}
					{value.toFixed(2)}
				{/if}
			</p>
		</div>
		<div class="h-2 overflow-hidden rounded-full bg-c-neutral-1 dark:bg-s-dark-3">
			<div
				class="h-full rounded-full transition-all duration-300 {getScoreColor(value)}"
				style="width: {isNaN(value) ? 0 : (value / 5) * 100}%"
			></div>
		</div>
	</div>
</div>
