<script lang="ts">
	import { blur } from 'svelte/transition';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getNavigation } from '$lib/state/Navigation.svelte';

	import TimeTrackingWidget from '$lib/components/dashboard/widgets/TimeTrackingWidget.svelte';
	import CheckInWidget from '$lib/components/dashboard/widgets/CheckInWidget.svelte';
	import ShortcutsWidget from '$lib/components/dashboard/widgets/ShortcutsWidget.svelte';

	const ts = getTranslation();
	const auth = getAuth();
	const nav = getNavigation();
</script>

<div class="flex flex-col gap-12" in:blur>
	{#if nav.features.checkIn}
		<CheckInWidget {ts} />
	{/if}
	{#if nav.features.timeTracking}
		<TimeTrackingWidget {ts} weekStart={auth.getWeekStart()} />
	{/if}
	<ShortcutsWidget {ts} />
</div>