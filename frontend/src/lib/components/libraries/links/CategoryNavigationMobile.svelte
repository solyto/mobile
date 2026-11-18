<script lang="ts">
	import { fly } from 'svelte/transition';
	import { getLinkLibrary, type LinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import HamburgerButton from '$lib/components/ui/buttons/HamburgerButton.svelte';

	type Filter = LinkLibrary['activeFilter'];

	const library = getLinkLibrary();
	const ts = getTranslation();

	const ROW = 'relative flex w-full cursor-pointer items-center border-b border-c-neutral-1 px-4 py-4 pr-16 text-left hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3';
	const ACTIVE = 'bg-c-neutral-1 dark:bg-s-dark-3';

	let open = $state(false);

	function openMenu(): void {
		open = true;
	}

	function close(): void {
		open = false;
	}

	function select(filter: Filter): void {
		if (filter === 'favorite') {
			library.filterByFavorite();
		} else {
			library.filterByCategory(filter);
		}
		close();
	}
</script>

{#snippet row(filter: Filter, label: string, count: number, color: string)}
	<button
		class="{ROW} {library.activeFilter === filter ? ACTIVE : ''}"
		aria-current={library.activeFilter === filter ? 'true' : undefined}
		onclick={() => select(filter)}
	>
		<span class="text-base">{label}</span>
		<Badge i={count} {color} top="14px" right="16px" />
	</button>
{/snippet}

<HamburgerButton onclick={openMenu} />

{#if open}
	<div
		class="secondary-nav-mobile-container fixed inset-x-0 top-0 bottom-16 z-50 flex flex-col bg-c-bg lg:hidden dark:bg-s-dark-1"
		transition:fly={{ x: -400, duration: 200 }}
	>
		<div class="flex shrink-0 items-center justify-between border-b border-c-neutral-2 p-4 dark:border-s-dark-3">
			<span class="text-2xl font-bold">{ts.get.libraries.navigation.links}</span>
			<CloseButton onClick={close} inModal={false} />
		</div>
		<div class="flex-1 overflow-y-auto">
			{@render row(null, ts.get.libraries.links.all, library.getCategoryCount(), 'var(--color-c-btn-hover)')}
			{@render row('favorite', ts.get.libraries.links.favorites, library.getFavoriteCount(), 'var(--color-c-warning)')}
			{@render row(0, ts.get.libraries.links.uncategorized, library.getCategoryCount(null), 'var(--color-c-btn)')}
			{#each library.categories as category (category.id)}
				{@render row(category.id, category.title, library.getCategoryCount(category.id), category.color ?? 'var(--color-c-primary)')}
			{/each}
		</div>
	</div>
{/if}
