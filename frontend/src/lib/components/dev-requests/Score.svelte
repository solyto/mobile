<script lang="ts">
	import IconChevronDown from '$lib/icons/lucide/chevron-down.svelte';
	import IconChevronUp from '$lib/icons/lucide/chevron-up.svelte';
	import type { DevRequest } from '$lib/types/dev_request';
	import { getDevRequests } from '$lib/state/DevRequests.svelte';

	const devRequests = getDevRequests();

	const IDLE = 'text-c-neutral-3 hover:text-black dark:hover:text-white';

	let { entry }: { entry: DevRequest } = $props();

	async function handleUpvote(): Promise<void> {
		await devRequests.vote(entry, 'up');
	}

	async function handleDownvote(): Promise<void> {
		await devRequests.vote(entry, 'down');
	}
</script>

<div class="flex flex-row items-center gap-1">
	<button
		onclick={handleUpvote}
		class="cursor-pointer transition-all hover:md:translate-y-[-2px] {entry.user_vote === 'up' ? 'text-green-500' : IDLE}"
	>
		<IconChevronUp class="h-5 w-5" />
	</button>
	<div class="min-w-6 text-center text-c-btn-hover">
		<span>{entry.score}</span>
	</div>
	<button
		onclick={handleDownvote}
		class="cursor-pointer transition-all hover:md:translate-y-[2px] {entry.user_vote === 'down' ? 'text-red-500' : IDLE}"
	>
		<IconChevronDown class="h-5 w-5" />
	</button>
</div>
