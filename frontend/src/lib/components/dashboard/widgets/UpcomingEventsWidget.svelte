<script lang="ts">
	import { formatTime } from '$lib/helpers/DateHelper';
	import IconCalendarDays from '@lucide/svelte/icons/calendar-days';
	import { Translation } from '$lib/state/Translation.svelte';
	import { Auth } from '$lib/state/Auth.svelte';
	import type { CalendarEvent } from '$lib/types/calendar';

	let { upcomingEvents, ts, auth, mt = false } = $props<{
		upcomingEvents: CalendarEvent[];
		ts: Translation;
		auth: Auth;
		mt: boolean;
	}>();
</script>

<div class:mt-12={mt}>
	<div class="mb-2 flex items-center gap-2">
		<IconCalendarDays size={15} class="text-c-heading dark:text-c-primary" />
		<span class="text-xs font-semibold tracking-wider text-c-heading uppercase dark:text-c-primary">
			{ts.get.widgets.coming_up}
		</span>
	</div>
	<div class="flex flex-col gap-1.5 pl-[3px]">
		{#each upcomingEvents as event (event.id)}
			<div class="flex items-center gap-2.5 py-0.5">
				<div
					class="h-3.5 w-[3px] shrink-0 rounded-full"
					style="background-color: {event.calendar_color}"
				></div>
				<span class="shrink-0 text-xs text-c-neutral-4 dark:text-c-neutral-5">
					{auth.getDateWithoutYearInUserPreferredFormat(
						new Date(event.start_date)
					)}
				</span>
				<span class="truncate text-sm text-c-neutral-7 dark:text-c-neutral-3">
					{event.title}
				</span>
				{#if !event.is_all_day}
					<span class="ml-auto shrink-0 text-xs text-c-neutral-4 dark:text-c-neutral-5">
						{formatTime(new Date(event.start_date))}
					</span>
				{/if}
			</div>
		{/each}
	</div>
</div>