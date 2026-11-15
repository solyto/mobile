<script lang="ts">
	import { setCalendars } from '$lib/state/Calendars.svelte';
	import { setCalendarImport } from '$lib/state/CalendarImport.svelte';
	import { setExternalCalendars } from '$lib/state/ExternalCalendars.svelte';
	import { setCalendarSharing } from '$lib/state/CalendarSharing.svelte';
	import { setCalendarDrag } from '$lib/state/CalendarDrag.svelte';
	import { setTodos } from '$lib/state/Todos.svelte';

	setCalendars();
	setExternalCalendars();
	setCalendarImport();
	setCalendarSharing();
	setCalendarDrag();
	setTodos();

	let { children } = $props();
</script>

{@render children?.()}
