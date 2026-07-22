<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import CheckInNavigation from '$lib/components/check-in/CheckInNavigation.svelte';
	let { children } = $props();
	import { setCheckInData } from '$lib/state/CheckInData.svelte';

	const checkInData = setCheckInData();
	onMount(() => { checkInData.load(); });
</script>

<div class="flex flex-col p-2 xl:p-8" in:fade>
	<CheckInNavigation />
	{@render children?.()}
</div>
