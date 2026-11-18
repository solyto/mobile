<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import Divider from '$lib/components/ui/Divider.svelte';
	import DevRequestEntry from '$lib/components/dev-requests/DevRequestEntry.svelte';
	import { getDevRequests } from '$lib/state/DevRequests.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import DevRequestEdit from '$lib/components/dev-requests/DevRequestEdit.svelte';
	import SegmentedControl from '$lib/components/forms/SegmentedControl.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import DevRequestFilterService from '$lib/services/DevRequestFilterService';
	import type { DevRequest, DevRequestFilter } from '$lib/types/dev_request';

	const ts = getTranslation();
	const auth = getAuth();
	const devRequests = getDevRequests();
	const loadingIndicator = getLoadingIndicator();
	const filterService = new DevRequestFilterService();

	const FILTERS: DevRequestFilter[] = ['all', 'backlog', 'open', 'in-progress', 'waiting-for-deployment'];

	const isAdmin = auth.isAdmin();

	let createOpen = $state<boolean>(false);
	let filter = $state<DevRequestFilter>('all');
	let openedEntry = $derived<number | null>(page.params.id ? parseInt(page.params.id) : null);

	afterNavigate(() => {
		if (page.params.id) filter = 'all';
	});

	function filterOptions(): { label: string; value: DevRequestFilter }[] {
		const labels: Record<DevRequestFilter, string> = {
			'all': ts.get.dev.requests.filter_all,
			'backlog': ts.get.dev.requests.status_backlog,
			'open': ts.get.dev.requests.filter_open,
			'in-progress': ts.get.dev.requests.status_in_progress,
			'waiting-for-deployment': ts.get.dev.requests.status_waiting_for_deployment
		};

		return FILTERS.map((value) => ({
			label: `${labels[value]} (${filterService.filter(devRequests.entries, value).length})`,
			value
		}));
	}

	function currentEntries(): DevRequest[] {
		if (filter !== 'all') return filterService.filter(devRequests.entries, filter);
		return devRequests.entries.filter((e) => e.status !== 'completed' && e.status !== 'cancelled');
	}

	onMount(async () => {
		loadingIndicator.start();
		await devRequests.load();
		loadingIndicator.stop();
	});
</script>

<div class="flex flex-col gap-4 pb-8">
	<div class="flex flex-col md:flex-row md:items-center md:justify-between">
		<h2 class="order-2 mt-2 pl-4 pb-2 text-2xl font-normal text-c-neutral-7 dark:text-c-neutral-3 md:order-1 md:mt-4">
			{ts.get.dev.requests.current_requests}
		</h2>
		<TextButton
			class="order-1 mt-4 mr-4 ml-auto mb-1 w-48 md:order-2 md:mt-5 md:ml-0 md:mb-0"
			title={ts.get.dev.requests.new}
			type="btn"
			onclick={() => (createOpen = true)}
		/>
	</div>
	{#if isAdmin}
		<div class="px-4">
			<SegmentedControl bind:value={filter} options={filterOptions()} />
		</div>
	{/if}
	<div class="flex flex-col gap-4 px-4 md:gap-3">
		{#each currentEntries() as entry (entry.id)}
			<DevRequestEntry {entry} active={openedEntry === entry.id} />
		{/each}
	</div>
	{#if filter === 'all'}
		<Divider />
		<h2 class="pl-4 pb-2 text-2xl font-normal text-c-neutral-7 dark:text-c-neutral-3">
			{ts.get.dev.requests.resolved_requests}
		</h2>
		<div class="flex flex-col gap-4 px-4 md:gap-3">
			{#each devRequests.entries.filter((e) => e.status === 'completed' || e.status === 'cancelled') as entry (entry.id)}
				<DevRequestEntry {entry} />
			{/each}
		</div>
	{/if}
</div>

{#if createOpen}
	<DevRequestEdit onClose={() => (createOpen = false)} />
{/if}
