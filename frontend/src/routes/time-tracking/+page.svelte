<script lang="ts">
	import { page } from '$app/state';
	import { getTranslation } from '$lib/state/Translation.svelte';

	import Heading from '$lib/components/ui/Heading.svelte';
	import DashboardView from '$lib/components/time-tracking/DashboardView.svelte';
	import GroupedEntries from '$lib/components/time-tracking/GroupedEntries.svelte';
	import StatisticsView from '$lib/components/time-tracking/StatisticsView.svelte';
	import EntryCreate from '$lib/components/time-tracking/EntryCreate.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';

	const ts = getTranslation();
	let showEntryCreate = $state<boolean>(false);

	let activeTab = $derived.by(() => {
		const tab = page.url.searchParams.get('tab');
		if (tab === 'entries' || tab === 'statistics') return tab;
		return 'dashboard';
	});
</script>

<div class="flex w-full flex-col gap-4 p-6">
	{#if activeTab === 'dashboard'}
		<DashboardView />
	{:else if activeTab === 'statistics'}
		<StatisticsView />
	{:else}
		<div>
			<div class="mb-4 flex flex-row items-center justify-between">
				<Heading title={ts.get.timeTracking.entries} my={0} />
				<TextButton
					title={ts.get.timeTracking.add_entry}
					onclick={() => (showEntryCreate = true)}
				/>
			</div>
			<GroupedEntries />
		</div>
	{/if}
</div>

{#if showEntryCreate}
	<EntryCreate onClose={() => (showEntryCreate = false)} />
{/if}
