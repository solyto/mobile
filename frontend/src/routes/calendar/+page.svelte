<script lang="ts">
	import { onMount } from 'svelte';
	import CalendarView from '$lib/components/calendars/CalendarView.svelte';
	import CalendarNavigation from '$lib/components/calendars/CalendarNavigation.svelte';
	import MobileCalendarHeader from '$lib/components/calendars/MobileCalendarHeader.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import DeleteModal from '$lib/components/calendars/DeleteModal.svelte';
	import ImportModal from '$lib/components/calendars/ImportModal.svelte';
	import SyncModal from '$lib/components/dav/SyncModal.svelte';
	import ShareCalendarModal from '$lib/components/calendars/ShareCalendarModal.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';

	const viewPoint = getViewPoint();
	const calendars = getCalendars();
	const loadingIndicator = getLoadingIndicator();

	onMount(async () => {
		loadingIndicator.start();
		await calendars.loadCalendars();
		await calendars.loadEvents();
		await calendars.loadTodos();
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
		{#if calendars.shareModal && calendars.shareCalendarTarget}
			<ShareCalendarModal
				calendar={calendars.shareCalendarTarget}
				onClose={() => calendars.closeShareModal()}
			/>
		{/if}
	{/if}
</div>
