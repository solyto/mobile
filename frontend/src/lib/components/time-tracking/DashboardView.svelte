<script lang="ts">
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Entry from '$lib/components/time-tracking/Entry.svelte';
	import EntryCreate from '$lib/components/time-tracking/EntryCreate.svelte';
	import TimerWidget from '$lib/components/time-tracking/TimerWidget.svelte';
	import TimeBreakdownWidget from '$lib/components/time-tracking/TimeBreakdownWidget.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import TimeTrackingGroupingService from '$lib/services/TimeTrackingGroupingService';
	import type { TimeTrackingEntry } from '$lib/types/time_tracking';
	import type { WeekStart } from '$lib/types/auth';
	import { getStartOfWeek } from '$lib/helpers/DateHelper';
	import { hamburgerClearance } from '$lib/config/navigation';

	const RECENT_ENTRIES = 10;

	let { weekStart }: { weekStart: WeekStart } = $props();

	const tt = getTimeTracking();
	const ts = getTranslation();
	const groupingService = new TimeTrackingGroupingService();

	let editingEntry = $state<TimeTrackingEntry | null>(null);

	let recentEntries = $derived(tt.entries.filter((e) => e.stopped_at !== null).slice(0, RECENT_ENTRIES));

	let weekBreakdown = $derived(groupingService.groupFinishedSince(tt.entries, tt.projects, getStartOfWeek(new Date(), weekStart)));

	let todayBreakdown = $derived(groupingService.groupFinishedSince(tt.entries, tt.projects, startOfToday()));

	function startOfToday(): Date {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), now.getDate());
	}

	function closeEdit(): void {
		editingEntry = null;
	}
</script>

<div class="flex flex-col gap-8">
	<div class="max-lg:mt-1 {hamburgerClearance}">
		<Heading title={ts.get.timeTracking.dashboard} my={0} />
	</div>

	{#if tt.projects.length === 0}
		<EmptyState title={ts.get.timeTracking.no_projects} description={ts.get.timeTracking.no_projects_desc} />
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			<TimerWidget />
			<TimeBreakdownWidget title={ts.get.timeTracking.today} breakdown={todayBreakdown} />
			<TimeBreakdownWidget title={ts.get.timeTracking.this_week} breakdown={weekBreakdown} />
		</div>
	{/if}

	{#if recentEntries.length > 0}
		<div class="flex flex-col gap-2">
			<Heading title={ts.get.timeTracking.recent_entries} my={0} />
			<div class="flex flex-col divide-y">
				{#each recentEntries as entry (entry.id)}
					<Entry {entry} showProject showDate showEdit onEdit={(e) => (editingEntry = e)} />
				{/each}
			</div>
		</div>
	{/if}
</div>

{#if editingEntry}
	<EntryCreate entry={editingEntry} onClose={closeEdit} />
{/if}
