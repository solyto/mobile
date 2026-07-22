<script lang="ts">
	import IconChevronDown from '@lucide/svelte/icons/chevron-down';
	import IconChevronUp from '@lucide/svelte/icons/chevron-up';
	import type { DevRequest, DevRequestVote } from '$lib/types/dev_request';
	import { getDevRequests } from '$lib/state/DevRequests.svelte';

	const devRequests = getDevRequests();

	let { entry } = $props<{ entry: DevRequest }>();

	async function handleUpvote(): Promise<void> {
		await devRequests.vote(entry, 'up');
	}

	async function handleDownvote(): Promise<void> {
		await devRequests.vote(entry, 'down');
	}
</script>

<div class="flex flex-row items-center gap-1 md:mr-2 md:flex-col">
	<button
		onclick={handleUpvote}
		class="cursor-pointer transition-all hover:md:translate-y-[-2px] {entry.user_vote === 'up'
			? 'text-green-500'
			: 'text-c-neutral-3 hover:text-black dark:hover:text-white'}"
	>
		<IconChevronUp class="h-5 w-5" />
	</button>
	<div class="min-w-6 text-center text-c-btn-hover">
		<span>{entry.score}</span>
	</div>
	<button
		onclick={handleDownvote}
		class="cursor-pointer transition-all hover:md:translate-y-[2px] {entry.user_vote === 'down'
			? 'text-red-500'
			: 'text-c-neutral-3 hover:text-black dark:hover:text-white'}"
	>
		<IconChevronDown class="h-5 w-5" />
	</button>
</div>
