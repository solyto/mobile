<script lang="ts">
	import { slide, fade } from 'svelte/transition';
	import type {
		DevRequest,
		UpdateDevRequestRequest,
		DevRequestVote
	} from '$lib/types/dev_request';
	import { formatDate } from '$lib/helpers/DateHelper';
	import IconChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { getDevRequests } from '$lib/state/DevRequests.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { API_STORAGE_URL } from '$lib/config/apiRoutes';
	import { onDestroy, tick } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { nl2br } from '$lib/helpers/FormatHelper';
	import DOMPurify from 'dompurify';
	import Author from '$lib/components/dev-requests/Author.svelte';
	import Score from '$lib/components/dev-requests/Score.svelte';
	import Priority from '$lib/components/dev-requests/Priority.svelte';
	import Type from '$lib/components/dev-requests/Type.svelte';
	import Status from '$lib/components/dev-requests/Status.svelte';
	import Comments from '$lib/components/dev-requests/Comments.svelte';
	import IconMessageSquare from '@lucide/svelte/icons/message-square';

	const devRequests = getDevRequests();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();
	const auth = getAuth();

	const isAdmin = auth.isAdmin();

	let { entry, active = false } = $props<{
		entry: DevRequest;
		active?: boolean;
	}>();

	let open = $state<boolean>(active);
	let titleInput = $state<HTMLInputElement | null>(null);
	let titleValue = $state<string>(entry.title);
	let descriptionInput = $state<HTMLTextAreaElement | null>(null);
	let descriptionValue = $state<string>(entry.description);
	let changeTitle = $state<boolean>(false);
	let changeDescription = $state<boolean>(false);
	let keyHandlers = $state<{ [key: string]: string | null }>({
		Enter: null,
		EnterNewLine: null,
		Escape: null
	});

	async function toggleChange(toggleType: 'title' | 'description'): Promise<void> {
		if (toggleType === 'title') {
			changeTitle = !changeTitle;
			await tick();
			titleInput?.focus();
		} else {
			changeDescription = !changeDescription;
			await tick();
			descriptionInput?.focus();
		}

		keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter, { priority: 2 });
		keyHandlers.EnterNewLine = keyManager.registerKeyDown('Enter', handleNewLineEnter, {
			withHelperKey: 'Shift'
		});
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape);
	}

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function handleEnter(event: KeyboardEvent): Promise<void> {
		await onsubmit();
		changeTitle = false;
		changeDescription = false;
	}

	function handleNewLineEnter(event: KeyboardEvent): void {
		if (descriptionInput) {
			const start = descriptionInput.selectionStart;
			const end = descriptionInput.selectionEnd;
			descriptionValue =
				descriptionValue?.slice(0, start) + '\n' + descriptionValue?.slice(end);
			descriptionInput.selectionStart = descriptionInput.selectionEnd = start + 1;
		}
	}

	function handleEscape(event: KeyboardEvent): void {
		onblur();
	}

	function onblur(): void {
		changeTitle = false;
		changeDescription = false;
		keyManager.unregisterAll(keyHandlers);
	}

	async function onsubmit(): Promise<void> {
		loadingIndicator.start();
		keyManager.unregisterAll(keyHandlers);
		const title = titleValue.trim();
		const description = descriptionValue.trim();

		if (title === '' && description === '') {
			return;
		}

		const request: UpdateDevRequestRequest = {
			title: title !== entry.title ? title : undefined,
			description: description !== entry.description ? description : undefined
		};
		await devRequests.update(entry, request);
		loadingIndicator.stop();
	}
</script>

<div
	class="flex w-full flex-col gap-2 rounded-lg bg-c-neutral px-4 py-2 transition-all hover:bg-c-neutral-1 hover:shadow-sm dark:bg-s-dark-2 dark:hover:bg-s-dark-2"
	transition:fade
>
	<div class="flex w-full flex-col gap-2 md:flex-row md:items-center">
		<div class="flex flex-row items-center gap-2">
			<Score {entry} />
			<Priority {entry} editable={isAdmin} />
			<Type {entry} />
			<Status {entry} editable={isAdmin} />
			<IconChevronsUpDown
				class="ml-auto cursor-pointer text-c-btn md:hidden"
				onclick={() => (open = !open)}
			/>
		</div>
		<div class="mt-1 md:mt-0 md:ml-3 md:w-3/6">
			{#if isAdmin}
				{#if changeTitle}
					<input
						type="text"
						class="w-full dark:bg-s-dark-3 dark:text-white"
						{onblur}
						bind:this={titleInput}
						bind:value={titleValue}
					/>
				{:else}
					<button type="button" ondblclick={() => toggleChange('title')} class="cursor-pointer text-lg font-bold md:text-base">
						{entry.title}
					</button>
				{/if}
			{:else}
				<span class="text-lg font-bold md:text-base">{entry.title}</span>
			{/if}
		</div>
		<div class="flex flex-row items-center gap-4 md:ml-auto">
			<Author {entry} />
			<span class="text-sm text-c-neutral-5">{formatDate(entry.created_at)}</span>
			{#if entry.updated_at !== entry.created_at}
				<span class="text-sm text-c-btn">{formatDate(entry.updated_at)}</span>
			{/if}
			{#if entry.comment_count > 0}
				<span class="flex flex-row items-center gap-1 text-c-neutral-4">
					<IconMessageSquare class="h-4 w-4" />
					<span class="text-sm">{entry.comment_count}</span>
				</span>
			{/if}
			<IconChevronsUpDown
				class="hidden cursor-pointer text-c-btn md:block"
				onclick={() => (open = !open)}
			/>
		</div>
	</div>
	{#if open}
		<div class="flex w-full flex-col" transition:slide>
			<div class="mt-2 flex w-full flex-row gap-8" class:min-h-32={entry.screenshot}>
				{#if entry.screenshot}
					<button
						class="transition-opacity hover:opacity-75"
						onclick={() =>
							window.open(API_STORAGE_URL + '/' + entry.screenshot, '_blank')}
					>
						<img
							src={API_STORAGE_URL + '/' + entry.screenshot}
							alt="Screenshot"
							class="aspect-auto w-32 rounded-lg object-cover"
						/>
					</button>
				{/if}
				{#if isAdmin}
					{#if changeDescription}
						<textarea
							class="w-full dark:bg-s-dark-3 dark:text-white"
							{onblur}
							bind:this={descriptionInput}
							bind:value={descriptionValue}
						></textarea>
					{:else}
						<button
							type="button"
							class="w-full cursor-pointer pt-4 text-left"
							ondblclick={() => toggleChange('description')}
						>
							{@html DOMPurify.sanitize(nl2br(entry.description))}
						</button>
					{/if}
				{:else}
					<div class="w-full pt-4">
						{@html DOMPurify.sanitize(nl2br(entry.description))}
					</div>
				{/if}
			</div>
			<Comments {entry} />
		</div>
	{/if}
</div>
