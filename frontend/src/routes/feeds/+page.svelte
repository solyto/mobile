<script lang="ts">
	import { getFeeds } from '$lib/state/Feeds.svelte';
	import { getFeedImport } from '$lib/state/FeedImport.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import FeedNavigation from '$lib/components/feeds/FeedNavigation.svelte';
	import FeedView from '$lib/components/feeds/FeedView.svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import EntryEdit from '$lib/components/feeds/EntryEdit.svelte';
	import FeedBrowserModal from '$lib/components/feeds/FeedBrowserModal.svelte';
	import FeedImportModal from '$lib/components/feeds/FeedImportModal.svelte';
	import Header from '$lib/components/feeds/Header.svelte';

	const feeds = getFeeds();
	const feedImport = getFeedImport();
	const ts = getTranslation();

	function closeEditor(): void {
		feeds.modalOpen = false;
		feeds.activeFeed = null;
	}
</script>

{#if feeds.browseOpen}
	<FeedBrowserModal />
{/if}
{#if feedImport.modalOpen}
	<FeedImportModal />
{/if}
{#if feeds.modalOpen}
	<ContentModal
		rounded="2xl"
		p="8"
		title={feeds.activeFeed ? ts.get.feeds.edit_feed : ts.get.feeds.add_feed}
		onClose={closeEditor}
	>
		<EntryEdit onClose={closeEditor} />
	</ContentModal>
{/if}
<div class="flex h-full w-full flex-row">
	<FeedNavigation />
	<div class="relative flex max-h-full w-full flex-col gap-4 overflow-y-auto p-4 lg:p-8">
		<div class="flex w-full items-center justify-between">
			<Header feed={feeds.activeFeed} />
		</div>
		<FeedView />
	</div>
</div>
