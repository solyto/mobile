<script lang="ts">
	import type { CalendarEvent } from '$lib/types/calendar';
	import { formatDate } from '$lib/helpers/DateHelper';
	import { setCalendars, type Calendars } from '$lib/state/Calendars.svelte';
	import Day from '$lib/components/calendars/views/list/Day.svelte';

	let { day, events, onReady }: { day: Date; events: CalendarEvent[]; onReady: (calendars: Calendars) => void } = $props();

	const calendars = setCalendars();
	// svelte-ignore state_referenced_locally
	calendars.sortedEvents = { [formatDate(day)]: events };
	// svelte-ignore state_referenced_locally
	onReady(calendars);
</script>

<Day {day} />
