<script lang="ts">
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import Divider from '$lib/components/ui/Divider.svelte';
	import DevRequestEntry from '$lib/components/dev-requests/DevRequestEntry.svelte';
	import { getDevRequests } from '$lib/state/DevRequests.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import DevRequestEdit from '$lib/components/dev-requests/DevRequestEdit.svelte';

	const ts = getTranslation();
	const devRequests = getDevRequests();
	const loadingIndicator = getLoadingIndicator();

	let { openedEntry = null } = $props<number | null>();

	let createOpen = $state<boolean>(false);

	onMount(async () => {
		loadingIndicator.start();
		await devRequests.load();
		loadingIndicator.stop();
	});
</script>

<div class="flex flex-col gap-4">
	{#if createOpen}
		<DevRequestEdit onClose={() => (createOpen = false)} />
	{/if}
	<div class="flex flex-col md:flex-row md:items-center md:justify-between">
		<h2 class="order-2 mt-2 pl-4 pb-2 text-2xl font-normal text-c-neutral-7 dark:text-c-neutral-3 md:order-1 md:mt-4">
			{ts.get.dev.requests.current_requests}
		</h2>
		<TextButton
			class="order-1 mt-4 mr-4 ml-auto mb-1 w-48 md:order-2 md:mt-5 md:ml-0 md:mb-0"
			title={ts.get.dev.requests.new}
			type="btn"
			onclick={() => (createOpen = !createOpen)}
		/>
	</div>
	<div class="flex flex-col gap-2 px-2">
		{#each devRequests.entries.filter((e) => e.status !== 'completed' && e.status !== 'cancelled') as entry (entry.id)}
			<DevRequestEntry {entry} active={openedEntry == entry.id} />
		{/each}
	</div>
	<Divider />
	<h2 class="pl-4 pb-2 text-2xl font-normal text-c-neutral-7 dark:text-c-neutral-3">
		{ts.get.dev.requests.resolved_requests}
	</h2>
	<div class="flex flex-col gap-2 px-2">
		{#each devRequests.entries.filter((e) => e.status === 'completed' || e.status === 'cancelled') as entry (entry.id)}
			<DevRequestEntry {entry} />
		{/each}
	</div>
</div>
