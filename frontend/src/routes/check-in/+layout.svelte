<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import CheckInNavigation from '$lib/components/check-in/CheckInNavigation.svelte';
	let { children } = $props();
	import { setCheckInData } from '$lib/state/CheckInData.svelte';
	import { setGoals } from '$lib/state/Goals.svelte';

	const checkInData = setCheckInData();
	const goals = setGoals();
	onMount(() => { checkInData.load(); goals.load(); });
</script>

<div class="flex flex-col p-2 xl:p-8" in:fade>
	<CheckInNavigation />
	{@render children?.()}
</div>
