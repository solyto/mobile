<script lang="ts">
	import type { Component } from 'svelte';
	import SmoothLineChart from '$lib/components/charts/SmoothLineChart.svelte';
	import SubHeading from '$lib/components/ui/SubHeading.svelte';

	let {
		label,
		categories,
		values,
		icon: Icon
	}: {
		label: string;
		categories: string[];
		values: number[];
		icon: Component<{ class?: string }> | null;
	} = $props();
</script>

{#if categories.length >= 2}
	<div class="rounded-xl bg-c-bg-surface p-4 shadow-sm">
		<div class="mb-8 flex items-center gap-2">
			{#if Icon}
				<Icon class="size-4 text-c-neutral-6 dark:text-c-neutral-4" />
			{/if}
			<SubHeading title={label} my={0} />
		</div>
		<SmoothLineChart
			{categories}
			{values}
			min={1}
			max={5}
			filled={true}
			class="h-56"
		/>
	</div>
{/if}
