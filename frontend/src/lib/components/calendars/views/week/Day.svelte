<script lang="ts">
	import { blur } from 'svelte/transition';
	import IconPlus from '@lucide/svelte/icons/plus';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getDateDiffInMinutes } from '$lib/helpers/DateHelper';
	import type { CalendarEvent } from '$lib/types/calendar';
	import TodoEntry from '$lib/components/calendars/TodoEntry.svelte';

	const calendars = getCalendars();
	const hours = Array.from({ length: 24 }, (_, i) => i + 1).map((i) =>
		(i - 1).toString().padStart(2, '0')
	);

	let { date, fixedHeight = false } = $props<{ date: Date; fixedHeight?: boolean }>();

	let entries = $derived(calendars.getEventsForDate(date));
	let allDayEntries = $derived(entries.filter((e) => e.is_all_day));
	let nonAllDayEntries = $derived(entries.filter((e) => !e.is_all_day));
	let entriesByHour = $derived(
		hours.map((hour) => ({
			hour: parseInt(hour),
			entries: nonAllDayEntries.filter(
				(entry) => entry.start_date?.getHours() === parseInt(hour)
			)
		}))
	);

	function getTop(entry: CalendarEvent): string {
		if (entry.start_date?.getMinutes() === 0) {
			return '0';
		}

		return entry.start_date?.getMinutes() + '%';
	}

	function getHeight(entry: CalendarEvent): string {
		if (!entry.end_date) {
			return '65%';
		}

		const h = getDateDiffInMinutes(entry.start_date, entry.end_date) / 0.6;

		return h > 65 ? h + '%' : '65%';
	}
</script>

<div class="relative flex h-full w-full flex-col">
	<div class="group relative w-full {fixedHeight ? 'h-16' : 'h-3/30'}">
		<button
			onclick={async () => {
				await calendars.showSidebar(date);
			}}
			class="absolute top-0 right-0 z-50 cursor-pointer rounded-bl-lg border-r-1 border-b-1 border-c-neutral-1 p-2 font-bold opacity-0 transition-all group-hover:bg-c-btn group-hover:text-c-neutral group-hover:opacity-100 dark:border-s-dark
			"
		>
			<IconPlus class="size-3" />
		</button>
		{#each calendars.getTodosForDate(date) as todo (todo.id)}
			<TodoEntry {todo} />
		{/each}
		{#each allDayEntries as item (item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime())}
			{#if !calendars.isCalendarHidden(item.calendar_id)}
				<button
					class="flex w-full cursor-pointer items-start justify-start border-l-4 px-2 py-1 pl-2 text-sm transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
					class:!border-l-0={item.start_date < date}
					style="border-color: {item.calendar_color ?? 'var(--color-c-neutral-2)'}; background-color: {item.calendar_color ? `color-mix(in srgb, ${item.calendar_color} 25%, var(--color-c-bg-elevated))` : ''};"
					onclick={async () => {
						await calendars.showSidebar(null, item);
					}}
					in:blur
				>
					<span class="text-left">{item.title}</span>
				</button>
			{/if}
		{/each}
	</div>
	{#each hours as hour (hour)}
		{@const offHour = fixedHeight && (parseInt(hour) < 6 || parseInt(hour) >= 22)}
		<div class="group relative border-t-1 border-c-neutral-1 dark:border-s-dark {fixedHeight ? (offHour ? 'h-6 bg-c-neutral dark:bg-s-dark-2' : 'h-14') : 'h-1/27'}">
			<button
				onclick={async () => {
					await calendars.showSidebar(date);
				}}
				class="absolute top-1 right-1 z-50 cursor-pointer rounded-full p-2 font-bold opacity-0 transition-all group-hover:opacity-100 hover:bg-c-btn hover:text-white
			"
			>
				<IconPlus class="size-3" />
			</button>
			{#if entriesByHour[parseInt(hour)].entries.length > 0}
				{#each entriesByHour[parseInt(hour)].entries as item, i (item.uri + '-' + (item.original_start_date ?? item.start_date)?.getTime())}
					{#if !calendars.isCalendarHidden(item.calendar_id)}
						<button
							class="absolute z-40 flex w-2/3 cursor-pointer items-start justify-start border-l-4 px-2 py-1 pl-2 text-sm shadow-sm transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
							class:left-0={i === 0}
							class:right-0={i > 0}
							style="border-color: {item.calendar_color ?? 'var(--color-c-neutral-2)'}; background-color: {item.calendar_color ? `color-mix(in srgb, ${item.calendar_color} 25%, var(--color-c-bg-elevated))` : ''}; top: {getTop(item)}; height: {getHeight(item)};"
							onclick={async () => {
								await calendars.showSidebar(null, item);
							}}
							in:blur
						>
							<span class="text-left">{item.title}</span>
						</button>
					{/if}
				{/each}
			{/if}
		</div>
	{/each}
</div>
