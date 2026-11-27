<script lang="ts">
	import { fade } from 'svelte/transition';
	import { formatDuration } from '$lib/helpers/TimeTrackingHelper';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import EntryCreate from '$lib/components/time-tracking/EntryCreate.svelte';
	import Entry from '$lib/components/time-tracking/Entry.svelte';
	import TimeTrackingGroupingService from '$lib/services/TimeTrackingGroupingService';
	import type { TimeTrackingEntry } from '$lib/types/time_tracking';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const auth = getAuth();
	const groupingService = new TimeTrackingGroupingService();

	let editingEntry = $state<TimeTrackingEntry | null>(null);

	let groupedEntries = $derived(groupingService.groupByDay(tt.entries.filter((e) => e.stopped_at !== null), dayLabel));

	function dayLabel(startedAt: string): string {
		return auth.getDateWithWeekdayInUserPreferredFormat(startedAt);
	}

	function totalMinutes(entries: TimeTrackingEntry[]): number {
		return entries.reduce((sum, entry) => sum + entry.duration_minutes, 0);
	}

	function closeEdit(): void {
		editingEntry = null;
	}
</script>

{#if editingEntry}
	<EntryCreate entry={editingEntry} onClose={closeEdit} />
{/if}

{#if groupedEntries.length === 0}
	<p class="text-c-neutral-5 dark:text-c-neutral-4">{ts.get.timeTracking.no_entries}</p>
{:else}
	<div class="flex flex-col gap-4" in:fade>
		{#each groupedEntries as group (group.date)}
			<div class="flex flex-col gap-2">
				<div class="flex flex-row items-center gap-3">
					<span class="text-base font-medium text-c-neutral-5 dark:text-c-neutral-4">
						{group.date}
					</span>
					<div class="h-px flex-1 bg-c-neutral-2 dark:bg-s-dark-3"></div>
					<span class="text-sm tabular-nums text-c-neutral-5 dark:text-c-neutral-4">{formatDuration(totalMinutes(group.entries))}</span>
				</div>
				<div class="flex flex-col divide-y">
					{#each group.entries as entry (entry.id)}
						<Entry {entry} showProject showEdit showDelete onEdit={(e) => (editingEntry = e)} />
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}
