<script lang="ts">
	import type { CheckInTracker } from '$lib/types/check_in';
	import { setCheckInData, type CheckInData } from '$lib/state/CheckInData.svelte';
	import { setGoals } from '$lib/state/Goals.svelte';
	import DailyPage from '../../../src/routes/check-in/date/[date]/+page.svelte';

	let { trackers, onReady }: { trackers: CheckInTracker[]; onReady: (checkInData: CheckInData) => void } = $props();

	const checkInData = setCheckInData();
	setGoals();
	// svelte-ignore state_referenced_locally
	checkInData.trackers = trackers;
	checkInData.loaded = true;
	// svelte-ignore state_referenced_locally
	onReady(checkInData);
</script>

<DailyPage />
