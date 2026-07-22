<script lang="ts">
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	import Heading from '$lib/components/ui/Heading.svelte';
	import DashboardView from '$lib/components/time-tracking/DashboardView.svelte';
	import GroupedEntries from '$lib/components/time-tracking/GroupedEntries.svelte';
	import EntryCreate from '$lib/components/time-tracking/EntryCreate.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';

	const tt = getTimeTracking();
	const ts = getTranslation();
	let showEntryCreate = $state<boolean>(false);
</script>

<div class="flex w-full flex-col gap-4 p-6">
	{#if tt.activeTab === 'dashboard'}
		<DashboardView />
	{:else if tt.activeTab === 'entries'}
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
