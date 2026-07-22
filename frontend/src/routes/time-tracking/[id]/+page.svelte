<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { fade } from 'svelte/transition';
	import IconArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { urls } from '$lib/config/urls';
	import type { TimeTrackingProject, TimeTrackingEntry } from '$lib/types/time_tracking';
	import InlineEditButton from '$lib/components/ui/buttons/InlineEditButton.svelte';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import Entry from '$lib/components/time-tracking/Entry.svelte';
	import ProjectCreate from '$lib/components/time-tracking/ProjectCreate.svelte';
	import EntryCreate from '$lib/components/time-tracking/EntryCreate.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const auth = getAuth();
	const loadingIndicator = getLoadingIndicator();

	let editModal = $state<boolean>(false);
	let deleteModal = $state<boolean>(false);
	let showEntryCreate = $state<boolean>(false);

	let project = $derived<TimeTrackingProject | null>(
		tt.projects.find((p) => p.id === page.params.id) ?? null
	);

	let projectEntries = $derived(
		project
			? groupByDate(
					tt.entries.filter(
						(e) => e.project?.id === project!.id && e.stopped_at !== null
					)
				)
			: []
	);

	let totalDuration = $derived(
		project
			? tt.entries
					.filter((e) => e.project?.id === project!.id && e.stopped_at !== null)
					.reduce((sum, e) => sum + e.duration_minutes, 0)
			: 0
	);

	$effect(() => {
		if (tt.loaded && !project) {
			goto(resolve(urls.timeTracking));
		}
	});

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

	async function onDelete(): Promise<void> {
		if (!project) return;
		loadingIndicator.start();
		await tt.deleteProject(project.id);
		loadingIndicator.stop();
		await goto(resolve(urls.timeTracking));
	}
</script>

{#if editModal && project}
	<ProjectCreate
		projectId={project.id}
		onClose={() => {
			editModal = false;
		}}
	/>
{/if}

{#if deleteModal}
	<Modal
		title={ts.get.timeTracking.deletion_title}
		description={ts.get.timeTracking.deletion_description}
		type="confirm"
		onConfirm={onDelete}
		onCancel={() => {
			deleteModal = false;
		}}
	/>
{/if}

{#if project}
	<div class="flex h-full flex-1 flex-col" in:fade>
		<div
			class="flex-shrink-0 border-b border-c-neutral-1 bg-white/80 px-4 py-4 backdrop-blur-sm lg:px-8 dark:border-s-dark-3 dark:bg-s-dark/80"
		>
			<div class="flex w-full flex-row items-center justify-between">
				<div class="flex flex-row items-center gap-4">
					<a
						href={resolve(urls.timeTracking)}
						class="flex size-9 items-center justify-center rounded-lg text-c-neutral-4 transition-all hover:bg-c-neutral-1 hover:text-c-neutral-6 lg:hidden dark:hover:bg-s-dark-3 dark:hover:text-white"
					>
						<IconArrowLeft class="size-5" />
					</a>
					<div class="flex flex-col">
						<span class="text-lg font-bold text-c-heading dark:text-c-primary">
							{project.title}
						</span>
						{#if project.description}
							<span class="text-xs text-c-neutral-5 dark:text-c-neutral-4">
								{project.description}
							</span>
						{/if}
						{#if project.categories.length > 0}
							<div class="mt-1 flex flex-row flex-wrap gap-1">
								{#each project.categories as cat (cat.id)}
									<span
										class="rounded-sm px-1.5 py-0.5 text-xs text-white"
										style="background-color: {cat.color ?? '#888'}"
									>
										{cat.title}
									</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>
				<div class="flex flex-row items-center gap-2">
					<TextButton
						title={ts.get.timeTracking.add_entry}
						onclick={() => (showEntryCreate = true)}
					/>
					<InlineEditButton
						onClick={() => {
							editModal = true;
						}}
					/>
					<InlineDeleteButton
						onClick={() => {
							deleteModal = true;
						}}
					/>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-6 overflow-y-auto p-4 lg:px-8">
			<div
				class="flex flex-row items-center gap-2 rounded-md bg-white p-4 shadow-sm dark:bg-s-dark-2"
			>
				<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
					{ts.get.timeTracking.total_time}:
				</span>
				<span class="text-lg font-bold tabular-nums text-c-primary">
					{tt.formatDuration(totalDuration)}
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
							{#each group.entries as entry (entry.id)}
								<Entry {entry} showDelete />
							{/each}
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
