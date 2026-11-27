<script lang="ts">
	import { onDestroy } from 'svelte';
	import { setCalendars } from '$lib/state/Calendars.svelte';
	import { setCalendarImport } from '$lib/state/CalendarImport.svelte';
	import { setExternalCalendars } from '$lib/state/ExternalCalendars.svelte';
	import { setCalendarSharing } from '$lib/state/CalendarSharing.svelte';
	import { setCalendarDrag } from '$lib/state/CalendarDrag.svelte';
	import { setTodos } from '$lib/state/Todos.svelte';

	setCalendars();
	setExternalCalendars();
	const calendarImport = setCalendarImport();
	setCalendarSharing();
	setCalendarDrag();
	setTodos();

	let { children } = $props();

	onDestroy(() => calendarImport.destroy());
</script>

{@render children?.()}
