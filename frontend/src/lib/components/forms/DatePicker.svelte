<!--suppress CssUnusedSymbol -->
<script lang="ts">
	import { DatePicker } from '@svelte-plugins/datepicker';
	import type { WeekStart } from '$lib/types/auth';

	let {
		isOpen = $bindable(),
		startDate = $bindable(),
		weekStart,
		onChange
	}: {
		isOpen: boolean;
		startDate: Date | null;
		weekStart: WeekStart;
		onChange: () => void | Promise<void>;
	} = $props();
</script>

<DatePicker
	onDateChange={onChange}
	enableFutureDates={true}
	enablePastDates={true}
	startOfWeek={weekStart === 'sunday' ? 0 : 1}
	includeFont={false}
	bind:isOpen
	bind:startDate
	theme="custom-datepicker"
>
	<input type="text" class="hidden" bind:value={startDate} />
</DatePicker>

<style>
	:global(.datepicker[data-picker-theme='custom-datepicker']) {
		--datepicker-container-left: -160px;
		--datepicker-container-top: 10px;
		--datepicker-container-background: var(--color-c-bg-modal);
		--datepicker-container-border: 1px solid var(--color-c-neutral-2);
		--datepicker-color: var(--color-c-heading);
		--datepicker-calendar-header-color: var(--color-c-heading);
		--datepicker-calendar-header-text-color: var(--color-c-neutral-7);
		--datepicker-calendar-header-text-font-size: 1rem;
		--datepicker-calendar-header-text-font-weight: 600;
		--datepicker-calendar-header-month-nav-background: transparent;
		--datepicker-calendar-header-month-nav-color: var(--color-c-heading);
		--datepicker-calendar-dow-color: var(--color-c-neutral-4);
		--datepicker-calendar-day-color: var(--color-c-neutral-7);
		--datepicker-calendar-day-background-hover: var(--color-c-neutral-1);
		--datepicker-calendar-day-color-hover: var(--color-c-neutral-7);
		--datepicker-calendar-header-month-nav-background: transparent;
		--datepicker-calendar-header-month-nav-background-hover: var(--color-c-neutral-1);
		--datepicker-calendar-today-background: transparent;
		--datepicker-state-hover: var(--color-c-neutral-1);
		--datepicker-state-active: var(--color-c-action);
		--datepicker-calendar-range-selected-background: var(--color-c-action);
		--datepicker-calendar-range-selected-color: #ffffff;
		--datepicker-calendar-range-included-background: var(--color-c-neutral-1);
	}

	:global(.datepicker[data-picker-theme='custom-datepicker'] .calendars-container.show) {
		animation: pop-in 150ms ease-out;
	}

	:global(:is(.dark, .theme-dark) .datepicker[data-picker-theme='custom-datepicker']) {
		--datepicker-calendar-header-text-color: #ffffff;
		--datepicker-calendar-day-color: #ffffff;
		--datepicker-calendar-day-color-hover: #ffffff;
		--datepicker-calendar-header-month-nav-icon-next-filter: invert(1);
		--datepicker-calendar-header-month-nav-icon-prev-filter: invert(1);
		--datepicker-calendar-header-year-nav-icon-next-filter: invert(1);
		--datepicker-calendar-header-year-nav-icon-prev-filter: invert(1);
	}
</style>
