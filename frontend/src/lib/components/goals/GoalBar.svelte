<script lang="ts">
	import type { Goal } from '$lib/types/goal';
	import type { CheckInTracker } from '$lib/types/check_in';
	import GoalService from '$lib/services/GoalService';

	let { goal, tracker, size = 'sm' }: { goal: Goal; tracker: CheckInTracker; size?: 'sm' | 'md' } = $props();

	const goalService = new GoalService();
</script>

{#if goalService.isAverage(tracker.type)}
	<div class="relative w-full" class:h-2.5={size === 'sm'} class:h-3={size === 'md'}>
		<div
			class="absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full bg-c-neutral-1 dark:bg-s-dark-3"
			class:h-1={size === 'sm'}
			class:h-1.5={size === 'md'}
		></div>
		<div
			class="absolute top-0 h-full w-0.5 -translate-x-1/2 rounded-full bg-c-neutral-4 dark:bg-c-neutral-5"
			style="left: {goalService.scalePosition(goal.target) * 100}%"
		></div>
		{#if goal.progress.current !== null}
			<div
				class="absolute top-0 -translate-x-1/2 rounded-full transition-all duration-300"
				class:size-2.5={size === 'sm'}
				class:size-3={size === 'md'}
				class:bg-c-success={goal.progress.met}
				class:bg-c-danger={!goal.progress.met}
				style="left: {goalService.scalePosition(goal.progress.current) * 100}%"
			></div>
		{/if}
	</div>
{:else}
	<div class="w-full rounded-full bg-c-neutral-1 dark:bg-s-dark-3" class:h-1={size === 'sm'} class:h-1.5={size === 'md'}>
		<div
			class="h-full rounded-full transition-all duration-300"
			class:bg-c-success={goal.comparison === 'at_least' && goal.progress.met}
			class:bg-c-primary={goal.comparison === 'at_least' && !goal.progress.met}
			class:bg-c-neutral-4={goal.comparison === 'at_most' && goal.progress.met}
			class:bg-c-danger={goal.comparison === 'at_most' && !goal.progress.met}
			style="width: {goalService.ratio(goal) * 100}%"
		></div>
	</div>
{/if}
