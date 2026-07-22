<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';

	const ts = getTranslation();
	const calendars = getCalendars();
</script>

{#if calendars.deletionModal && calendars.selectedCalendar}
	<Modal
		title={ts.get.calendar.delete_title}
		description={ts.get.calendar.delete_description}
		type="confirm-delete"
		onConfirm={() => {
			calendars.deleteCalendar(calendars.selectedCalendar!);
		}}
		onCancel={() => {
			calendars.deletionModal = false;
		}}
	/>
{/if}
