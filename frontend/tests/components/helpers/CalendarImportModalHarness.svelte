<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImportModal from '$lib/components/calendars/ImportModal.svelte';
	import { setCalendars, type Calendars } from '$lib/state/Calendars.svelte';
	import { setCalendarImport, type CalendarImport } from '$lib/state/CalendarImport.svelte';
	import type { Calendar, ImportState } from '$lib/types/calendar';

	let { calendars = [], state = null, onStore, onCalendars }: {
		calendars?: Calendar[];
		state?: ImportState | null;
		onStore?: (store: CalendarImport) => void;
		onCalendars?: (store: Calendars) => void;
	} = $props();

	const calendarsStore = setCalendars();
	// svelte-ignore state_referenced_locally
	calendarsStore.calendars = calendars;
	// svelte-ignore state_referenced_locally
	onCalendars?.(calendarsStore);
	const calendarImport = setCalendarImport();
	// svelte-ignore state_referenced_locally
	calendarImport.state = state;
	calendarImport.importModal = true;
	// svelte-ignore state_referenced_locally
	onStore?.(calendarImport);

	onDestroy(() => calendarImport.destroy());
</script>

<ImportModal />
