<script lang="ts">
	import { onMount } from 'svelte';
	import { blur } from 'svelte/transition';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { Translation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import IconTimer from '@lucide/svelte/icons/timer';
	import TimeTrackingGroupingService from '$lib/services/TimeTrackingGroupingService';
	import { getStartOfWeek } from '$lib/helpers/DateHelper';
	import type { WeekStart } from '$lib/types/auth';

	const tt = getTimeTracking();
	const loadingIndicator = getLoadingIndicator();
	const groupingService = new TimeTrackingGroupingService();

	let { ts, weekStart }: {
		ts: Translation;
		weekStart: WeekStart;
	} = $props();

	let loaded = $state(false);

	let weekBreakdown = $derived.by(() => {
		const startOfWeek = getStartOfWeek(new Date(), weekStart);
		const filtered = tt.entries.filter(
			(e) => e.stopped_at !== null && new Date(e.started_at) >= startOfWeek
		);
		return groupingService.groupByProject(filtered, tt.projects);
	});

	let weekTotal = $derived(weekBreakdown.reduce((s, c) => s + c.minutes, 0));

	onMount(async () => {
		loadingIndicator.start();
		await tt.load();
		loadingIndicator.stop();
		loaded = true;
	});
</script>

{#if loaded && weekBreakdown.length > 0}
	<div in:blur>
		<div class="mb-3 flex items-center gap-2">
			<IconTimer size={15} class="text-c-heading dark:text-c-primary" />
			<span class="text-xs font-semibold tracking-wider text-c-heading uppercase dark:text-c-primary">
				{ts.get.nav.timeTracking}
			</span>
		</div>
		<div class="flex flex-col gap-2.5">
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-c-neutral-5 dark:text-c-neutral-4">
					{ts.get.timeTracking.this_week}
				</span>
				<span class="text-xs font-medium tabular-nums text-c-primary">
					{tt.formatDuration(weekTotal)}
				</span>
			</div>
			{#each weekBreakdown as category (category.projectId)}
				<div class="flex flex-col gap-0.5">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-1.5">
							<div
								class="h-2.5 w-2.5 shrink-0 rounded-full"
								style="background-color: {category.color}"
							></div>
							<span class="truncate text-xs">{category.title}</span>
						</div>
						<span class="text-xs tabular-nums text-c-neutral-4 dark:text-c-neutral-5">
							{tt.formatDuration(category.minutes)}
						</span>
					</div>
					<div class="h-1 w-full rounded-full bg-c-neutral-1 dark:bg-s-dark-3">
						<div
							class="h-1 rounded-full"
							style="width: {weekTotal > 0 ? (category.minutes / weekTotal) * 100 : 0}%; background-color: {category.color}"
						></div>
					</div>
				</div>
			{:else}
				<span class="text-xs text-c-neutral-4 dark:text-c-neutral-5">
					{ts.get.timeTracking.no_entries}
				</span>
			{/each}
		</div>
	</div>
{/if}
