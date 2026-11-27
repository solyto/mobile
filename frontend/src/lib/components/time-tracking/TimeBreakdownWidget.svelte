<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { ProjectBreakdown } from '$lib/services/TimeTrackingGroupingService';
	import Heading from '$lib/components/ui/Heading.svelte';
	import TimeBreakdownList from '$lib/components/time-tracking/TimeBreakdownList.svelte';

	let { title, breakdown }: { title: string; breakdown: ProjectBreakdown[] } = $props();

	const ts = getTranslation();
</script>

<div class="flex flex-col gap-3 rounded-lg bg-c-bg-surface p-4 shadow-sm">
	<Heading {title} my={0} />
	<TimeBreakdownList {breakdown} totalLabel={ts.get.timeTracking.total_time} />
</div>
