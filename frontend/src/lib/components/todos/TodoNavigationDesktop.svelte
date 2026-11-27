<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { TodoFilter, TodoNavigationSection, TodoWorkspace } from '$lib/types/todo';
	import { Translation } from '$lib/state/Translation.svelte';
	import ListAndAdd from './ListAndAdd.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import IconSub from '$lib/components/ui/icons/IconSub.svelte';

	const ROW = 'cursor-pointer rounded-lg px-2 py-1 text-sm hover:bg-c-neutral 2xl:text-base dark:hover:bg-s-dark-3';
	const FLEX_ROW = `flex flex-row items-center ${ROW}`;

	const todos = getTodos();
	const tags = getTags();

	let { sections, ts }: {
		sections: TodoNavigationSection[];
		ts: Translation;
	} = $props();

	let categoriesExpanded = $state<boolean>(true);
	let tagsExpanded = $state<boolean>(false);

	function workspaceFilter(workspace: TodoWorkspace): TodoFilter {
		return { type: 'workspace', value: workspace };
	}

	function categoryFilter(categoryId: number): TodoFilter {
		return { type: 'category', value: categoryId };
	}

	function tagFilter(tagId: number): TodoFilter {
		return { type: 'tag', value: tagId };
	}

	function isActive(filter: TodoFilter | null): boolean {
		return filter !== null && todos.isFilterActive(filter);
	}

	function applyFilter(filter: TodoFilter | null): void {
		if (filter) todos.useFilters([filter]);
	}

	function clearFilters(): void {
		todos.useFilters([]);
	}

	function toggleCategories(): void {
		categoriesExpanded = !categoriesExpanded;
	}

	function collapseCategories(): void {
		categoriesExpanded = false;
	}

	function expandCategories(): void {
		categoriesExpanded = true;
	}

	function toggleTags(): void {
		tagsExpanded = !tagsExpanded;
	}

	function collapseTags(): void {
		tagsExpanded = false;
	}

	function expandTags(): void {
		tagsExpanded = true;
	}
</script>

{#snippet sectionHeader(title: string)}
	<div class="mt-2 p-2 text-base font-bold 2xl:text-2xl 2xl:font-normal">
		{title}
	</div>
{/snippet}

<div
	class="hidden h-full max-h-screen w-full flex-col overflow-y-auto bg-c-bg p-2 drop-shadow-xl lg:relative lg:flex lg:w-32 2xl:w-60 2xl:p-4 dark:border-r-1 dark:border-s-dark-2 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
	in:fade
>
	<a
		href="?filterType="
		onclick={clearFilters}
		class="w-full cursor-pointer rounded-lg p-2 text-left hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
		class:bg-c-neutral-1={todos.activeFilters.length === 0}
		class:dark:bg-s-dark-3={todos.activeFilters.length === 0}
	>
		{ts.get.todos.all_todos}
	</a>
	{#if todos.workspaces.length > 0}
		{@render sectionHeader(ts.get.todos.workspaces)}
		{#each todos.workspaces as workspace (workspace.id)}
			<a href="?filterType=workspace&filterValue={workspace.id}" onclick={() => applyFilter(workspaceFilter(workspace))} in:fade>
				<div
					class={FLEX_ROW}
					class:bg-c-neutral-1={isActive(workspaceFilter(workspace))}
					class:dark:bg-s-dark-3={isActive(workspaceFilter(workspace))}
				>
					{workspace.title}
				</div>
			</a>
		{/each}
	{/if}
	<div role="button" tabindex="0" class="cursor-pointer" onclick={toggleCategories}>
		<ListAndAdd title={ts.get.todos.categories} type="category" onStart={collapseCategories} onFinish={expandCategories} />
	</div>
	{#if categoriesExpanded}
		{#each todos.filteredCategories as category (category.id)}
			<a href="?filterType=category&filterValue={category.id}" onclick={() => applyFilter(categoryFilter(category.id))} in:fade>
				<div
					class={FLEX_ROW}
					class:bg-c-neutral-1={isActive(categoryFilter(category.id))}
					class:dark:bg-s-dark-3={isActive(categoryFilter(category.id))}
					class:pl-4={category.title.includes('/')}
				>
					{#if category.title.includes('/')}
						<IconSub /> /{category.title.split('/').pop()}
					{:else}
						/{category.title}
					{/if}
				</div>
			</a>
		{/each}
	{/if}
	{#each sections as section (section.header)}
		{@render sectionHeader(section.header)}
		{#each section.items as item (item.filter)}
			<a href="?filterType={item.filter?.type}&filterValue={item.filter?.value}" onclick={() => applyFilter(item.filter)}>
				<div class={ROW} class:bg-c-neutral-1={isActive(item.filter)} class:dark:bg-s-dark-3={isActive(item.filter)}>
					{item.label}
				</div>
			</a>
		{/each}
	{/each}
	<div role="button" tabindex="0" class="cursor-pointer" onclick={toggleTags}>
		<ListAndAdd title={ts.get.todos.tags} type="tag" onStart={collapseTags} onFinish={expandTags} />
	</div>
	{#if tagsExpanded}
		{#each tags.tags as tag (tag.id)}
			<a href="?filterType=tag&filterValue={tag.id}" onclick={() => applyFilter(tagFilter(tag.id))} in:fade>
				<div class={ROW} class:bg-c-neutral-1={isActive(tagFilter(tag.id))} class:dark:bg-s-dark-3={isActive(tagFilter(tag.id))}>
					#{tag.name}
				</div>
			</a>
		{/each}
	{/if}
</div>
