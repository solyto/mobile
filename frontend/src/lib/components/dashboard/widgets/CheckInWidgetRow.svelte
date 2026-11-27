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

<div class="flex items-center gap-2.5">
	<TrackerGlyph {tracker} class="h-3.5 w-3.5 shrink-0 text-c-neutral-4 dark:text-c-neutral-5" />
	<div class="min-w-0 flex-1">
		<div class="mb-0.5 flex items-center justify-between">
			<span class="text-xs text-c-neutral-6 dark:text-c-neutral-4">
				{label}
			</span>
			<span class="text-xs font-medium text-c-neutral-8 dark:text-white">
				{formatScore(value)}
			</span>
		</div>
		<div class="h-1 overflow-hidden rounded-full bg-c-neutral-1 dark:bg-s-dark-3">
			<div
				class="h-full rounded-full transition-all duration-300 {getScoreColor(value)}"
				style="width: {scoreWidth(value)}%"
			></div>
		</div>
	</div>
</div>
