<script lang="ts">
	import IconActivity from '$lib/icons/lucide/activity.svelte';
	import type { Translation } from '$lib/state/Translation.svelte';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { formatScore, scoreWidth, trackerLabel } from '$lib/helpers/CheckInHelper';
	import CheckInWidgetRow from '$lib/components/dashboard/widgets/CheckInWidgetRow.svelte';

	let { ts }: {
		ts: Translation;
	} = $props();

	const checkInData = getCheckInData();
	const dates = $derived([...checkInData.index.keys()]);
	const totalMean = $derived(checkInData.trackerService.totalMean(checkInData.scoredTrackers, checkInData.index, dates));
</script>

{#if checkInData.loaded && !isNaN(totalMean)}
	<div>
		<div class="mb-3 flex items-center gap-2">
			<IconActivity size={15} class="text-c-heading dark:text-c-primary" />
			<span class="text-xs font-semibold tracking-wider text-c-heading uppercase dark:text-c-primary">
				{ts.get.nav.checkIn}
			</span>
		</div>
		<div class="flex flex-col gap-2.5">
			{#each checkInData.scoredTrackers as tracker (tracker.id)}
				<CheckInWidgetRow
					label={trackerLabel(tracker, ts.get.checkIn)}
					value={checkInData.trackerService.mean(tracker, checkInData.index, dates)}
					{tracker}
				/>
			{/each}
			<div class="mt-1 border-t border-c-neutral-1 pt-2 dark:border-s-dark-3">
				<div class="flex items-center gap-2.5">
					<span class="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-xs font-bold text-c-primary">∑</span>
					<div class="min-w-0 flex-1">
						<div class="mb-0.5 flex items-center justify-between">
							<span class="text-xs font-medium text-c-neutral-7 dark:text-c-neutral-3">
								{ts.get.checkIn.total}
							</span>
							<span class="text-xs font-semibold text-c-primary">
								{formatScore(totalMean)}
							</span>
						</div>
						<div class="h-1 overflow-hidden rounded-full bg-c-neutral-1 dark:bg-s-dark-3">
							<div
								class="h-full rounded-full bg-c-primary transition-all duration-300"
								style="width: {scoreWidth(totalMean)}%"
							></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}