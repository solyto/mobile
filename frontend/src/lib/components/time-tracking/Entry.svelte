<script lang="ts">
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import InlineEditButton from '$lib/components/ui/buttons/InlineEditButton.svelte';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import type { TimeTrackingEntry } from '$lib/types/time_tracking';

	let {
		entry,
		showProject = false,
		showDate = false,
		showEdit = false,
		showDelete = false,
		onEdit
	}: {
		entry: TimeTrackingEntry;
		showProject?: boolean;
		showDate?: boolean;
		showEdit?: boolean;
		showDelete?: boolean;
		onEdit?: (entry: TimeTrackingEntry) => void;
	} = $props();

	const tt = getTimeTracking();
	const ts = getTranslation();
	const auth = getAuth();

	let showDescriptionFallback = $derived(showEdit || showDelete);
</script>

<div class="flex flex-row items-stretch justify-between rounded-md bg-c-bg-surface p-3 shadow-sm">
	<div class="mr-3 w-1 flex-shrink-0 self-stretch rounded-full bg-c-primary"></div>
	<div class="flex flex-1 flex-col gap-0.5">
		{#if showProject && entry.project}
			<span class="text-sm font-medium">
				{entry.project.title}
			</span>
		{/if}
		{#if entry.description}
			<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">
				{entry.description}
			</span>
		{:else if showDescriptionFallback}
			<span class="text-sm italic text-c-neutral-4 dark:text-c-neutral-5">
				{ts.get.timeTracking.no_description}
			</span>
		{/if}
		{#if showDate || entry.has_exact_times}
			<span class="text-xs text-c-neutral-4 dark:text-c-neutral-5">
				{#if showDate}{auth.getDateWithWeekdayInUserPreferredFormat(entry.started_at)}{/if}{#if showDate && entry.has_exact_times}&nbsp;&middot;&nbsp;{/if}{#if entry.has_exact_times}{auth.getTimeInUserPreferredFormat(entry.started_at)} - {entry.stopped_at
					? auth.getTimeInUserPreferredFormat(entry.stopped_at)
					: '...'}{/if}
			</span>
		{/if}
	</div>
	<div class="flex flex-row items-center gap-0 self-center">
		<span class="mr-4 text-base tabular-nums text-c-primary">
			{tt.formatDuration(entry.duration_minutes)}
		</span>
		{#if showEdit}
			<InlineEditButton onClick={() => onEdit?.(entry)} />
		{/if}
		{#if showDelete}
			<InlineDeleteButton onClick={() => { tt.deleteEntry(entry.id); }} />
		{/if}
	</div>
</div>
