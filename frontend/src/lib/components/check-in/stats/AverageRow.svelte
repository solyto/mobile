<script lang="ts">
	import type { CheckInTracker } from '$lib/types/check_in';
	import { formatScore, getScoreColor, scoreWidth } from '$lib/helpers/CheckInHelper';
	import TrackerGlyph from '$lib/components/check-in/TrackerGlyph.svelte';

	let {
		label,
		value,
		tracker
	}: {
		label: string;
		value: number;
		tracker: CheckInTracker;
	} = $props();
</script>

<div class="flex items-center gap-3">
	<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-c-neutral dark:bg-s-dark-3">
		<TrackerGlyph {tracker} class="h-4 w-4 text-c-heading dark:text-c-primary" />
	</div>
	<div class="min-w-0 flex-1">
		<div class="mb-1 flex items-center justify-between">
			<p class="text-sm font-medium text-c-neutral-7 dark:text-c-neutral-3">
				{label}
			</p>
			<p class="text-sm font-semibold text-c-neutral-9 dark:text-white">
				{formatScore(value)}
			</p>
		</div>
		<div class="h-2 overflow-hidden rounded-full bg-c-neutral-1 dark:bg-s-dark-3">
			<div
				class="h-full rounded-full transition-all duration-300 {getScoreColor(value)}"
				style="width: {scoreWidth(value)}%"
			></div>
		</div>
	</div>
</div>
