<script lang="ts">
	import { slide } from 'svelte/transition';
	import Select from '$lib/components/forms/Select.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import RecurrenceRuleService, { WEEKDAYS } from '$lib/services/RecurrenceRuleService';
	import type {
		MonthlyOrdinal,
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

	function typeOptions(): { label: string; value: RecurrenceType }[] {
		return [
			{ label: ts.get.calendar.recurrence_daily, value: 'daily' },
			{ label: ts.get.calendar.recurrence_weekly, value: 'weekly' },
			{ label: ts.get.calendar.recurrence_monthly_date, value: 'monthly_date' },
			{ label: ts.get.calendar.recurrence_monthly_weekday, value: 'monthly_weekday' },
			{ label: ts.get.calendar.recurrence_yearly, value: 'yearly' }
		];
	}

	function ordinalOptions(): { label: string; value: string }[] {
		return ORDINALS.map((ordinal) => ({
			label: ts.get.calendar.recurrence_ordinals[ordinal],
			value: String(ordinal)
		}));
	}

	function weekdayOptions(): { label: string; value: Weekday }[] {
		return WEEKDAYS.map((day) => ({ label: ts.get.calendar.weekdays[weekdayNumber(day)], value: day }));
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
		selection.type = value as RecurrenceType;
	}

	function setOrdinal(value: string): void {
		selection.monthlyOrdinal = Number(value) as MonthlyOrdinal;
	}

	function setMonthlyWeekday(value: string): void {
		selection.monthlyWeekday = value as Weekday;
	}
</script>

<div class="flex w-full flex-col gap-2 p-1" transition:slide>
	<Select value={selection.type} options={typeOptions()} onchange={setType} />

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
</div>
