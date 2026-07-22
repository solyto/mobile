<script lang="ts">
	import IconChevronDown from '@lucide/svelte/icons/chevron-down';
	import IconChevronUp from '@lucide/svelte/icons/chevron-up';
	import { getCalendars } from '$lib/state/Calendars.svelte';

	const calendars = getCalendars();
</script>

<button
	onclick={async () => await calendars.nextMonth()}
	class="cursor-pointer rounded-lg transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
>
	<IconChevronUp />
</button>
<div class="flex flex-col items-center justify-center gap-2">
	<span>{calendars.currentMonth}</span>
	<span>{calendars.currentYear.toString().slice(2, 4)}</span>
</div>
<button
	onclick={async () => await calendars.lastMonth()}
	class="cursor-pointer rounded-lg transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
>
	<IconChevronDown />
</button>
