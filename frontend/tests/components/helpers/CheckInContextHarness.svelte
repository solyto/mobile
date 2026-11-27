<script lang="ts">
	import type { Component } from 'svelte';
	import type { CheckInTracker, CheckInValue } from '$lib/types/check_in';
	import type { Alert } from '$lib/types/alert';
	import { setCheckInData } from '$lib/state/CheckInData.svelte';
	import { setGoals } from '$lib/state/Goals.svelte';
	import { setAlerts } from '$lib/state/Alerts.svelte';

	let {
		component: Inner,
		props = {},
		trackers = [],
		values = [],
		alerts = [],
		loaded = false
	}: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		component: Component<any>;
		props?: Record<string, unknown>;
		trackers?: CheckInTracker[];
		values?: CheckInValue[];
		alerts?: Alert[];
		loaded?: boolean;
	} = $props();

	const checkInData = setCheckInData();
	setGoals();
	const alertsStore = setAlerts();
	// svelte-ignore state_referenced_locally
	checkInData.trackers = trackers;
	// svelte-ignore state_referenced_locally
	checkInData.values = values;
	// svelte-ignore state_referenced_locally
	checkInData.loaded = loaded;
	// svelte-ignore state_referenced_locally
	alertsStore.alerts = alerts;
	alertsStore.loaded = true;
</script>

<Inner {...props} />
