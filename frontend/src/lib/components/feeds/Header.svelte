<script lang="ts">
	import type { FeedEntrySize, FeedSubscription } from '$lib/types/feed';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getFeeds } from '$lib/state/Feeds.svelte';
	import InlineEditButton from '$lib/components/ui/buttons/InlineEditButton.svelte';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ViewSwitcher from '$lib/components/ui/ViewSwitcher.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import { hamburgerClearance } from '$lib/config/navigation';

	const loadingIndicator = getLoadingIndicator();
	const feeds = getFeeds();
	const ts = getTranslation();

	let { feed }: {
		feed: FeedSubscription | null;
	} = $props();

	let confirmingDelete = $state(false);

	function openEdit(): void {
		feeds.modalOpen = true;
	}

	function askToDelete(): void {
		confirmingDelete = true;
	}

	function cancelDelete(): void {
		confirmingDelete = false;
	}

	async function onDelete(): Promise<void> {
		loadingIndicator.start();
		try {
			await feeds.delete(feed!);
		} finally {
			loadingIndicator.stop();
			confirmingDelete = false;
		}
	}

	function changeView(type: string): void {
		feeds.changeView(type as FeedEntrySize);
	}

	const views = [
		{ type: 'compact' as const, title: ts.get.feeds.view_compact },
		{ type: 'comfortable' as const, title: ts.get.feeds.view_comfortable },
		{ type: 'card' as const, title: ts.get.feeds.view_card }
	];
</script>

<div class="flex min-h-8 w-full items-center justify-end gap-2">
	<div class="mr-auto {hamburgerClearance} max-sm:hidden">
		<Heading title={feed?.title ?? ts.get.feeds.all_feeds} my={0} />
	</div>
	{#if feed !== null}
		<div class="mr-4 flex gap-2">
			<InlineEditButton label={ts.get.feeds.edit_feed} onClick={openEdit} />
			<InlineDeleteButton label={ts.get.feeds.delete_feed} onClick={askToDelete} />
		</div>
	{/if}
	<ViewSwitcher {views} currentlySelected={feeds.view} onChange={changeView} />
</div>

{#if confirmingDelete}
	<ConfirmationModal
		title={ts.get.feeds.delete_feed}
		description={ts.get.feeds.delete_feed_description}
		type="confirm-delete"
		onConfirm={onDelete}
		onCancel={cancelDelete}
	/>
{/if}
