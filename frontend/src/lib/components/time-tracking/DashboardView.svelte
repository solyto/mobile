<script lang="ts">
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import Entry from '$lib/components/time-tracking/Entry.svelte';
	import EntryCreate from '$lib/components/time-tracking/EntryCreate.svelte';
	import TimerWidget from '$lib/components/time-tracking/TimerWidget.svelte';
	import TimeBreakdownWidget from '$lib/components/time-tracking/TimeBreakdownWidget.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import TimeTrackingGroupingService from '$lib/services/TimeTrackingGroupingService';
	import type { TimeTrackingEntry } from '$lib/types/time_tracking';
	import { getStartOfWeek } from '$lib/helpers/DateHelper';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const auth = getAuth();
	const groupingService = new TimeTrackingGroupingService();

	let editingEntry = $state<TimeTrackingEntry | null>(null);

	let recentEntries = $derived(
		tt.entries
			.filter((e) => e.stopped_at !== null)
			.slice(0, 10)
	);

	let weekBreakdown = $derived.by(() => {
		const startOfWeek = getStartOfWeek(new Date(), auth.getWeekStart());
		const filtered = tt.entries.filter(
			(e) => e.stopped_at !== null && new Date(e.started_at) >= startOfWeek
		);
		return groupingService.groupByProject(filtered, tt.projects);
	});

	let todayBreakdown = $derived.by(() => {
		const now = new Date();
		const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const filtered = tt.entries.filter(
			(e) => e.stopped_at !== null && new Date(e.started_at) >= startOfToday
		);
		return groupingService.groupByProject(filtered, tt.projects);
	});
</script>

<div class="flex flex-col gap-8">
	<div class="max-lg:ml-14">
		<Heading title={ts.get.timeTracking.dashboard} my={0} />
	</div>

	{#if tt.projects.length === 0}
		<EmptyState title={ts.get.timeTracking.no_projects} description={ts.get.timeTracking.no_projects_desc} />
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			<TimerWidget />
			<TimeBreakdownWidget
				title={ts.get.timeTracking.today}
				breakdown={todayBreakdown}
				total={todayBreakdown.reduce((s, c) => s + c.minutes, 0)}
			/>
			<TimeBreakdownWidget
				title={ts.get.timeTracking.this_week}
				breakdown={weekBreakdown}
				total={weekBreakdown.reduce((s, c) => s + c.minutes, 0)}
			/>
		</div>
	{/if}

	{#if recentEntries.length > 0}
		<div class="flex flex-col gap-2">
			<Heading title={ts.get.timeTracking.recent_entries} my={0} />
			{#each recentEntries as entry (entry.id)}
				<Entry {entry} showProject showDate showEdit onEdit={(e) => (editingEntry = e)} />
			{/each}
		</div>
	{/if}
</div>

{#if editingEntry}
	<EntryCreate entry={editingEntry} onClose={() => (editingEntry = null)} />
{/if}
