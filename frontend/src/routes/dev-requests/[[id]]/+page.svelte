<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
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
	import IconMegaphone from '$lib/icons/lucide/megaphone.svelte';
	import { devRequestStatusLabels } from '$lib/helpers/DevRequestHelper';
	import type { DevRequest, DevRequestFilter } from '$lib/types/dev_request';

	const ts = getTranslation();
	const auth = getAuth();
	const devRequests = getDevRequests();
	const loadingIndicator = getLoadingIndicator();
	const filterService = new DevRequestFilterService();

	const FILTERS: DevRequestFilter[] = ['all', 'backlog', 'open', 'in-progress', 'waiting-for-deployment', 'waiting-for-user'];

	const isAdmin = auth.isAdmin();

	let createOpen = $state<boolean>(false);
	let filter = $state<DevRequestFilter>('all');
	let openedEntry = $derived<number | null>(page.params.id ? parseInt(page.params.id) : null);

	afterNavigate(() => {
		if (page.params.id) filter = 'all';
	});

	function filterOptions(): { label: string; value: DevRequestFilter }[] {
		const labels: Record<DevRequestFilter, string> = {
			...devRequestStatusLabels(ts.get.dev.requests),
			'all': ts.get.dev.requests.filter_all,
			'open': ts.get.dev.requests.filter_open
		};

		return FILTERS.map((value) => ({
			label: `${labels[value]} (${filterService.filter(devRequests.entries, value).length})`,
			value
		}));
	}

	function currentEntries(): DevRequest[] {
		if (filter !== 'all') return filterService.filter(devRequests.entries, filter);
		return filterService.unresolved(devRequests.entries);
	}

	function openCreate(): void {
		createOpen = true;
	}

	function closeCreate(): void {
		createOpen = false;
	}

	onMount(async () => {
		loadingIndicator.start();
		try {
			await Promise.all([devRequests.load(), devRequests.loadNotice()]);
		} finally {
			loadingIndicator.stop();
		}
	});
</script>

<div class="flex flex-col gap-4 pb-8">
	{#if devRequests.notice}
		<div class="mx-4 mt-4 flex items-start gap-3 rounded-lg bg-c-primary/10 p-4 dark:bg-c-primary/20" in:fade>
			<IconMegaphone class="size-5 shrink-0 text-c-primary" />
			<p class="text-sm whitespace-pre-line">{devRequests.notice}</p>
		</div>
	{/if}
	<div class="flex flex-col md:flex-row md:items-center md:justify-between">
		<h2 class="order-2 mt-2 pl-4 pb-2 text-2xl font-normal text-c-neutral-7 dark:text-c-neutral-3 md:order-1 md:mt-4">
			{ts.get.dev.requests.current_requests}
		</h2>
		<TextButton
			class="order-1 mt-4 mr-4 ml-auto mb-1 w-48 md:order-2 md:mt-5 md:ml-0 md:mb-0"
			title={ts.get.dev.requests.new}
			type="btn"
			onclick={openCreate}
		/>
	</div>
	{#if isAdmin}
		<div class="px-4">
			<SegmentedControl bind:value={filter} options={filterOptions()} />
		</div>
	{/if}
	<div class="flex flex-col gap-4 px-4 md:gap-3">
		{#each currentEntries() as entry (entry.id)}
			<DevRequestEntry {entry} {isAdmin} active={openedEntry === entry.id} />
		{/each}
	</div>
	{#if filter === 'all'}
		<Divider />
		<h2 class="pl-4 pb-2 text-2xl font-normal text-c-neutral-7 dark:text-c-neutral-3">
			{ts.get.dev.requests.resolved_requests}
		</h2>
		<div class="flex flex-col gap-4 px-4 md:gap-3">
			{#each filterService.resolved(devRequests.entries) as entry (entry.id)}
				<DevRequestEntry {entry} {isAdmin} />
			{/each}
		</div>
	{/if}
</div>

{#if createOpen}
	<DevRequestEdit onClose={closeCreate} />
{/if}
