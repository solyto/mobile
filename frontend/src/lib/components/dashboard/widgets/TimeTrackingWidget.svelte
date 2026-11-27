<script lang="ts">
	import { blur } from 'svelte/transition';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { Translation } from '$lib/state/Translation.svelte';
	import IconTimer from '$lib/icons/lucide/timer.svelte';
	import TimeTrackingGroupingService from '$lib/services/TimeTrackingGroupingService';
	import TimeBreakdownList from '$lib/components/time-tracking/TimeBreakdownList.svelte';
	import { getStartOfWeek } from '$lib/helpers/DateHelper';
	import type { WeekStart } from '$lib/types/auth';

	const tt = getTimeTracking();
	const groupingService = new TimeTrackingGroupingService();

	let { ts, weekStart }: {
		ts: Translation;
		weekStart: WeekStart;
	} = $props();

	let weekBreakdown = $derived(groupingService.groupFinishedSince(tt.entries, tt.projects, getStartOfWeek(new Date(), weekStart)));
</script>

{#if tt.loaded && weekBreakdown.length > 0}
	<div in:blur>
		<div class="mb-3 flex items-center gap-2">
			<IconTimer size={15} class="text-c-heading dark:text-c-primary" />
			<span class="text-xs font-semibold tracking-wider text-c-heading uppercase dark:text-c-primary">
				{ts.get.nav.timeTracking}
			</span>
		</div>
		<TimeBreakdownList breakdown={weekBreakdown} totalLabel={ts.get.timeTracking.this_week} />
	</div>
{/if}
