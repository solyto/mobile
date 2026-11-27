<script lang="ts">
	import { formatDuration } from '$lib/helpers/TimeTrackingHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TimeTrackingGroupingService, { type ProjectBreakdown } from '$lib/services/TimeTrackingGroupingService';

	let { breakdown, totalLabel }: { breakdown: ProjectBreakdown[]; totalLabel: string } = $props();

	const ts = getTranslation();
	const groupingService = new TimeTrackingGroupingService();

	let total = $derived(groupingService.totalMinutes(breakdown));

	function shareOfTotal(project: ProjectBreakdown): number {
		return total > 0 ? (project.minutes / total) * 100 : 0;
	}
</script>

<div class="flex flex-col gap-2.5">
	<div class="flex items-center justify-between">
		<span class="text-xs font-medium text-c-neutral-5 dark:text-c-neutral-4">
			{totalLabel}
		</span>
		<span class="text-xs font-medium tabular-nums text-c-primary">
			{formatDuration(total)}
		</span>
	</div>
	{#each breakdown as project (project.projectId)}
		<div class="flex items-center gap-2.5">
			<span class="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
				<span class="h-2.5 w-2.5 rounded-full" style="background-color: {project.color}"></span>
			</span>
			<div class="min-w-0 flex-1">
				<div class="mb-0.5 flex items-center justify-between">
					<span class="truncate text-xs">{project.title}</span>
					<span class="text-xs tabular-nums text-c-neutral-4 dark:text-c-neutral-5">
						{formatDuration(project.minutes)}
					</span>
				</div>
				<div class="h-1 w-full rounded-full bg-c-neutral-1 dark:bg-s-dark-3">
					<div
						class="h-1 rounded-full"
						style="
							width: {shareOfTotal(project)}%;
							background-color: {project.color};
						"
					></div>
				</div>
			</div>
		</div>
	{:else}
		<span class="text-xs text-c-neutral-4 dark:text-c-neutral-5">
			{ts.get.timeTracking.no_entries}
		</span>
	{/each}
</div>
