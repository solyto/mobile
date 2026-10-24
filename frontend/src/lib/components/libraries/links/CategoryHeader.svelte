<script lang="ts">
	import { getLinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import CategoryCreate from '$lib/components/libraries/links/CategoryCreate.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconTrash from '@lucide/svelte/icons/trash-2';

	const library = getLinkLibrary();
	const ts = getTranslation();
</script>

<div class="flex w-full items-center gap-4 overflow-x-auto p-2 pt-3 pb-4 max-md:hidden">
	<div
		role="button"
		tabindex="0"
		class="relative cursor-pointer touch-manipulation gap-2 rounded-sm bg-c-bg-surface p-8 font-bold drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral max-md:w-full dark:hover:bg-s-dark-2"
		onclick={() => library.filterByCategory(null)}
	>
		{ts.get.libraries.links.all}
		<Badge i={library.getCategoryCount()} color="var(--color-c-btn-hover)" />
		<div
			class="absolute bottom-0 left-0 h-1 w-full rounded-lg bg-[var(--color-c-btn-hover)] opacity-0 transition-all"
			class:opacity-100={library.activeFilter === null}
		></div>
	</div>
	<div
		role="button"
		tabindex="0"
		class="relative cursor-pointer touch-manipulation gap-2 rounded-sm bg-c-bg-surface p-8 font-bold drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral max-md:w-full dark:hover:bg-s-dark-2"
		onclick={() => library.filterByFavorite()}
	>
		{ts.get.libraries.links.favorites}
		<Badge i={library.getFavoriteCount()} color="var(--color-c-warning)" />
		<div
			class="absolute bottom-0 left-0 h-1 w-full rounded-lg bg-[var(--color-c-warning)] opacity-0 transition-all"
			class:opacity-100={library.activeFilter === 'favorite'}
		></div>
	</div>
	<div
		role="button"
		tabindex="0"
		class="relative cursor-pointer touch-manipulation gap-2 rounded-sm bg-c-bg-surface p-8 font-bold drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral max-md:w-full dark:hover:bg-s-dark-2"
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
		<div
			class="absolute bottom-0 left-0 h-1 w-full rounded-lg bg-[var(--color-c-btn)] opacity-0 transition-all"
			class:opacity-100={library.activeFilter === 0}
		></div>
	</div>
	{#each library.categories as category, i (category.id)}
		<div
			role="button"
			tabindex="0"
			class="relative group cursor-pointer touch-manipulation gap-2 rounded-sm bg-c-bg-surface p-8 font-bold drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral max-md:w-full dark:hover:bg-s-dark-2"
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
			<div
				class="absolute bottom-0 left-0 h-1 w-full rounded-lg opacity-0 transition-all"
				style="background-color: {category.color ?? 'var(--color-c-primary)'};"
				class:opacity-100={library.activeFilter === category.id}
			></div>
			<div
				class="absolute right-[-9px] bottom-[-4px] opacity-0 transition-all group-hover:opacity-100"
			>
				<button
					type="button"
					class="z-40 flex size-[24px] cursor-pointer items-center justify-center rounded-full bg-c-danger text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
					onclick={() => library.deleteCategory(category)}
				>
					<IconTrash class="size-4" />
				</button>
			</div>
		</div>
	{/each}
	<CategoryCreate />
</div>
