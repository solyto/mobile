<script lang="ts">
	import { slide } from 'svelte/transition';
	import Select from '$lib/components/forms/Select.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import type { SvelteDate } from 'svelte/reactivity';

	let { recurrenceRule = $bindable(), startDate } = $props<{
		recurrenceRule: string | null;
		startDate: SvelteDate;
	}>();

	let type = $state<string>('daily');
	let monthlyWeekdayFrequency = $state<string>('1');
	let monthlyWeekdayDay = $state<string>('MO');
	let weeklyMonday = $state<boolean>(false);
	let weeklyTuesday = $state<boolean>(false);
	let weeklyWednesday = $state<boolean>(false);
	let weeklyThursday = $state<boolean>(false);
	let weeklyFriday = $state<boolean>(false);
	let weeklySaturday = $state<boolean>(false);
	let weeklySunday = $state<boolean>(false);

	function initializeFromRule(rule: string) {
		if (rule.includes('FREQ=YEARLY')) {
			type = 'yearly';
		} else if (rule.includes('FREQ=MONTHLY') && rule.includes('BYSETPOS')) {
			type = 'monthly_weekday';
			const bydayMatch = rule.match(/BYDAY=([^;]+)/);
			const bysetposMatch = rule.match(/BYSETPOS=([^;]+)/);
			if (bydayMatch) monthlyWeekdayDay = bydayMatch[1];
			if (bysetposMatch) monthlyWeekdayFrequency = bysetposMatch[1];
		} else if (rule.includes('FREQ=MONTHLY')) {
			type = 'monthly_date';
		} else if (rule.includes('FREQ=WEEKLY')) {
			type = 'weekly';
			const bydayMatch = rule.match(/BYDAY=([^;]+)/);
			if (bydayMatch) {
				const days = bydayMatch[1].split(',');
				weeklyMonday = days.includes('MO');
				weeklyTuesday = days.includes('TU');
				weeklyWednesday = days.includes('WE');
				weeklyThursday = days.includes('TH');
				weeklyFriday = days.includes('FR');
				weeklySaturday = days.includes('SA');
				weeklySunday = days.includes('SU');
			}
		} else {
			type = 'daily';
		}
	}

	let initializedFromRule = false;
	if (recurrenceRule) {
		initializeFromRule(recurrenceRule);
		initializedFromRule = true;
	}

	const typeOptions: { label: string; value: string }[] = [
		{ label: 'Every Day', value: 'daily' },
		{ label: 'Weekly', value: 'weekly' },
		{ label: 'Monthly on this date', value: 'monthly_date' },
		{ label: 'Monthly on weekday', value: 'monthly_weekday' },
		{ label: 'Every year', value: 'yearly' }
	];

	const everyXOptions: { label: string; value: string }[] = [
		{ label: '1st', value: '1' },
		{ label: '2nd', value: '2' },
		{ label: '3rd', value: '3' },
		{ label: '4th', value: '4' }
	];

	const dayOptions: { label: string; value: string }[] = [
		{ label: 'Monday', value: 'MO' },
		{ label: 'Tuesday', value: 'TU' },
		{ label: 'Wednesday', value: 'WE' },
		{ label: 'Thursday', value: 'TH' },
		{ label: 'Friday', value: 'FR' },
		{ label: 'Saturday', value: 'SA' },
		{ label: 'Sunday', value: 'SU' }
	];

	const weekdayMap: Record<number, string> = {
		0: 'SU',
		1: 'MO',
		2: 'TU',
		3: 'WE',
		4: 'TH',
		5: 'FR',
		6: 'SA'
	};

	function initializeFromStartDate() {
		const dayOfWeek = startDate.getDay();
		weeklyMonday = dayOfWeek === 1;
		weeklyTuesday = dayOfWeek === 2;
		weeklyWednesday = dayOfWeek === 3;
		weeklyThursday = dayOfWeek === 4;
		weeklyFriday = dayOfWeek === 5;
		weeklySaturday = dayOfWeek === 6;
		weeklySunday = dayOfWeek === 0;

		monthlyWeekdayDay = weekdayMap[dayOfWeek];
		const dayOfMonth = startDate.getDate();
		monthlyWeekdayFrequency = String(Math.min(Math.ceil(dayOfMonth / 7), 4));
	}

	$effect(() => {
		if (startDate && !initializedFromRule) {
			initializeFromStartDate();
		}
	});

	function createRecurrenceString(): string {
		if (type === 'daily') {
			return 'FREQ=DAILY';
		}

		if (type === 'weekly') {
			const weekdays: string[] = [];
			if (weeklyMonday) weekdays.push('MO');
			if (weeklyTuesday) weekdays.push('TU');
			if (weeklyWednesday) weekdays.push('WE');
			if (weeklyThursday) weekdays.push('TH');
			if (weeklyFriday) weekdays.push('FR');
			if (weeklySaturday) weekdays.push('SA');
			if (weeklySunday) weekdays.push('SU');

			if (weekdays.length === 0) {
				weekdays.push(weekdayMap[startDate.getDay()]);
			}

			return 'FREQ=WEEKLY;BYDAY=' + weekdays.join(',');
		}

		if (type === 'monthly_date') {
			const dayOfMonth = startDate.getDate();
			return 'FREQ=MONTHLY;BYMONTHDAY=' + dayOfMonth;
		}

		if (type === 'monthly_weekday') {
			return (
				'FREQ=MONTHLY;BYDAY=' + monthlyWeekdayDay + ';BYSETPOS=' + monthlyWeekdayFrequency
			);
		}

		if (type === 'yearly') {
			const month = startDate.getMonth() + 1;
			const dayOfMonth = startDate.getDate();
			return 'FREQ=YEARLY;BYMONTH=' + month + ';BYMONTHDAY=' + dayOfMonth;
		}

		return 'FREQ=DAILY';
	}

	$effect(() => {
		recurrenceRule = createRecurrenceString();
	});
</script>

<div class="flex w-full flex-col gap-2 p-1" transition:slide>
	<Select bind:value={type} options={typeOptions} />

	{#if type === 'weekly'}
		<div class="mt-1 flex flex-wrap gap-x-4 gap-y-2">
			<div class="flex items-center gap-2">
				<Checkbox
					isChecked={weeklyMonday}
					onchange={() => (weeklyMonday = !weeklyMonday)}
				/>
				<span class="text-sm">Mon</span>
			</div>
			<div class="flex items-center gap-2">
				<Checkbox
					isChecked={weeklyTuesday}
					onchange={() => (weeklyTuesday = !weeklyTuesday)}
				/>
				<span class="text-sm">Tue</span>
			</div>
			<div class="flex items-center gap-2">
				<Checkbox
					isChecked={weeklyWednesday}
					onchange={() => (weeklyWednesday = !weeklyWednesday)}
				/>
				<span class="text-sm">Wed</span>
			</div>
			<div class="flex items-center gap-2">
				<Checkbox
					isChecked={weeklyThursday}
					onchange={() => (weeklyThursday = !weeklyThursday)}
				/>
				<span class="text-sm">Thu</span>
			</div>
			<div class="flex items-center gap-2">
				<Checkbox
					isChecked={weeklyFriday}
					onchange={() => (weeklyFriday = !weeklyFriday)}
				/>
				<span class="text-sm">Fri</span>
			</div>
			<div class="flex items-center gap-2">
				<Checkbox
					isChecked={weeklySaturday}
					onchange={() => (weeklySaturday = !weeklySaturday)}
				/>
				<span class="text-sm">Sat</span>
			</div>
			<div class="flex items-center gap-2">
				<Checkbox
					isChecked={weeklySunday}
					onchange={() => (weeklySunday = !weeklySunday)}
				/>
				<span class="text-sm">Sun</span>
			</div>
		</div>
	{/if}

	{#if type === 'monthly_weekday'}
		<div class="mt-1 flex items-center gap-2">
			<span class="text-sm">on the</span>
			<Select bind:value={monthlyWeekdayFrequency} options={everyXOptions} />
			<Select bind:value={monthlyWeekdayDay} options={dayOptions} />
		</div>
	{/if}
</div>
