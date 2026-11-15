<script lang="ts">
	import { onMount } from 'svelte';
	import IconLoaderCircle from '@lucide/svelte/icons/loader-circle';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import FileUpload from '$lib/components/forms/FileUpload.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import FeedImportService, { type FeedImportFailureReason } from '$lib/services/FeedImportService';
	import { NetworkError } from '$lib/services/ApiService';
	import { getFeedImport } from '$lib/state/FeedImport.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import type { FeedImportPollError, FeedImportStage, FeedImportState } from '$lib/types/feed';

	type View = 'picker' | 'preview' | 'import' | 'unavailable';

	const MUTED = 'text-xs text-c-neutral-5 dark:text-c-neutral-4';

	const ts = getTranslation();
	const feedImport = getFeedImport();
	const loadingIndicator = getLoadingIndicator();
	const service = new FeedImportService();

	let view = $state<View | null>(null);
	let selected = $state<string[]>([]);
	let error = $state<string | null>(null);
	let busy = $state(false);
	let shown = $derived(view === 'import' ? importView() : view);
	let result = $derived(shown === 'result' && feedImport.state ? service.group(feedImport.state) : null);

	onMount(open);

	async function open(): Promise<void> {
		loadingIndicator.start();
		try {
			const found = await feedImport.refresh();
			showStage(found ? feedImport.state?.stage : undefined);
		} catch {
			error = ts.get.feeds.import_error_generic;
			view = 'unavailable';
		} finally {
			loadingIndicator.stop();
		}
	}

	function retry(): void {
		error = null;
		open();
	}

	function showStage(stage: FeedImportStage | undefined): void {
		switch (stage) {
			case 'running':
				view = 'import';
				feedImport.startPolling();
				break;
			case 'finished':
				view = 'import';
				break;
			default:
				view = 'picker';
		}
	}

	function importView(): 'progress' | 'result' | 'failed' {
		if (feedImport.state?.stage === 'finished') return 'result';
		return feedImport.stalled ? 'failed' : 'progress';
	}

	function message(): string | null {
		switch (shown) {
			case 'result':
				return null;
			case 'failed':
				return ts.get.feeds.import_error_generic;
			case 'progress':
				return feedImport.pollError ? pollErrorMessage(feedImport.pollError) : error;
			default:
				return error;
		}
	}

	async function upload(file: File): Promise<boolean> {
		if (busy) return false;

		busy = true;
		error = null;
		loadingIndicator.start();
		try {
			const res = await feedImport.upload(file);
			if (res.ok && feedImport.state) {
				selected = service.initialSelection(feedImport.state);
				view = 'preview';
				return true;
			}
			error = errorMessage(res.status);
			if (res.status === 409) {
				const found = await feedImport.refresh();
				showStage(found ? feedImport.state?.stage : undefined);
			}
			return false;
		} catch (e) {
			error = networkErrorMessage(e);
			return false;
		} finally {
			busy = false;
			loadingIndicator.stop();
		}
	}

	async function startImport(): Promise<void> {
		if (busy) return;

		busy = true;
		error = null;
		loadingIndicator.start();
		try {
			const res = await feedImport.select(selected);
			if (res.ok) {
				view = 'import';
				feedImport.startPolling();
				return;
			}
			error = errorMessage(res.status);
			if (res.status === 429) return;
			feedImport.reset();
			view = 'picker';
		} catch (e) {
			error = networkErrorMessage(e);
		} finally {
			busy = false;
			loadingIndicator.stop();
		}
	}

	function errorMessage(status: number): string {
		switch (status) {
			case 422:
				return ts.get.feeds.import_error_unreadable;
			case 409:
				return ts.get.feeds.import_error_running;
			case 429:
				return ts.get.feeds.import_error_rate_limited;
			default:
				return ts.get.feeds.import_error_generic;
		}
	}

	function networkErrorMessage(e: unknown): string {
		if (!(e instanceof NetworkError)) throw e;
		return ts.get.layout.network_error;
	}

	function pollErrorMessage(pollError: FeedImportPollError): string {
		return pollError === 'rate_limited' ? ts.get.layout.rate_limited : ts.get.layout.network_error;
	}

	function toggle(url: string): void {
		selected = service.toggle(selected, url);
	}

	function toggleAll(): void {
		if (!feedImport.state) return;
		selected = service.toggleAll(feedImport.state, selected);
	}

	function toggleAllLabel(state: FeedImportState): string {
		return service.allSelected(state, selected) ? ts.get.feeds.import_select_none : ts.get.feeds.import_select_all;
	}

	function selectedLabel(): string {
		return selected.length === 1
			? ts.get.feeds.import_selected_singular
			: ts.get.feeds.import_selected_plural.replace('{n}', String(selected.length));
	}

	function progressLabel(state: FeedImportState): string {
		return ts.get.feeds.import_progress.replace('{n}', String(state.processed)).replace('{total}', String(state.total));
	}

	function withCount(text: string, count: number): string {
		return text.replace('{n}', String(count));
	}

	function reasonLabel(reason: FeedImportFailureReason): string {
		switch (reason) {
			case 'unreachable':
				return ts.get.feeds.import_reason_unreachable;
			case 'limit_reached':
				return ts.get.feeds.import_reason_limit_reached;
			default:
				return ts.get.feeds.import_reason_not_a_feed;
		}
	}

	function importAnother(): void {
		feedImport.reset();
		selected = [];
		error = null;
		view = 'picker';
	}

	function close(): void {
		feedImport.modalOpen = false;
	}
</script>

{#snippet heading(text: string)}
	<h3 class="text-sm font-semibold text-c-heading dark:text-c-primary">{text}</h3>
{/snippet}

{#snippet leaveActions()}
	<div class="flex justify-end gap-2">
		<TextButton title={ts.get.feeds.import_another} onclick={importAnother} />
		<TextButton type="primary" title={ts.get.feeds.import_close} onclick={close} />
	</div>
{/snippet}

<ContentModal title={ts.get.feeds.import_opml} onClose={close} rounded="2xl" p="8" width="2xl">
	<div class="flex flex-col gap-4">
		{#if message()}
			<p class="text-sm text-c-danger" role="alert">{message()}</p>
		{/if}

		{#if shown === null}
			<div class="flex justify-center py-8">
				<IconLoaderCircle class="animate-spin text-c-neutral-5" />
			</div>
		{:else if shown === 'picker'}
			<p class="text-sm">{ts.get.feeds.import_hint}</p>
			<FileUpload accept=".opml,.xml" onfile={upload} />
		{:else if shown === 'preview' && feedImport.state}
			{@const importState = feedImport.state}
			{#if service.initialSelection(importState).length === 0}
				<p class="text-sm">{ts.get.feeds.import_all_subscribed}</p>
			{:else}
				<div class="flex items-center justify-between gap-4">
					<TextButton type="plain" title={toggleAllLabel(importState)} onclick={toggleAll} />
					<span class={MUTED}>{selectedLabel()}</span>
				</div>
			{/if}
			<div class="flex max-h-[50vh] flex-col gap-1 overflow-y-auto">
				{#each importState.feeds as feed, i (feed.url)}
					<div class="flex items-center gap-3 rounded-lg p-2">
						<Checkbox
							id="feed-import-{i}"
							ariaLabel={feed.title || feed.url}
							isChecked={selected.includes(feed.url)}
							disabled={feed.already_subscribed}
							onchange={() => toggle(feed.url)}
						/>
						<label
							for="feed-import-{i}"
							class="flex min-w-0 flex-1 flex-col"
							class:cursor-pointer={!feed.already_subscribed}
							class:opacity-60={feed.already_subscribed}
						>
							<span class="truncate">{feed.title}</span>
							<span class="truncate {MUTED}">{feed.url}</span>
						</label>
						{#if feed.already_subscribed}
							<span class="shrink-0 {MUTED}">{ts.get.feeds.import_already_subscribed}</span>
						{/if}
					</div>
				{/each}
			</div>
			{#if service.initialSelection(importState).length === 0}
				{@render leaveActions()}
			{:else}
				<TextButton type="primary" title={ts.get.feeds.import_button} disabled={busy || selected.length === 0} onclick={startImport} />
			{/if}
		{:else if shown === 'progress' && feedImport.state}
			<p class="text-sm">{progressLabel(feedImport.state)}</p>
			<ProgressBar value={service.progress(feedImport.state)} label={progressLabel(feedImport.state)} />
		{:else if shown === 'result' && result}
			{@render heading(withCount(ts.get.feeds.import_result_added, result.added.length))}
			{#if result.alreadySubscribed.length > 0}
				{@render heading(withCount(ts.get.feeds.import_result_already_subscribed, result.alreadySubscribed.length))}
			{/if}
			{#if result.failed.length > 0}
				{@render heading(withCount(ts.get.feeds.import_result_failed, result.failed.length))}
				<div class="flex max-h-[40vh] flex-col gap-2 overflow-y-auto">
					{#each result.failed as failure (failure.url)}
						<div class="flex min-w-0 flex-col">
							<span class="truncate">{failure.title}</span>
							<span class="truncate {MUTED}">{failure.url}</span>
							<span class="text-xs text-c-danger">{reasonLabel(failure.reason)}</span>
						</div>
					{/each}
				</div>
			{/if}
			{@render leaveActions()}
		{:else if shown === 'failed'}
			{@render leaveActions()}
		{:else if shown === 'unavailable'}
			<div class="flex justify-end gap-2">
				<TextButton title={ts.get.feeds.import_close} onclick={close} />
				<TextButton type="primary" title={ts.get.feeds.import_retry} onclick={retry} />
			</div>
		{/if}
	</div>
</ContentModal>
