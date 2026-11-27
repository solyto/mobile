<script lang="ts">
	import type { FeatureType } from '$lib/config/navigation';
	import { setNavigation } from '$lib/state/Navigation.svelte';
	import { setWelcomeTour } from '$lib/state/WelcomeTour.svelte';
	import { setQuickAdd } from '$lib/state/QuickAdd.svelte';
	import DashboardPage from '../../../src/routes/+page.svelte';

	let { checkIn = false, features = {} }: { checkIn?: boolean; features?: Partial<Record<FeatureType, boolean>> } = $props();

	const nav = setNavigation();
	// svelte-ignore state_referenced_locally
	Object.assign(nav.features, { checkIn, todos: false }, features);
	setWelcomeTour();
	setQuickAdd();
</script>

<DashboardPage />
