<script lang="ts">
	import type { CheckInTracker } from '$lib/types/check_in';
	import SmoothLineChart from '$lib/components/charts/SmoothLineChart.svelte';
	import SubHeading from '$lib/components/ui/SubHeading.svelte';
	import TrackerGlyph from '$lib/components/check-in/TrackerGlyph.svelte';

	let {
		label,
		categories,
		values,
		tracker,
		min,
		max
	}: {
		label: string;
		categories: string[];
		values: number[];
		tracker: CheckInTracker;
		min: number;
		max?: number;
	} = $props();
</script>

{#if categories.length >= 2}
	<div class="rounded-xl bg-c-bg-surface p-4 shadow-sm">
		<div class="mb-8 flex items-center gap-2">
			<TrackerGlyph {tracker} class="size-4 text-c-neutral-6 dark:text-c-neutral-4" />
			<SubHeading title={label} my={0} />
		</div>
		<SmoothLineChart
			{categories}
			{values}
			{min}
			{max}
			filled={true}
			class="h-56"
		/>
	</div>
{/if}
