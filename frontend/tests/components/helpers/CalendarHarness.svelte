<script lang="ts">
	import type { AnyComponent } from './context';
	import { setCalendars, type Calendars } from '$lib/state/Calendars.svelte';
	import { setCalendarDrag } from '$lib/state/CalendarDrag.svelte';
	import { setCalendarSharing } from '$lib/state/CalendarSharing.svelte';
	import { setCalendarImport } from '$lib/state/CalendarImport.svelte';
	import { setExternalCalendars, type ExternalCalendars } from '$lib/state/ExternalCalendars.svelte';

	let { component: ComponentToRender, props = {}, setup = () => {} }: {
		component: AnyComponent;
		props?: Record<string, unknown>;
		setup?: (calendars: Calendars, externalCalendars: ExternalCalendars) => void;
	} = $props();

	const calendars = setCalendars();
	setCalendarDrag();
	setCalendarSharing();
	setCalendarImport();
	const externalCalendars = setExternalCalendars();
	// svelte-ignore state_referenced_locally
	setup(calendars, externalCalendars);
</script>

<ComponentToRender {...props} />
