<script lang="ts">
	import { setNavigation } from '$lib/state/Navigation.svelte';
	import { setTags } from '$lib/state/Tags.svelte';
	import SettingsPage from '../../../src/routes/settings/+page.svelte';

	let { checkIn }: { checkIn: boolean } = $props();

	const nav = setNavigation();
	// svelte-ignore state_referenced_locally
	nav.features.checkIn = checkIn;
	setTags();
</script>

<SettingsPage />
