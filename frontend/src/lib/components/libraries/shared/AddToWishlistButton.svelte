<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';

	const ts = getTranslation();
	const notifications = getUiNotifications();

	let { add }: { add: () => Promise<boolean> } = $props();

	let adding = $state<boolean>(false);
	let added = $state<boolean>(false);

	async function addToWishlist() {
		adding = true;
		const ok = await add();
		adding = false;
		if (ok) {
			added = true;
		} else {
			notifications.error(ts.get.libraries.add_to_wishlist_error);
		}
	}
</script>

<button
	class="group mt-2 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-1 p-2 text-sm font-bold shadow-sm transition-all disabled:cursor-not-allowed dark:border-s-dark-3 {added ? 'border-c-primary text-c-primary' : 'border-c-neutral hover:text-c-btn'}"
	onclick={addToWishlist}
	disabled={adding || added}
>
	{#if added}
		<svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
	{:else if adding}
		<svg xmlns="http://www.w3.org/2000/svg" class="size-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" class="size-6 group-hover:animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path></svg>
	{/if}
	{added ? ts.get.libraries.added_to_wishlist : ts.get.libraries.add_to_wishlist}
</button>
