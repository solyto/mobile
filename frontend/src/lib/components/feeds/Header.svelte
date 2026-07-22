<script lang="ts">
	import type { FeedSubscription } from '$lib/types/feed';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getFeeds } from '$lib/state/Feeds.svelte';
	import InlineEditButton from '$lib/components/ui/buttons/InlineEditButton.svelte';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ViewSwitcher from '$lib/components/ui/ViewSwitcher.svelte';

	const loadingIndicator = getLoadingIndicator();
	const feeds = getFeeds();
	const ts = getTranslation();

	let { feed } = $props<{
		feed: FeedSubscription | null;
	}>();

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
	{#if feed !== null}
		<div class="mr-auto text-xl font-bold max-lg:ml-14 max-sm:hidden">{feed.title}</div>
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
		onChange={(type) => feeds.changeView(type as any)}
	/>
</div>
