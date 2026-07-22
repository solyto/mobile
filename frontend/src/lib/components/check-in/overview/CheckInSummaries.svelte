<script lang="ts">
	import type { CheckIn, CheckInType } from '$lib/types/check_in';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getUrlFormat, getISODateInfo } from '$lib/helpers/DateHelper';
	import { buildDaySummary, buildPeriodSummary, getDayLabel } from '$lib/helpers/CheckInSummaryHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { SvelteDate } from 'svelte/reactivity';

	let { dates, trackers } = $props<{
		dates: Date[];
		trackers: CheckInType[];
	}>();

	interface SummaryRow {
		key: string;
		label: string;
		date?: string;
		text: string;
	}

	const checkInData = getCheckInData();
	const ts = getTranslation();
	const auth = getAuth();

	const daySummaries = $derived(buildDaySummaryRows());
	const periodSummaries = $derived(buildWeekAndMonthPeriodSummaryRows());
	const hasAnything = $derived(daySummaries.length > 0 || periodSummaries.length > 0);

	function getCheckInsForDates(ds: Date[]): CheckIn[] {
		return ds
			.map((d) => checkInData.getDayData(getUrlFormat(new SvelteDate(d))))
			.filter((c): c is CheckIn => c !== null);
	}

	function buildDaySummaryRows(): SummaryRow[] {
		const p = ts.get.checkInSummary;
		return dates
			.map((date: Date) => {
				const key = getUrlFormat(new SvelteDate(date));
				const checkIn = checkInData.getDayData(key);
				if (!checkIn) return null;
				const text = buildDaySummary(checkIn, trackers, p);
				if (!text) return null;
				const dayLabel = getDayLabel(date, p);
				const shortDate = auth.getDateWithoutYearInUserPreferredFormat(date);
				return { key, label: dayLabel, date: shortDate, text };
			})
			.filter((s: SummaryRow | null): s is SummaryRow => s !== null)
			.slice(0, 7);
	}

	function buildWeekAndMonthPeriodSummaryRows(): SummaryRow[] {
		const p = ts.get.checkInSummary;
		const today = new SvelteDate();
		const rows: SummaryRow[] = [];

		const thisWeek = getISODateInfo(today);
		const lastWeekDate = new SvelteDate(today);
		lastWeekDate.setDate(today.getDate() - 7);
		const lastWeek = getISODateInfo(lastWeekDate);

		for (const { info, label } of [
			{ info: thisWeek, label: p.period_this_week },
			{ info: lastWeek, label: p.period_last_week }
		]) {
			const weekDates = dates.filter((d: Date) => {
				const i = getISODateInfo(d);
				return i.week === info.week && i.year === info.year;
			});
			const checkIns = getCheckInsForDates(weekDates);
			if (checkIns.length < 2) continue;
			const text = buildPeriodSummary(checkIns, trackers, p);
			if (text) rows.push({ key: label, label, text });
		}

		const thisMonth = today.getMonth();
		const thisYear = today.getFullYear();
		const lastMonthDate = new SvelteDate(thisYear, thisMonth - 1, 1);

		for (const { month, year, label } of [
			{ month: thisMonth, year: thisYear, label: p.period_this_month },
			{ month: lastMonthDate.getMonth(), year: lastMonthDate.getFullYear(), label: p.period_last_month }
		]) {
			const monthDates = dates.filter(
				(d: Date) => d.getMonth() === month && d.getFullYear() === year
			);
			const checkIns = getCheckInsForDates(monthDates);
			if (checkIns.length < 2) continue;
			const text = buildPeriodSummary(checkIns, trackers, p);
			if (text) rows.push({ key: label, label, text });
		}

		return rows;
	}
</script>

{#if hasAnything}
	<div class="max-2xl:px-4 border-t-2 pt-6 border-c-neutral-1 dark:border-s-dark">
		<div class="flex flex-col">
			{#if daySummaries.length > 0}
				<div class="flex flex-col">
					{#each daySummaries as { key, label, date, text } (key)}
						<div class="flex flex-col py-2 sm:flex-row gap-2 sm:gap-4">
							<div class="w-full flex md:flex-col max-md:items-center max-md:justify-between shrink-0 md:w-28">
								<span class="text-lg md:text-sm font-semibold text-c-heading dark:text-c-primary">{label}</span>
								{#if date}
									<span class="block text-sm md:text-xs text-c-neutral-5 dark:text-c-neutral-4">{date}</span>
								{/if}
							</div>
							<span class="text-sm leading-relaxed text-c-neutral-8 dark:text-c-neutral-2">{text}</span>
						</div>
					{/each}
				</div>
			{/if}

			{#if periodSummaries.length > 0}
				<div
					class="flex flex-col"
					class:mt-4={daySummaries.length > 0}
					class:pt-4={daySummaries.length > 0}
					class:border-t-2={daySummaries.length > 0}
					class:border-c-neutral-1={daySummaries.length > 0}
					class:dark:border-s-dark={daySummaries.length > 0}
				>
					{#each periodSummaries as { key, label, text } (key)}
						<div class="flex flex-col gap-0.5 py-2">
							<span class="w-28 shrink-0 text-lg md:text-sm font-semibold text-c-heading dark:text-c-primary">{label}</span>
							<span class="text-sm leading-relaxed text-c-neutral-8 dark:text-c-neutral-2">{text}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
