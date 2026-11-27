<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { fade } from 'svelte/transition';
	import { formatDuration } from '$lib/helpers/TimeTrackingHelper';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { urls } from '$lib/config/urls';
	import { hamburgerClearance } from '$lib/config/navigation';
	import type {
		TimeTrackingProject,
		TimeTrackingEntry,
		TimeTrackingCategory
	} from '$lib/types/time_tracking';
	import InlineEditButton from '$lib/components/ui/buttons/InlineEditButton.svelte';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import Entry from '$lib/components/time-tracking/Entry.svelte';
	import ProjectCreate from '$lib/components/time-tracking/ProjectCreate.svelte';
	import EntryCreate from '$lib/components/time-tracking/EntryCreate.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import TimeTrackingGroupingService from '$lib/services/TimeTrackingGroupingService';
	import { getReadableTextColor } from '$lib/helpers/ColorHelper';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const auth = getAuth();
	const loadingIndicator = getLoadingIndicator();
	const groupingService = new TimeTrackingGroupingService();

	let editModal = $state<boolean>(false);
	let deleteModal = $state<boolean>(false);
	let showEntryCreate = $state<boolean>(false);
	let editingEntry = $state<TimeTrackingEntry | null>(null);

	let project = $derived<TimeTrackingProject | null>(
		tt.projects.find((p) => p.id === page.params.id) ?? null
	);

	let projectEntries = $derived(groupingService.groupByDay(tt.entries.filter(isFinishedEntryOfProject), dayLabel));

	let totalDuration = $derived(project?.total_duration ?? 0);

	function isFinishedEntryOfProject(entry: TimeTrackingEntry): boolean {
		return project !== null && entry.project?.id === project.id && entry.stopped_at !== null;
	}

	function dayLabel(startedAt: string): string {
		return auth.getDateWithWeekdayInUserPreferredFormat(startedAt);
	}

	function categoryColor(cat: TimeTrackingCategory): string {
		return tt.categories.find((c) => c.id === cat.id)?.color ?? cat.color ?? 'var(--color-c-neutral-4)';
	}

	function categoryTextColor(cat: TimeTrackingCategory): string {
		return getReadableTextColor(categoryColor(cat));
	}

	afterNavigate(() => {
		if (!project) goto(resolve(urls.timeTracking));
	});

	async function onDelete(): Promise<void> {
		if (!project) return;
		loadingIndicator.start();
		try {
			await tt.deleteProject(project.id);
		} finally {
			loadingIndicator.stop();
		}
		await goto(resolve(urls.timeTracking));
	}

	function openEdit(): void {
		editModal = true;
	}

	function closeEdit(): void {
		editModal = false;
	}

	function askDelete(): void {
		deleteModal = true;
	}

	function cancelDelete(): void {
		deleteModal = false;
	}
</script>

{#if editModal && project}
	<ProjectCreate
		projectId={project.id}
		onClose={closeEdit}
	/>
{/if}

{#if deleteModal}
	<ConfirmationModal
		title={ts.get.timeTracking.deletion_title}
		description={ts.get.timeTracking.deletion_description}
		type="confirm"
		onConfirm={onDelete}
		onCancel={cancelDelete}
	/>
{/if}

{#if project}
	<div class="flex h-full flex-1 flex-col" in:fade>
		<div
			class="flex-shrink-0 border-b border-c-neutral-1 bg-c-bg-surface/80 px-4 pt-6 pb-4 backdrop-blur-sm lg:px-8 lg:py-4 dark:border-s-dark-3"
		>
			<div class="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
				<div class="flex h-10 flex-row items-center justify-end {hamburgerClearance} lg:order-last">
					<div class="flex flex-row items-center gap-2">
						<TextButton
							title={ts.get.timeTracking.add_entry}
							onclick={() => (showEntryCreate = true)}
						/>
						<InlineEditButton label={ts.get.timeTracking.edit_project} onClick={openEdit} />
						<InlineDeleteButton label={ts.get.timeTracking.deletion_title} onClick={askDelete} />
					</div>
				</div>
				<div class="flex flex-row items-center gap-4">
					<div class="flex flex-col">
						<Heading title={project.title} my={0} />
						{#if project.description}
							<span class="text-xs text-c-neutral-5 dark:text-c-neutral-4">
								{project.description}
							</span>
						{/if}
						{#if project.categories.length > 0}
							<div class="mt-1 flex flex-row flex-wrap gap-1">
								{#each project.categories as cat (cat.id)}
									<span
										class="rounded-sm px-1.5 py-0.5 text-xs"
										style="
											background-color: {categoryColor(cat)};
											color: {categoryTextColor(cat)};
										"
									>
										{cat.title}
									</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-6 overflow-y-auto p-4 lg:px-8">
			<div
				class="flex flex-row items-center gap-2 rounded-md bg-c-bg-surface p-4 shadow-sm"
			>
				<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
					{ts.get.timeTracking.total_time}:
				</span>
				<span class="text-lg font-bold tabular-nums text-c-primary">
					{formatDuration(totalDuration)}
				</span>
			</div>

			{#if projectEntries.length === 0}
				<p class="text-c-neutral-5 dark:text-c-neutral-4">{ts.get.timeTracking.no_entries}</p>
			{:else}
				<div class="flex flex-col gap-4">
					{#each projectEntries as group (group.date)}
						<div class="flex flex-col gap-2">
							<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
								{group.date}
							</span>
							<div class="flex flex-col divide-y">
								{#each group.entries as entry (entry.id)}
									<Entry {entry} showEdit showDelete onEdit={(e) => (editingEntry = e)} />
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

{#if showEntryCreate && project}
	<EntryCreate projectId={project.id} onClose={() => (showEntryCreate = false)} />
{/if}

{#if editingEntry}
	<EntryCreate entry={editingEntry} onClose={() => (editingEntry = null)} />
{/if}
