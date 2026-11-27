<script lang="ts">
	import type { CheckInTracker } from '$lib/types/check_in';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import type { WeekStart } from '$lib/types/auth';
	import { getCalendarWeeks, getUrlFormat, isDateToday } from '$lib/helpers/DateHelper';
	import { getScoreColor, trackerLabel } from '$lib/helpers/CheckInHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import CheckInIcon from '$lib/components/check-in/overview/CheckInIcon.svelte';
	import TrackerGlyph from '$lib/components/check-in/TrackerGlyph.svelte';

	let { tracker, weekStart }: { tracker: CheckInTracker | 'total' | 'all'; weekStart: WeekStart } = $props();

	const checkInData = getCheckInData();
	const ts = getTranslation();

	const weeks = $derived(getCalendarWeeks(checkInData.historyMonth.year, checkInData.historyMonth.month, weekStart));

	const weekdays = $derived(weeks[0]?.map((day) => day.date.toLocaleDateString(ts.locale, { weekday: 'short' })) ?? []);

	function valueOn(valueTracker: CheckInTracker, date: Date): number | null {
		return checkInData.getValue(valueTracker, getUrlFormat(date));
	}

	function logged(date: Date): CheckInTracker[] {
		return checkInData.activeTrackers.filter((t) => valueOn(t, date) !== null);
	}

	function dotColor(logTracker: CheckInTracker, date: Date): string {
		if (logTracker.type !== 'scale') return 'bg-c-neutral-4 dark:bg-c-neutral-5';
		const value = valueOn(logTracker, date) ?? 0;
		return getScoreColor(checkInData.trackerService.ratingScore(logTracker, value));
	}

	function score(date: Date): number {
		return checkInData.trackerService.totalMean(checkInData.scoredTrackers, checkInData.index, [getUrlFormat(date)]);
	}
</script>

<div class="flex w-full flex-col gap-2">
	<div class="grid grid-cols-7 gap-1 sm:gap-2">
		{#each weekdays as weekday (weekday)}
			<span class="text-center text-xs text-c-neutral-5 dark:text-c-neutral-4">{weekday}</span>
		{/each}
	</div>
	{#each weeks as week (week[0].date.getTime())}
		<div class="grid grid-cols-7 gap-1 sm:gap-2">
			{#each week as day (day.date.getTime())}
				{#if day.is_grayed_out}
					<div class="h-14 sm:aspect-[3/2] sm:h-auto"></div>
				{:else}
					<a
						href={resolve(urls.checkInDate, { date: getUrlFormat(day.date) })}
						class="relative flex min-h-14 flex-col items-center justify-center rounded-lg bg-c-bg-surface shadow-xs transition-all hover:bg-c-neutral sm:aspect-[3/2] sm:min-h-20 dark:hover:bg-s-dark-3"
						class:pt-5={tracker === 'all'}
						class:pb-1={tracker === 'all'}
						class:max-sm:pt-4={tracker !== 'all'}
						class:max-sm:pb-1={tracker !== 'all'}
						class:ring-2={isDateToday(day.date)}
						class:ring-c-btn={isDateToday(day.date)}
					>
						<span class="absolute top-1 left-1.5 text-xs text-c-neutral-5 tabular-nums dark:text-c-neutral-4">{day.number}</span>
						{#if tracker === 'all'}
							<span class="flex flex-wrap items-center justify-center gap-1 px-1 sm:hidden">
								{#each logged(day.date) as logTracker (logTracker.id)}
									<span class="size-1.5 rounded-full {dotColor(logTracker, day.date)}" title={trackerLabel(logTracker, ts.get.checkIn)}></span>
								{/each}
							</span>
							<span class="flex flex-wrap items-center justify-center gap-1 px-1 max-sm:hidden">
								{#each logged(day.date) as logTracker (logTracker.id)}
									<!-- Fixed 20px slots: a scaled icon still takes its full size in the layout otherwise. -->
									<span class="flex h-5 items-center justify-center" class:w-5={logTracker.type !== 'count'} title={trackerLabel(logTracker, ts.get.checkIn)}>
										{#if logTracker.type === 'count'}
											<span class="text-xs font-semibold tabular-nums">{valueOn(logTracker, day.date)}</span>
										{:else if logTracker.type === 'yes_no'}
											<TrackerGlyph tracker={logTracker} class="size-5 text-c-neutral-5 dark:text-c-neutral-4" />
										{:else}
											<span class="scale-50">
												<CheckInIcon tracker={logTracker} value={valueOn(logTracker, day.date)} />
											</span>
										{/if}
									</span>
								{/each}
							</span>
						{:else if tracker !== 'total'}
							{#if tracker.type === 'count' && valueOn(tracker, day.date) !== null}
								<span class="sm:hidden text-sm font-semibold tabular-nums">{valueOn(tracker, day.date)}</span>
							{:else if tracker.type === 'yes_no' && valueOn(tracker, day.date) !== null}
								<TrackerGlyph {tracker} class="size-6 text-c-neutral-5 sm:hidden dark:text-c-neutral-4" />
							{:else}
								<span class="flex size-6 items-center justify-center sm:hidden">
									<span class="scale-60">
										<CheckInIcon {tracker} value={valueOn(tracker, day.date)} />
									</span>
								</span>
							{/if}
							<span class="max-sm:hidden">
								<CheckInIcon {tracker} value={valueOn(tracker, day.date)} />
							</span>
						{:else if !isNaN(score(day.date))}
							<span class="flex flex-col items-center gap-1">
								<span class="text-sm font-semibold tabular-nums">{score(day.date).toFixed(1)}</span>
								<span class="h-1 w-6 rounded-full {getScoreColor(score(day.date))}"></span>
							</span>
						{/if}
					</a>
				{/if}
			{/each}
		</div>
	{/each}
</div>
