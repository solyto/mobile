<script lang="ts">
	import { getCalendarMonth, getUrlFormat } from '$lib/helpers/DateHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconChevronLeft from '@lucide/svelte/icons/chevron-left';
	import IconChevronRight from '@lucide/svelte/icons/chevron-right';

	const ts = getTranslation();

	let { selectedDate, markedDates, onSelect }: {
		selectedDate: Date;
		markedDates: string[];
		onSelect: (date: Date) => void;
	} = $props();

	const today = new Date();
	const todayKey = getUrlFormat(today);
	const currentMonthIndex = today.getFullYear() * 12 + today.getMonth();

	let viewYear = $state(selectedDate.getFullYear());
	let viewMonth = $state(selectedDate.getMonth());

	let days = $derived(getCalendarMonth(viewYear, viewMonth));
	let selectedKey = $derived(getUrlFormat(selectedDate));

	// Only today and earlier are reachable, so the calendar never advances past
	// the current month and future days stay disabled.
	let canGoNext = $derived(viewYear * 12 + viewMonth < currentMonthIndex);

	function isFuture(date: Date): boolean {
		return getUrlFormat(date) > todayKey;
	}

	function isSelected(date: Date): boolean {
		return getUrlFormat(date) === selectedKey;
	}

	function isMarked(date: Date): boolean {
		return markedDates.includes(getUrlFormat(date));
	}

	function previousMonth(): void {
		if (viewMonth === 0) {
			viewMonth = 11;
			viewYear--;
		} else {
			viewMonth--;
		}
	}

	function nextMonth(): void {
		if (!canGoNext) return;
		if (viewMonth === 11) {
			viewMonth = 0;
			viewYear++;
		} else {
			viewMonth++;
		}
	}

	function monthLabel(index: number): string {
		return ts.get.calendar.months[(index + 1) as keyof typeof ts.get.calendar.months];
	}
</script>

<div class="w-full max-w-sm rounded-lg border border-c-neutral-2 p-3 dark:border-s-dark-3">
	<div class="mb-2 flex items-center justify-between">
		<button
			type="button"
			class="cursor-pointer rounded-sm p-1 text-c-neutral-5 hover:bg-c-neutral-1 dark:text-c-neutral-4 dark:hover:bg-s-dark-3"
			aria-label={monthLabel(viewMonth === 0 ? 11 : viewMonth - 1)}
			onclick={previousMonth}
		>
			<IconChevronLeft size={18} />
		</button>
		<span class="text-sm font-semibold">
			{ts.get.calendar.months[(viewMonth + 1) as keyof typeof ts.get.calendar.months]}
			{viewYear}
		</span>
		<button
			type="button"
			class="cursor-pointer rounded-sm p-1 text-c-neutral-5 hover:bg-c-neutral-1 disabled:cursor-not-allowed disabled:opacity-40 dark:text-c-neutral-4 dark:hover:bg-s-dark-3"
			aria-label={monthLabel((viewMonth + 1) % 12)}
			disabled={!canGoNext}
			onclick={nextMonth}
		>
			<IconChevronRight size={18} />
		</button>
	</div>

	<div class="grid grid-cols-7 gap-1 text-center">
		{#each [1, 2, 3, 4, 5, 6, 7] as weekday (weekday)}
			<span class="text-xs text-c-neutral-4 dark:text-c-neutral-5">
				{ts.get.calendar.weekdays_short[
					weekday as keyof typeof ts.get.calendar.weekdays_short
				]}
			</span>
		{/each}

		{#each days as day (getUrlFormat(day.date))}
			{#if day.is_grayed_out}
				<span></span>
			{:else}
				<button
					type="button"
					disabled={isFuture(day.date)}
					onclick={() => onSelect(day.date)}
					class="relative flex h-8 w-8 items-center justify-center justify-self-center rounded-full text-sm transition-all hover:bg-c-neutral-1 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-s-dark-3"
					class:bg-c-primary={isSelected(day.date)}
					class:text-white={isSelected(day.date)}
					class:font-bold={isSelected(day.date)}
				>
					{day.number}
					{#if isMarked(day.date)}
						<span
							class="absolute bottom-0.5 h-1 w-1 rounded-full bg-c-action"
							aria-hidden="true"
						></span>
					{/if}
				</button>
			{/if}
		{/each}
	</div>
</div>
