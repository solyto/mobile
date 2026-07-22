<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import EntryEdit from '$lib/components/time-tracking/EntryEdit.svelte';
	import Entry from '$lib/components/time-tracking/Entry.svelte';
	import type { TimeTrackingEntry } from '$lib/types/time_tracking';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const auth = getAuth();

	let editingEntry = $state<TimeTrackingEntry | null>(null);

	let groupedEntries = $derived(groupByDate(tt.entries.filter((e) => e.stopped_at !== null)));

	function groupByDate(
		entries: TimeTrackingEntry[]
	): { date: string; entries: TimeTrackingEntry[] }[] {
		const groups: Record<string, TimeTrackingEntry[]> = {};

		for (const entry of entries) {
			const date = auth.getDateWithWeekdayInUserPreferredFormat(entry.started_at);
			if (!groups[date]) groups[date] = [];
			groups[date].push(entry);
		}

		return Object.entries(groups).map(([date, entries]) => ({ date, entries }));
	}
</script>

{#if editingEntry}
	<EntryEdit entry={editingEntry} onClose={() => (editingEntry = null)} />
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
				</div>
				{#each group.entries as entry (entry.id)}
					<Entry
						{entry}
						showProject
						showEdit
						showDelete
						onEdit={(e) => (editingEntry = e)}
					/>
				{/each}
			</div>
		{/each}
	</div>
{/if}
