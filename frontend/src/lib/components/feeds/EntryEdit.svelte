<script lang="ts">
	import { scale } from 'svelte/transition';
	import { getFeeds } from '$lib/state/Feeds.svelte';
	import type {
		CreateFeedSubscriptionRequest,
		FeedTestItem,
		UpdateFeedSubscriptionRequest
	} from '$lib/types/feed';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import MultiSelect, { type MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import { formatKeywords, parseKeywords } from '$lib/helpers/FeedHelper';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const feeds = getFeeds();

	let { onClose }: {
		onClose: () => void;
	} = $props();

	let titleValue = $state<string>(feeds.activeFeed?.title ?? '');
	let urlValue = $state<string>(feeds.activeFeed?.url ?? '');
	let keywordsValue = $state<MultiSelectEntry[]>(toEntries(feeds.activeFeed?.whitelist ?? null));
	let blacklistValue = $state<MultiSelectEntry[]>(toEntries(feeds.activeFeed?.blacklist ?? null));
	let feedTestItems = $state<FeedTestItem[]>([]);
	let feedTested = $state<boolean>(false);
	const saving = new SaveAction(() => (feeds.activeFeed ? ts.get.feeds.feed_update_error : ts.get.feeds.feed_add_error));

	function toEntries(list: string | null): MultiSelectEntry[] {
		return parseKeywords(list).map((keyword) => ({ label: keyword, value: keyword }));
	}

	function fromEntries(entries: MultiSelectEntry[]): string {
		return formatKeywords(entries.map((entry) => entry.value));
	}

	async function saveFeed(): Promise<boolean> {
		if (feeds.activeFeed) {
			const request: UpdateFeedSubscriptionRequest = {
				title: titleValue,
				whitelist: fromEntries(keywordsValue),
				blacklist: fromEntries(blacklistValue)
			};
			return feeds.update(feeds.activeFeed, request);
		}

		const request: CreateFeedSubscriptionRequest = {
			title: titleValue,
			url: urlValue,
			whitelist: fromEntries(keywordsValue),
			blacklist: fromEntries(blacklistValue)
		};
		return feeds.create(request);
	}

	async function onSave(): Promise<void> {
		const saved = await saving.run(saveFeed);
		if (!saved) return;

		notifications.success(feeds.activeFeed ? ts.get.feeds.feed_update_success : ts.get.feeds.feed_add_success);
		onClose();
	}

	async function testFeed(): Promise<void> {
		if (urlValue === '') {
			return;
		}

		loadingIndicator.start();
		try {
			const res = await feeds.testFeed(urlValue);
			if (res === null || res.length === 0) {
				notifications.error(ts.get.feeds.test_feed_error);
				return;
			}

			feedTestItems = res;
			feedTested = true;
		} finally {
			loadingIndicator.stop();
		}
	}
</script>

<div class="flex flex-col gap-1">
	<TextInput placeholder={ts.get.feeds.title} bind:value={titleValue} />
	{#if !feeds.activeFeed}
		<TextInput placeholder={ts.get.feeds.url} bind:value={urlValue} />
	{:else}
		<div class="p-2 text-sm text-c-neutral-4 dark:text-c-neutral-5">
			{urlValue}
		</div>
	{/if}
	<div class="mt-4 flex flex-col gap-2">
		<div class="flex flex-col pl-1">
			<span class="font-bold text-c-neutral-5 dark:text-c-neutral-4">{ts.get.feeds.keywords}</span>
			<span class="text-sm text-c-neutral-4 dark:text-c-neutral-5">{ts.get.feeds.keywords_description}</span>
		</div>
		<MultiSelect
			bind:value={keywordsValue}
			options={[]}
			allowUserOptions={true}
			placeholder={ts.get.feeds.keywords_placeholder}
		/>
	</div>
	<div class="mt-2 flex flex-col gap-1">
		<div class="flex flex-col pl-1">
			<span class="font-bold text-c-neutral-5 dark:text-c-neutral-4">{ts.get.feeds.blacklist}</span>
			<span class="text-sm text-c-neutral-4 dark:text-c-neutral-5">{ts.get.feeds.blacklist_description}</span>
		</div>
		<MultiSelect
			bind:value={blacklistValue}
			options={[]}
			allowUserOptions={true}
			placeholder={ts.get.feeds.blacklist_placeholder}
		/>
	</div>
	{#if feedTested}
		<div class="mt-4 flex max-w-96 flex-col gap-2 px-1" in:scale>
			<span class="font-bold text-c-neutral-5 dark:text-c-neutral-4">{ts.get.feeds.feed_preview}</span>
			{#each feedTestItems as item, i (i)}
				<div class="w-full text-sm">
					{item.title}
				</div>
			{/each}
		</div>
	{/if}
	<div class="mt-8 flex w-full flex-row items-center justify-end">
		{#if feeds.activeFeed || feedTested}
			{#if !feeds.activeFeed}
				<span class="mr-4 text-sm">{ts.get.feeds.test_feed_looks_right}</span>
			{/if}
			<TextButton title={ts.get.layout.save} onclick={onSave} />
		{:else}
			<TextButton title={ts.get.feeds.test_feed} onclick={testFeed} />
		{/if}
	</div>
</div>
