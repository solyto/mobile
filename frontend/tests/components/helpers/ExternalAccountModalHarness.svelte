<script lang="ts">
	import ExternalAccountModal from '$lib/components/calendars/ExternalAccountModal.svelte';
	import { setCalendars } from '$lib/state/Calendars.svelte';
	import { setExternalCalendars, type ExternalCalendars } from '$lib/state/ExternalCalendars.svelte';
	import type { ExternalAccountDialog } from '$lib/types/calendar';

	let { dialog = { step: 'connect' }, onStore }: {
		dialog?: ExternalAccountDialog;
		onStore?: (store: ExternalCalendars) => void;
	} = $props();

	setCalendars();
	const externalCalendars = setExternalCalendars();
	externalCalendars.openDialog(dialog);
	onStore?.(externalCalendars);
</script>

<ExternalAccountModal />
