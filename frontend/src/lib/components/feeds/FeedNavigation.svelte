<script lang="ts">
	import { fade } from 'svelte/transition';
	import IconFunnel from '@lucide/svelte/icons/funnel';
	import IconPlus from '@lucide/svelte/icons/plus';
	import IconSearch from '@lucide/svelte/icons/search';
	import { getFeeds } from '$lib/state/Feeds.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Divider from '$lib/components/ui/Divider.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import FunnelButton from '$lib/components/ui/buttons/FunnelButton.svelte';

	const ts = getTranslation();
	const feeds = getFeeds();

	let navigation = $state<HTMLDivElement | null>(null);

	function toggleMobile(): void {
		if (navigation) {
			navigation.style.display = 'block';
		}
	}

	function handleNavigation(): void {
		if (navigation && navigation.style.display === 'block') {
			navigation.style.display = 'none';
		}
	}
</script>

<FunnelButton onclick={toggleMobile} top={3} />
<div
	class="absolute z-50 hidden h-full max-h-screen w-full flex-col overflow-y-auto bg-c-bg max-md:pb-20 drop-shadow-xl lg:relative lg:flex lg:w-32 lg:p-2 2xl:w-60 2xl:p-4 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
	in:fade
	bind:this={navigation}
>
	<div class="flex items-center justify-between border-b border-c-neutral-2 p-4 mb-4 lg:hidden dark:border-s-dark-3">
		<span class="text-2xl font-bold 2xl:font-normal">{ts.get.feeds.feeds}</span>
		<CloseButton onClick={() => handleNavigation()} inModal={false} />
	</div>

	<div class="p-4 lg:p-0">
		<button
			type="button"
			class="w-full cursor-pointer text-left"
			onclick={() => {
				feeds.selectFeed(null);
				handleNavigation();
			}}
		>
			<div
				class="
					rounded-lg p-2 hover:bg-c-neutral-1 dark:hover:bg-s-dark-3
					{feeds.activeFeed === null ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}
				"
			>
				{ts.get.feeds.all_feeds}
			</div>
		</button>
		<div class="mt-2 p-2 text-base font-bold 2xl:text-2xl 2xl:font-normal">
			{ts.get.feeds.feeds}
		</div>
		{#each feeds.feeds as feed (feed.id)}
			<button
				type="button"
				class="w-full cursor-pointer text-left"
				onclick={() => {
					feeds.selectFeed(feed);
					handleNavigation();
				}}
			>
				<div
					class="
						relative mr-1 max-md:mr-4 rounded-lg p-2 hover:bg-c-neutral-1 dark:hover:bg-s-dark-3
						{feeds.activeFeed !== null && feeds.activeFeed.id === feed.id ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}
					"
				>
					<Badge
						i={feeds.getFeedCount(feed)}
						color="var(--color-c-neutral-1)"
						top="7px"
						light={true}
					/>
					{feed.title}
				</div>
			</button>
		{/each}
		<Divider />
		<div class="flex flex-col gap-1 text-sm">
			<button
				class="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-left hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
				onclick={() => {
					feeds.modalOpen = true;
					handleNavigation();
				}}
			>
				<IconPlus size={16} class="shrink-0 text-c-neutral-5 dark:text-c-neutral-4" />
				{ts.get.feeds.add_feed}
			</button>
			<button
				class="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-left hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
				onclick={() => {
					feeds.browseOpen = true;
					handleNavigation();
				}}
			>
				<IconSearch size={16} class="shrink-0 text-c-neutral-5 dark:text-c-neutral-4" />
				{ts.get.feeds.browse_feeds}
			</button>
		</div>
	</div>
</div>
