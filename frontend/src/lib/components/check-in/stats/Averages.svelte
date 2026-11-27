<script lang="ts">
	import type { CheckInTracker } from '$lib/types/check_in';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { formatScore, scoreWidth, trackerLabel } from '$lib/helpers/CheckInHelper';
	import AverageRow from '$lib/components/check-in/stats/AverageRow.svelte';

	let { dates }: { dates: string[] } = $props();

	const checkInData = getCheckInData();
	const ts = getTranslation();

	const totalMean = $derived(checkInData.trackerService.totalMean(checkInData.scoredTrackers, checkInData.index, dates));

	function mean(tracker: CheckInTracker): number {
		return checkInData.trackerService.mean(tracker, checkInData.index, dates);
	}
</script>

<div class="max-2xl:px-4 pb-8 border-c-neutral-1 dark:border-s-dark">
	<div class="flex flex-col gap-3">
		{#each checkInData.scoredTrackers as tracker (tracker.id)}
			<AverageRow label={trackerLabel(tracker, ts.get.checkIn)} value={mean(tracker)} {tracker} />
		{/each}
		<div class="mt-1 border-t border-c-neutral-1 pt-3 dark:border-s-dark-3">
			<div class="flex items-center gap-3">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-c-primary/10 dark:bg-c-primary/20"
				>
					<span class="text-sm font-bold text-c-primary">∑</span>
				</div>
				<div class="min-w-0 flex-1">
					<div class="mb-1 flex items-center justify-between">
						<p class="text-base font-semibold text-c-neutral-9 dark:text-white">
							{ts.get.checkIn.total}
						</p>
						<p class="text-base font-bold text-c-primary">
							{formatScore(totalMean)}
						</p>
					</div>
					<div class="h-2 overflow-hidden rounded-full bg-c-neutral-1 dark:bg-s-dark-3">
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
