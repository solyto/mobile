<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';

	const ts = getTranslation();
	const calendars = getCalendars();

	function title(): string {
		return calendars.selectedCalendar?.is_external ? ts.get.calendar.disconnect_title : ts.get.calendar.delete_title;
	}

	function description(): string {
		return calendars.selectedCalendar?.is_external ? ts.get.calendar.disconnect_description : ts.get.calendar.delete_description;
	}
</script>

{#if calendars.deletionModal && calendars.selectedCalendar}
	<ConfirmationModal
		title={title()}
		description={description()}
		type="confirm-delete"
		onConfirm={() => {
			calendars.deleteCalendar(calendars.selectedCalendar!);
		}}
		onCancel={() => {
			calendars.deletionModal = false;
		}}
	/>
{/if}
