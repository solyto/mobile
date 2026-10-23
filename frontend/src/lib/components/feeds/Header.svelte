<script lang="ts">
	import type { FeedEntrySize, FeedSubscription } from '$lib/types/feed';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getFeeds } from '$lib/state/Feeds.svelte';
	import InlineEditButton from '$lib/components/ui/buttons/InlineEditButton.svelte';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ViewSwitcher from '$lib/components/ui/ViewSwitcher.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';

	const loadingIndicator = getLoadingIndicator();
	const feeds = getFeeds();
	const ts = getTranslation();

	let { feed }: {
		feed: FeedSubscription | null;
	} = $props();

	async function onDelete(): Promise<void> {
		loadingIndicator.start();
		await feeds.delete(feed!);
		loadingIndicator.stop();
	}

	const views = [
		{ type: 'compact' as const, title: ts.get.feeds.view_compact },
		{ type: 'comfortable' as const, title: ts.get.feeds.view_comfortable },
		{ type: 'card' as const, title: ts.get.feeds.view_card }
	];
</script>

<div class="flex min-h-8 w-full items-center justify-end gap-2">
	<div class="mr-auto max-lg:ml-14 max-sm:hidden">
		<Heading title={feed?.title ?? ts.get.feeds.all_feeds} my={0} />
	</div>
	{#if feed !== null}
		<div class="mr-4 flex gap-2">
			<InlineEditButton
				onClick={() => {
					feeds.modalOpen = true;
				}}
			/>
			<InlineDeleteButton onClick={onDelete} />
		</div>
	{/if}
	<ViewSwitcher
		{views}
		currentlySelected={feeds.view}
		onChange={(type) => feeds.changeView(type as FeedEntrySize)}
	/>
</div>
