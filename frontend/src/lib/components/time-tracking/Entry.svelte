<script lang="ts">
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import EditButton from '$lib/components/ui/buttons/EditButton.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
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

	let confirmingDelete = $state<boolean>(false);

	function showPlaceholder(): boolean {
		return !entry.description && !(showProject && entry.project);
	}

	function timeText(): string {
		const parts: string[] = [];
		if (showDate) parts.push(auth.getDateWithWeekdayInUserPreferredFormat(entry.started_at));
		if (entry.has_exact_times) {
			const stop = entry.stopped_at ? auth.getTimeInUserPreferredFormat(entry.stopped_at) : '...';
			parts.push(`${auth.getTimeInUserPreferredFormat(entry.started_at)} – ${stop}`);
		}
		return parts.join(' · ');
	}
</script>

<div class="isolate flex items-center gap-3 border-c-neutral-1 py-2.5 dark:border-s-dark">
	<div class="flex min-w-0 flex-1 flex-col gap-0.5 md:flex-row md:items-baseline md:gap-2">
		{#if showProject && entry.project}
			<span class="truncate text-sm font-medium md:shrink-0">{entry.project.title}</span>
		{/if}
		{#if entry.description}
			<span class="truncate text-sm text-c-neutral-5 dark:text-c-neutral-4">{entry.description}</span>
		{:else if showPlaceholder()}
			<span class="text-sm italic text-c-neutral-4 dark:text-c-neutral-5">{ts.get.timeTracking.no_description}</span>
		{/if}
		<span class="truncate text-xs tabular-nums text-c-neutral-4 md:hidden dark:text-c-neutral-5">{timeText()}</span>
	</div>
	<span class="shrink-0 text-xs tabular-nums text-c-neutral-4 max-md:hidden dark:text-c-neutral-5">{timeText()}</span>
	<span class="w-16 shrink-0 text-right text-sm tabular-nums text-c-primary">{tt.formatDuration(entry.duration_minutes)}</span>
	{#if showEdit || showDelete}
		<div class="flex shrink-0 items-center gap-1">
			{#if showEdit}
				<EditButton
					title={ts.get.timeTracking.edit_entry}
					onClick={() => onEdit?.(entry)}
					inModal={false}
					buttonStyle="fill-on-hover"
				/>
			{/if}
			{#if showDelete}
				<DeleteButton
					title={ts.get.timeTracking.entry_deletion_title}
					onClick={() => { confirmingDelete = true; }}
					inModal={false}
					buttonStyle="fill-on-hover"
				/>
			{/if}
		</div>
	{/if}
</div>

{#if confirmingDelete}
	<ConfirmationModal
		title={ts.get.timeTracking.entry_deletion_title}
		description={ts.get.timeTracking.entry_deletion_description}
		type="confirm-delete"
		onConfirm={async () => {
			await tt.deleteEntry(entry.id);
			confirmingDelete = false;
		}}
		onCancel={() => (confirmingDelete = false)}
	/>
{/if}
