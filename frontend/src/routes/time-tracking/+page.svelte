<script lang="ts">
	import { page } from '$app/state';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { timeTrackingTab } from '$lib/helpers/TimeTrackingHelper';
	import Heading from '$lib/components/ui/Heading.svelte';
	import DashboardView from '$lib/components/time-tracking/DashboardView.svelte';
	import GroupedEntries from '$lib/components/time-tracking/GroupedEntries.svelte';
	import StatisticsView from '$lib/components/time-tracking/StatisticsView.svelte';
	import EntryCreate from '$lib/components/time-tracking/EntryCreate.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { hamburgerClearance } from '$lib/config/navigation';

	const ts = getTranslation();
	const auth = getAuth();

	let showEntryCreate = $state<boolean>(false);

	let activeTab = $derived(timeTrackingTab(page.url));
</script>

<div class="flex w-full flex-col gap-4 p-6">
	{#if activeTab === 'dashboard'}
		<DashboardView weekStart={auth.getWeekStart()} />
	{:else if activeTab === 'statistics'}
		<StatisticsView />
	{:else}
		<div>
			<div class="mb-4 flex flex-row items-center justify-between">
				<div class={hamburgerClearance}>
					<Heading title={ts.get.timeTracking.entries} my={0} />
				</div>
				<TextButton title={ts.get.timeTracking.add_entry} onclick={() => (showEntryCreate = true)} />
			</div>
			<GroupedEntries />
		</div>
	{/if}
</div>

{#if showEntryCreate}
	<EntryCreate onClose={() => (showEntryCreate = false)} />
{/if}
