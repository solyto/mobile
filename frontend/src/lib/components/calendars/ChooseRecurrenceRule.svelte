<script lang="ts">
	import { slide } from 'svelte/transition';
	import Select from '$lib/components/forms/Select.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import DateInput from '$lib/components/forms/DateInput.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import { getUrlFormat } from '$lib/helpers/DateHelper';
	import { pluralize } from '$lib/helpers/FormatHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import RecurrenceRuleService, { INTERVAL_UNITS, MAX_INTERVAL, WEEKDAYS } from '$lib/services/RecurrenceRuleService';
	import type {
		IntervalUnit,
		MonthlyOrdinal,
		RecurrenceEnd,
		RecurrenceSelection,
		RecurrenceType,
		Weekday
	} from '$lib/services/RecurrenceRuleService';

	let { selection = $bindable(), startDate }: {
		selection: RecurrenceSelection;
		startDate: Date;
	} = $props();

	const ts = getTranslation();
	const recurrenceRuleService = new RecurrenceRuleService();
	const ORDINALS: MonthlyOrdinal[] = [1, 2, 3, 4];
	const CUSTOM = 'custom';

	let lastValidUntil = selection.until;
	let intervalInput = $state<number | null>(selection.interval);
	let custom = $state(selection.interval > 1);

	function typeOptions(): { label: string; value: RecurrenceType | typeof CUSTOM }[] {
		return [
			{ label: ts.get.calendar.recurrence_daily, value: 'daily' },
			{ label: ts.get.calendar.recurrence_weekly, value: 'weekly' },
			{ label: ts.get.calendar.recurrence_monthly_date, value: 'monthly_date' },
			{ label: ts.get.calendar.recurrence_monthly_weekday, value: 'monthly_weekday' },
			{ label: ts.get.calendar.recurrence_yearly, value: 'yearly' },
			{ label: ts.get.calendar.recurrence_custom, value: CUSTOM }
		];
	}

	function unitOptions(): { label: string; value: RecurrenceType }[] {
		const calendar = ts.get.calendar;
		const months = unitLabel('month');

		return [
			{ label: unitLabel('day'), value: 'daily' },
			{ label: unitLabel('week'), value: 'weekly' },
			{ label: `${months} ${calendar.recurrence_unit_on_this_date}`, value: 'monthly_date' },
			{ label: `${months} ${calendar.recurrence_unit_on_weekday}`, value: 'monthly_weekday' },
			{ label: unitLabel('year'), value: 'yearly' }
		];
	}

	function everyLabel(): string {
		return ts.get.calendar.recurrence_every_by_unit?.[INTERVAL_UNITS[selection.type]] ?? ts.get.calendar.recurrence_every;
	}

	function unitLabel(unit: IntervalUnit): string {
		const calendar = ts.get.calendar;
		const labels: Record<IntervalUnit, [string, string]> = {
			day: [calendar.recurrence_unit_day_singular, calendar.recurrence_unit_day_plural],
			week: [calendar.recurrence_unit_week_singular, calendar.recurrence_unit_week_plural],
			month: [calendar.recurrence_unit_month_singular, calendar.recurrence_unit_month_plural],
			year: [calendar.recurrence_unit_year_singular, calendar.recurrence_unit_year_plural]
		};

		return pluralize(selection.interval, ...labels[unit]);
	}

	function ordinalOptions(): { label: string; value: string }[] {
		const byWeekday = ts.get.calendar.recurrence_ordinals_by_weekday?.[weekdayNumber(selection.monthlyWeekday)];
		return ORDINALS.map((ordinal) => ({
			label: byWeekday?.[ordinal] ?? ts.get.calendar.recurrence_ordinals[ordinal],
			value: String(ordinal)
		}));
	}

	function weekdayOptions(): { label: string; value: Weekday }[] {
		return WEEKDAYS.map((day) => ({
			label:
				ts.get.calendar.recurrence_weekdays?.[weekdayNumber(day)] ??
				ts.get.calendar.weekdays[weekdayNumber(day)],
			value: day
		}));
	}

	function endOptions(): { label: string; value: RecurrenceEnd }[] {
		const options: { label: string; value: RecurrenceEnd }[] = [
			{ label: ts.get.calendar.recurrence_ends_never, value: 'never' },
			{ label: ts.get.calendar.recurrence_ends_on_date, value: 'until' }
		];

		if (selection.count !== null) {
			options.push({
				label: ts.get.calendar.recurrence_ends_after_count.replace('%s', String(selection.count)),
				value: 'count'
			});
		}

		return options;
	}

	function weekdayNumber(day: Weekday): number {
		return WEEKDAYS.indexOf(day) + 1;
	}

	function isWeekdayChecked(day: Weekday): boolean {
		return recurrenceRuleService.effectiveWeekdays(selection, startDate).includes(day);
	}

	function toggleWeekday(day: Weekday): void {
		const current = recurrenceRuleService.effectiveWeekdays(selection, startDate);
		selection.weekdays = current.includes(day)
			? current.filter((weekday) => weekday !== day)
			: [...current, day];
	}

	function setType(value: string): void {
		if (value === CUSTOM) {
			custom = true;
			return;
		}

		custom = false;
		selection.type = value as RecurrenceType;
		selection.interval = 1;
		intervalInput = 1;
	}

	function setUnit(value: string): void {
		selection.type = value as RecurrenceType;
	}

	function setOrdinal(value: string): void {
		selection.monthlyOrdinal = Number(value) as MonthlyOrdinal;
	}

	function setMonthlyWeekday(value: string): void {
		selection.monthlyWeekday = value as Weekday;
	}

	function setEnd(value: string): void {
		selection.end = value as RecurrenceEnd;

		if (selection.end === 'until' && !selection.until) {
			selection.until = recurrenceRuleService.defaultUntil(selection, startDate);
			lastValidUntil = selection.until;
		}
	}

	function rememberInterval(): void {
		selection.interval = recurrenceRuleService.intervalWithinBounds(intervalInput, selection.interval);
	}

	function restoreInterval(): void {
		intervalInput = selection.interval;
	}

	function rememberUntil(): void {
		if (selection.until) {
			lastValidUntil = selection.until;
		}
	}

	function restoreUntil(): void {
		selection.until = recurrenceRuleService.untilNotBeforeStart(selection.until || lastValidUntil, startDate);
		lastValidUntil = selection.until;
	}
</script>

<div class="flex w-full flex-col gap-2" transition:slide>
	<Select value={custom ? CUSTOM : selection.type} options={typeOptions()} onchange={setType} />

	{#if custom}
		<div class="flex items-center gap-2">
			<span class="shrink-0 text-sm">{everyLabel()}</span>
			<div class="w-20 shrink-0">
				<NumberInput
					bind:value={intervalInput}
					min={1}
					max={MAX_INTERVAL}
					step={1}
					oninput={rememberInterval}
					onblur={restoreInterval}
					class="h-10"
				/>
			</div>
			<div class="min-w-0 flex-1">
				<Select value={selection.type} options={unitOptions()} onchange={setUnit} />
			</div>
		</div>
	{/if}

	{#if selection.type === 'weekly'}
		<div class="mt-1 flex flex-wrap gap-x-4 gap-y-2">
			{#each WEEKDAYS as day (day)}
				<div class="flex items-center gap-2">
					<Checkbox isChecked={isWeekdayChecked(day)} onchange={() => toggleWeekday(day)} />
					<span class="text-sm">{ts.get.calendar.weekdays_short[weekdayNumber(day)]}</span>
				</div>
			{/each}
		</div>
	{/if}

	{#if selection.type === 'monthly_weekday'}
		<div class="mt-1 flex items-center gap-2">
			<span class="text-sm">{ts.get.calendar.recurrence_on_the}</span>
			<Select value={String(selection.monthlyOrdinal)} options={ordinalOptions()} onchange={setOrdinal} />
			<Select value={selection.monthlyWeekday} options={weekdayOptions()} onchange={setMonthlyWeekday} />
		</div>
	{/if}

	<div class="flex flex-wrap items-center gap-2">
		<div class="min-w-28 flex-1">
			<Select
				value={selection.end}
				options={endOptions()}
				onchange={setEnd}
				ariaLabel={ts.get.calendar.recurrence_ends}
			/>
		</div>
		{#if selection.end === 'until'}
			<div class="min-w-36 flex-1">
				<DateInput
					bind:value={selection.until}
					min={getUrlFormat(startDate)}
					oninput={rememberUntil}
					onblur={restoreUntil}
					class="h-10"
				/>
			</div>
		{/if}
	</div>
</div>
