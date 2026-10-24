<script lang="ts">
	import { getCalendars } from '$lib/state/Calendars.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import EventEdit from '$lib/components/calendars/EventEdit.svelte';
	import MonthView from '$lib/components/calendars/views/month/MonthView.svelte';
	import MobileMonthView from '$lib/components/calendars/views/month/MobileMonthView.svelte';
	import WeekView from '$lib/components/calendars/views/week/WeekView.svelte';
	import MobileWeekView from '$lib/components/calendars/views/week/MobileWeekView.svelte';
	import DayView from '$lib/components/calendars/views/day/DayView.svelte';
	import MobileDayView from '$lib/components/calendars/views/day/MobileDayView.svelte';
	import ListView from '$lib/components/calendars/views/list/ListView.svelte';

	const calendars = getCalendars();
	const viewPoint = getViewPoint();
</script>

{#if calendars.editSidebar}
	<EventEdit />
{/if}
{#if calendars.view === 'month'}
	{#if viewPoint.isMobile || viewPoint.isTablet}
		<MobileMonthView />
	{:else}
		<MonthView />
	{/if}
{:else if calendars.view === 'week'}
	{#if viewPoint.isMobile || viewPoint.isTablet}
		<MobileWeekView />
	{:else}
		<WeekView />
	{/if}
{:else if calendars.view === 'day'}
	{#if viewPoint.isMobile || viewPoint.isTablet}
		<MobileDayView />
	{:else}
		<DayView />
	{/if}
{:else if calendars.view === 'list'}
	<ListView />
{/if}
