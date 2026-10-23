<script lang="ts">
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Entry from '$lib/components/time-tracking/Entry.svelte';
	import EntryCreate from '$lib/components/time-tracking/EntryCreate.svelte';
	import TimerWidget from '$lib/components/time-tracking/TimerWidget.svelte';
	import TimeBreakdownWidget from '$lib/components/time-tracking/TimeBreakdownWidget.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import TimeTrackingGroupingService from '$lib/services/TimeTrackingGroupingService';
	import type { TimeTrackingEntry } from '$lib/types/time_tracking';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const groupingService = new TimeTrackingGroupingService();

	let editingEntry = $state<TimeTrackingEntry | null>(null);

	let recentEntries = $derived(
		tt.entries
			.filter((e) => e.stopped_at !== null)
			.slice(0, 10)
	);

	let weekBreakdown = $derived.by(() => {
		const now = new Date();
		const startOfWeek = new Date(now);
		startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
		startOfWeek.setHours(0, 0, 0, 0);
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
	<Heading title={ts.get.timeTracking.dashboard} my={0} />

	<div class="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-4">
		<div class="lg:col-span-1">
			<TimerWidget />
		</div>
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
