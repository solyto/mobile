<script lang="ts">
	import { getLinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import NavIndicator from '$lib/components/ui/NavIndicator.svelte';
	import CategoryCreate from '$lib/components/libraries/links/CategoryCreate.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconTrash from '@lucide/svelte/icons/trash-2';

	const library = getLinkLibrary();
	const ts = getTranslation();

	const TAB = 'relative cursor-pointer touch-manipulation gap-2 rounded-sm bg-c-bg-surface px-6 py-3 font-bold border-1 border-c-neutral-1 drop-shadow-sm transition-all hover:bg-c-neutral max-md:w-full dark:border-transparent dark:hover:bg-s-dark-2';
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
		onclick={() => library.filterByFavorite()}
	>
		{ts.get.libraries.links.favorites}
		<Badge i={library.getFavoriteCount()} color="var(--color-c-warning)" />
		<NavIndicator active={library.activeFilter === 'favorite'} edge="bottom" color="var(--color-c-warning)" />
	</div>
	<div
		role="button"
		tabindex="0"
		class={TAB}
		class:ring-2={library.dragTarget === 0}
		style={library.dragTarget === 0 ? `--tw-ring-color: var(--color-c-btn);` : ''}
		ondragover={(e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			library.dragTarget = 0;
		}}
		ondragenter={() => (library.dragTarget = null)}
		ondragleave={() => (library.dragTarget = null)}
		ondrop={(e: DragEvent) => {
			e.preventDefault();
			library.dragToCategory();
		}}
		onclick={() => library.filterByCategory(0)}
	>
		{ts.get.libraries.links.uncategorized}
		<Badge i={library.getCategoryCount(null)} color="var(--color-c-btn)" />
		<NavIndicator active={library.activeFilter === 0} edge="bottom" color="var(--color-c-btn)" />
	</div>
	{#each library.categories as category, i (category.id)}
		<div
			role="button"
			tabindex="0"
			class="group {TAB}"
			class:ring-2={library.dragTarget === category.id}
			style={library.dragTarget === category.id
				? `--tw-ring-color: ${category.color ?? 'var(--color-c-primary)'};`
				: ''}
			ondragover={(e: DragEvent) => {
				e.preventDefault();
				e.stopPropagation();
				library.dragTarget = category.id;
			}}
			ondragenter={() => (library.dragTarget = null)}
			ondragleave={() => (library.dragTarget = null)}
			ondrop={(e: DragEvent) => {
				e.preventDefault();
				library.dragToCategory();
			}}
			onclick={() => library.filterByCategory(category.id)}
		>
			{category.title}
			<Badge
				i={library.getCategoryCount(category.id)}
				color={category.color ?? 'var(--color-c-primary)'}
			/>
			<NavIndicator active={library.activeFilter === category.id} edge="bottom" color={category.color ?? 'var(--color-c-primary)'} />
			<div
				class="absolute right-[-9px] bottom-[-4px] opacity-0 transition-all group-hover:opacity-100"
			>
				<button
					type="button"
					class="z-40 flex size-[24px] cursor-pointer items-center justify-center rounded-full bg-c-danger text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
					onclick={(e) => {
						e.stopPropagation();
						library.deleteCategory(category);
					}}
				>
					<IconTrash class="size-4" />
				</button>
			</div>
		</div>
	{/each}
	<CategoryCreate />
</div>
