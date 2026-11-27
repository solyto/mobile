<script lang="ts">
	import GoalService from '$lib/services/GoalService';
	import IconTrophy from '$lib/icons/lucide/trophy.svelte';
	import IconCheck from '$lib/icons/lucide/check.svelte';
	import type { Translation } from '$lib/state/Translation.svelte';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getGoals } from '$lib/state/Goals.svelte';
	import { goalProgressText, trackerLabel } from '$lib/helpers/CheckInHelper';
	import TrackerGlyph from '$lib/components/check-in/TrackerGlyph.svelte';
	import GoalBar from '$lib/components/goals/GoalBar.svelte';

	let { ts }: {
		ts: Translation;
	} = $props();

	const checkInData = getCheckInData();
	const goals = getGoals();
	const goalService = new GoalService();

	const shown = $derived(goalService.withActiveTracker(goals.goals, checkInData.activeTrackers));
</script>

{#if shown.length > 0}
	<div>
		<div class="mb-3 flex items-center gap-2">
			<IconTrophy size={15} class="text-c-heading dark:text-c-primary" />
			<span class="text-xs font-semibold tracking-wider text-c-heading uppercase dark:text-c-primary">
				{ts.get.goals.title}
			</span>
		</div>
		<div class="flex flex-col gap-2.5">
			{#each shown as { goal, tracker } (goal.id)}
				<div class="flex items-center gap-2.5">
					<TrackerGlyph {tracker} class="h-3.5 w-3.5 shrink-0 text-c-neutral-4 dark:text-c-neutral-5" />
					<div class="min-w-0 flex-1">
						<div class="mb-0.5 flex items-center justify-between gap-2">
							<span class="truncate text-xs text-c-neutral-6 dark:text-c-neutral-4">{trackerLabel(tracker, ts.get.checkIn)}</span>
							<span class="flex shrink-0 items-center gap-1 text-xs font-medium text-c-neutral-8 dark:text-white">
								{goalProgressText(goal, tracker, goal.progress, ts.get.checkIn)}
								{#if goal.progress.met}
									<IconCheck class="size-3 text-c-success" aria-label={ts.get.checkIn.goal_met} />
								{/if}
							</span>
						</div>
						<GoalBar {goal} {tracker} />
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
