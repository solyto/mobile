<script lang="ts">
	import ExternalAccounts from '$lib/components/calendars/ExternalAccounts.svelte';
	import { setCalendars } from '$lib/state/Calendars.svelte';
	import { setExternalCalendars } from '$lib/state/ExternalCalendars.svelte';

	setCalendars();
	setExternalCalendars();
</script>

<ExternalAccounts />
