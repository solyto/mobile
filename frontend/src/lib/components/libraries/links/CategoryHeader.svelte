<script lang="ts">
	import { getLinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import NavIndicator from '$lib/components/ui/NavIndicator.svelte';
	import CategoryCreate from '$lib/components/libraries/links/CategoryCreate.svelte';
	import CategoryNavigationMobile from '$lib/components/libraries/links/CategoryNavigationMobile.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconTrash from '$lib/icons/lucide/trash.svelte';
	import type { LinkCategory } from '$lib/types/library_link';

	const library = getLinkLibrary();
	const ts = getTranslation();

	const TAB = 'relative cursor-pointer touch-manipulation gap-2 rounded-sm bg-c-bg-surface px-6 py-3 font-bold border-1 border-c-neutral-1 drop-shadow-sm transition-all hover:bg-c-neutral max-md:w-full dark:border-transparent dark:hover:bg-s-dark-2';
	const UNCATEGORIZED = 0;
	const UNCATEGORIZED_COLOR = 'var(--color-c-btn)';

	function categoryColor(category: LinkCategory): string {
		return category.color ?? 'var(--color-c-primary)';
	}

	function ringStyle(target: number, color: string): string {
		return library.dragTarget === target ? `--tw-ring-color: ${color};` : '';
	}

	function showFavorites(): void {
		library.filterByFavorite();
	}

	function dragOver(event: DragEvent, target: number): void {
		event.preventDefault();
		event.stopPropagation();
		library.dragTarget = target;
	}

	function clearDragTarget(): void {
		library.dragTarget = null;
	}

	function drop(event: DragEvent): void {
		event.preventDefault();
		library.dragToCategory();
	}

	function deleteCategory(event: MouseEvent, category: LinkCategory): void {
		event.stopPropagation();
		library.deleteCategory(category);
	}
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-5 max-md:hidden">
	<div
		role="button"
		tabindex="0"
		class={TAB}
		onclick={() => library.filterByCategory(null)}
	>
		{ts.get.libraries.links.all}
		<Badge i={library.getCategoryCount()} color="var(--color-c-btn-hover)" />
		<NavIndicator active={library.activeFilter === null} edge="bottom" color="var(--color-c-btn-hover)" />
	</div>
	<div
		role="button"
		tabindex="0"
		class={TAB}
		onclick={showFavorites}
	>
		{ts.get.libraries.links.favorites}
		<Badge i={library.getFavoriteCount()} color="var(--color-c-warning)" />
		<NavIndicator active={library.activeFilter === 'favorite'} edge="bottom" color="var(--color-c-warning)" />
	</div>
	<div
		role="button"
		tabindex="0"
		class={TAB}
		class:ring-2={library.dragTarget === UNCATEGORIZED}
		style={ringStyle(UNCATEGORIZED, UNCATEGORIZED_COLOR)}
		ondragover={(e: DragEvent) => dragOver(e, UNCATEGORIZED)}
		ondragenter={clearDragTarget}
		ondragleave={clearDragTarget}
		ondrop={drop}
		onclick={() => library.filterByCategory(UNCATEGORIZED)}
	>
		{ts.get.libraries.links.uncategorized}
		<Badge i={library.getCategoryCount(null)} color={UNCATEGORIZED_COLOR} />
		<NavIndicator active={library.activeFilter === UNCATEGORIZED} edge="bottom" color={UNCATEGORIZED_COLOR} />
	</div>
	{#each library.categories as category (category.id)}
		<div
			role="button"
			tabindex="0"
			class="group {TAB}"
			class:ring-2={library.dragTarget === category.id}
			style={ringStyle(category.id, categoryColor(category))}
			ondragover={(e: DragEvent) => dragOver(e, category.id)}
			ondragenter={clearDragTarget}
			ondragleave={clearDragTarget}
			ondrop={drop}
			onclick={() => library.filterByCategory(category.id)}
		>
			{category.title}
			<Badge i={library.getCategoryCount(category.id)} color={categoryColor(category)} />
			<NavIndicator active={library.activeFilter === category.id} edge="bottom" color={categoryColor(category)} />
			<div
				class="absolute right-[-9px] bottom-[-4px] opacity-0 transition-all group-hover:opacity-100"
			>
				<button
					type="button"
					class="z-40 flex size-[24px] cursor-pointer items-center justify-center rounded-full bg-c-danger text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
					onclick={(e) => deleteCategory(e, category)}
				>
					<IconTrash class="size-4" />
				</button>
			</div>
		</div>
	{/each}
	<CategoryCreate />
</div>
<div class="md:hidden">
	<CategoryNavigationMobile />
</div>
