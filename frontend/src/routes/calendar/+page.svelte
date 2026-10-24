<script lang="ts">
	import { onMount } from 'svelte';
	import CalendarView from '$lib/components/calendars/CalendarView.svelte';
	import CalendarNavigation from '$lib/components/calendars/CalendarNavigation.svelte';
	import MobileCalendarHeader from '$lib/components/calendars/MobileCalendarHeader.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getCalendarSharing } from '$lib/state/CalendarSharing.svelte';
	import DeleteModal from '$lib/components/calendars/DeleteModal.svelte';
	import ImportModal from '$lib/components/calendars/ImportModal.svelte';
	import SyncModal from '$lib/components/dav/SyncModal.svelte';
	import ShareCalendarModal from '$lib/components/calendars/ShareCalendarModal.svelte';
	import RecurrenceActionModal from '$lib/components/calendars/RecurrenceActionModal.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const calendars = getCalendars();
	const calendarSharing = getCalendarSharing();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const ts = getTranslation();

	async function resolvePendingMove(thisOccurrenceOnly: boolean): Promise<void> {
		loadingIndicator.start();
		const ok = await calendars.resolvePendingMove(thisOccurrenceOnly);
		loadingIndicator.stop();
		if (!ok) {
			notifications.error(ts.get.calendar.entry_move_error);
		}
	}

	onMount(async () => {
		loadingIndicator.start();
		await Promise.all([
			calendars.loadCalendars(),
			calendars.loadEvents(),
			calendars.loadTodos(),
			// The day-cell marks are scoped light fetches, loaded separately.
			calendars.loadMarks()
		]);
		loadingIndicator.stop();
	});
</script>

<div class="flex h-full w-full flex-col">
	{#if calendars.loaded}
		<MobileCalendarHeader />
		<div class="flex min-h-0 w-full flex-1 flex-row">
			<CalendarNavigation />
			<CalendarView />
		</div>
		<DeleteModal />
		<ImportModal />
		{#if calendars.syncModal}
			<SyncModal onClose={() => (calendars.syncModal = false)} />
		{/if}
		{#if calendarSharing.shareModal && calendarSharing.shareCalendarTarget}
			<ShareCalendarModal
				calendar={calendarSharing.shareCalendarTarget}
				onClose={() => calendarSharing.closeShareModal()}
			/>
		{/if}
		{#if calendars.pendingMove}
			<RecurrenceActionModal
				action="move"
				onThisOccurrence={() => resolvePendingMove(true)}
				onAllOccurrences={() => resolvePendingMove(false)}
				onCancel={() => calendars.cancelPendingMove()}
			/>
		{/if}
	{/if}
</div>
