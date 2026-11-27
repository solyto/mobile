<script lang="ts">
	import IconChevronDown from '$lib/icons/lucide/chevron-down.svelte';
	import IconChevronUp from '$lib/icons/lucide/chevron-up.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';

	const calendars = getCalendars();
</script>

<button
	class="rounded-lg transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3 opacity-0"
>
	<IconChevronUp />
</button>
<div class="flex flex-col items-center justify-center gap-2 opacity-0">
	<span>{calendars.currentDate.getDate()}</span>
	<span>{calendars.currentDate.getMonth() + 1}</span>
</div>
<button
	class="rounded-lg transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3 opacity-0"
>
	<IconChevronDown />
</button>
