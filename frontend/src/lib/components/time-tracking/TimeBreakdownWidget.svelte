<script lang="ts">
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	interface Breakdown {
		title: string;
		color: string;
		minutes: number;
	}

	let { title, breakdown, total }: { title: string; breakdown: Breakdown[]; total: number } =
		$props();

	const tt = getTimeTracking();
	const ts = getTranslation();
</script>

<div class="flex flex-col gap-3 rounded-lg bg-c-bg-surface p-4 shadow-sm lg:col-span-1">
	<span class="text-sm font-bold text-c-neutral-5 dark:text-c-neutral-4">{title}</span>
	<div class="flex flex-col gap-2.5">
		<div class="flex flex-row items-center justify-between">
			<span class="text-xs font-medium text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.timeTracking.total_time}
			</span>
			<span class="text-xs font-medium tabular-nums text-c-primary">
				{tt.formatDuration(total)}
			</span>
		</div>
		{#each breakdown as category (category.title)}
			<div class="flex flex-col gap-0.5">
				<div class="flex flex-row items-center justify-between">
					<div class="flex flex-row items-center gap-1.5">
						<div class="h-2.5 w-2.5 shrink-0 rounded-full" style="background-color: {category.color}"></div>
						<span class="truncate text-xs">{category.title}</span>
					</div>
					<span class="text-xs tabular-nums text-c-neutral-4 dark:text-c-neutral-5">
						{tt.formatDuration(category.minutes)}
					</span>
				</div>
				<div class="h-1 w-full rounded-full bg-c-neutral-1 dark:bg-s-dark-3">
					<div
						class="h-1 rounded-full"
						style="width: {total > 0 ? (category.minutes / total) * 100 : 0}%; background-color: {category.color}"
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
