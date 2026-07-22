<script lang="ts">
	import { blur } from 'svelte/transition';
	import type { DevRequest, DevRequestComment } from '$lib/types/dev_request';
	import { getDevRequests } from '$lib/state/DevRequests.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { formatDate } from '$lib/helpers/DateHelper';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';

	let { entry } = $props<{ entry: DevRequest }>();

	const devRequests = getDevRequests();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();

	let comments = $state<DevRequestComment[]>([]);
	let newComment = $state<string>('');
	let submitting = $state<boolean>(false);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null, Escape: null });

	onMount(async () => {
		loadingIndicator.start();
		setTimeout(async () => {
			await load();
			loadingIndicator.stop();
		}, 500);

		keyHandlers.Enter = keyManager.registerKeyDown('Enter', submitComment);
	});

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function submitComment(): Promise<void> {
		if (newComment.trim() === '' || submitting) return;

		submitting = true;
		const res = await devRequests.createComment(entry, newComment.trim());
		if (res) comments = await devRequests.loadComments(entry);
		newComment = '';
		submitting = false;
	}

	async function load(): Promise<void> {
		const res = await devRequests.loadComments(entry);
		if (res) comments = res;
	}
</script>

<div class="mt-2 w-full border-t border-c-neutral-2 pt-4 dark:border-s-dark-3">
	<div class="flex flex-col gap-3">
		{#if comments.length > 0}
			<div class="flex flex-col gap-2" in:blur>
				{#each comments as comment (comment.id)}
					<div class="flex flex-col gap-1 rounded bg-white p-3 dark:bg-s-dark-3">
						<div class="flex flex-row items-center gap-2 text-sm">
							<span class="font-medium">{comment.user.name}</span>
							<span class="text-c-neutral-4">{formatDate(comment.created_at)}</span>
						</div>
						<p class="text-sm">{comment.content}</p>
					</div>
				{/each}
			</div>
		{:else}
			<span class="text-sm text-c-neutral-4">{ts.get.dev.requests.comments_empty}</span>
		{/if}

		<div class="mt-2 flex flex-row items-center gap-2">
			<TextInput
				placeholder={ts.get.dev.requests.comments_placeholder}
				bind:value={newComment}
			/>
			<TextButton onclick={submitComment} title={ts.get.dev.requests.comments_submit} />
		</div>
	</div>
</div>
