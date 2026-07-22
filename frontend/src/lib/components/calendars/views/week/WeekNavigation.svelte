<script lang="ts">
	import IconChevronDown from '@lucide/svelte/icons/chevron-down';
	import IconChevronUp from '@lucide/svelte/icons/chevron-up';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const calendars = getCalendars();
	const ts = getTranslation();
</script>

<button
	onclick={() => calendars.nextWeek()}
	class="cursor-pointer rounded-lg transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
>
	<IconChevronUp />
</button>
<div class="flex flex-col items-center justify-center gap-2">
	<span>{ts.get.calendar.calendar_week}</span>
	<span>{calendars.currentWeek}</span>
</div>
<button
	onclick={() => calendars.lastWeek()}
	class="cursor-pointer rounded-lg transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
>
	<IconChevronDown />
</button>
