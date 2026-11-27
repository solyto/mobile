<script lang="ts">
	import IconCalendarDays from '$lib/icons/lucide/calendar-days.svelte';
	import { formatTime } from '$lib/helpers/DateHelper';
	import type { Translation } from '$lib/state/Translation.svelte';
	import type { CalendarEvent } from '$lib/types/calendar';

	let { todayEvents, ts }: {
		todayEvents: CalendarEvent[];
		ts: Translation;
	} = $props();

	function startLabel(event: CalendarEvent): string {
		return event.is_all_day ? ts.get.home.all_day : formatTime(new Date(event.start_date));
	}
</script>

<div>
	<div class="mb-2 flex items-center gap-2">
		<IconCalendarDays size={15} class="text-c-heading dark:text-c-primary" />
		<span class="text-xs font-semibold tracking-wider text-c-heading uppercase dark:text-c-primary">
			{ts.get.home.events}
		</span>
	</div>
	<div class="flex flex-col gap-1.5 pl-[3px]">
		{#each todayEvents as event (event.id)}
			<div class="flex items-center gap-2.5 py-0.5">
				<div
					class="h-3.5 w-[3px] shrink-0 rounded-full"
					style="background-color: {event.calendar_color}"
				></div>
				<span class="truncate text-sm text-c-neutral-7 dark:text-c-neutral-3">
					{event.title}
				</span>
				<span class="ml-auto shrink-0 text-xs text-c-neutral-4 dark:text-c-neutral-5">
					{startLabel(event)}
				</span>
			</div>
		{/each}
	</div>
</div>