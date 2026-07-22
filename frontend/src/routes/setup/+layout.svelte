<script lang="ts">
	import '../../app.css';
	import favicon from '$lib/assets/favicon.ico';
	import { PLATFORM } from '$lib/config/platform';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { urls } from '$lib/config/urls';

	let { children } = $props();

	onMount(() => {
		if (PLATFORM === 'web') goto(resolve(urls.login));
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="relative flex h-full w-full flex-row items-center justify-center bg-c-neutral text-c-neutral-8 dark:bg-s-dark dark:text-c-neutral-2"
>
	<div class="absolute bottom-0 h-2 w-full bg-gradient-to-r from-c-btn to-c-success"></div>
	{@render children?.()}
</div>
