<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';

	const ts = getTranslation();
	const calendars = getCalendars();
</script>

{#if calendars.deletionModal && calendars.selectedCalendar}
	<ConfirmationModal
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
