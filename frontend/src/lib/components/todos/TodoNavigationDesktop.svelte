<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { TodoNavigationSection } from '$lib/types/todo';
	import { Translation } from '$lib/state/Translation.svelte';
	import ListAndAdd from './ListAndAdd.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import IconSub from '$lib/components/ui/icons/IconSub.svelte';

	const todos = getTodos();
	const tags = getTags();

	let { sections, ts } = $props<{
		sections: TodoNavigationSection[];
		ts: Translation;
	}>();

	let categoriesExpanded = $state<boolean>(true);
	let tagsExpanded = $state<boolean>(false);
</script>

<div
	class="hidden h-full max-h-screen w-full flex-col overflow-y-auto bg-c-bg p-2 drop-shadow-xl lg:relative lg:flex lg:w-32 2xl:w-60 2xl:p-4 dark:border-r-1 dark:border-s-dark-2 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
	in:fade
>
	<a href="?filterType="
		onclick={() => todos.useFilters([])}
		class="
		    w-full cursor-pointer rounded-lg p-2 text-left hover:bg-c-neutral-1 dark:hover:bg-s-dark-3
			{todos.activeFilters.length === 0 ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}
		"
	>
		{ts.get.todos.all_todos}
	</a>
	{#if todos.workspaces.length > 0}
		<div class="mt-2 p-2 text-base font-bold 2xl:text-2xl 2xl:font-normal">
			{ts.get.todos.workspaces}
		</div>
		{#each todos.workspaces as workspace (workspace.id)}
			<a
				href="?filterType=workspace&filterValue={workspace.id}"
				onclick={() => todos.useFilters([{ type: 'workspace', value: workspace }])}
				in:fade
			>
				<div
					class="
					    flex cursor-pointer flex-row items-center rounded-lg px-2 py-1 text-sm hover:bg-c-neutral 2xl:text-base dark:hover:bg-s-dark-3
						{todos.isFilterActive({ type: 'workspace', value: workspace }) ? 'bg-c-neutral-1 dark:bg-s-dark-3': ''}
					"
				>
					{workspace.title}
				</div>
			</a>
		{/each}
	{/if}
	<div
		role="button"
		tabindex="0"
		class="cursor-pointer"
		onclick={() => {
			categoriesExpanded = !categoriesExpanded;
		}}
	>
		<ListAndAdd
			title={ts.get.todos.categories}
			type="category"
			onStart={() => (categoriesExpanded = false)}
			onFinish={() => (categoriesExpanded = true)}
		/>
	</div>
	{#if categoriesExpanded}
		{#each todos.filteredCategories as category (category.id)}
			<a
				href="?filterType=category&filterValue={category.id}"
				onclick={() => todos.useFilters([{ type: 'category', value: category.id }])}
				in:fade
			>
				<div
					class="
					    flex cursor-pointer flex-row items-center rounded-lg px-2 py-1 text-sm hover:bg-c-neutral 2xl:text-base dark:hover:bg-s-dark-3
						{todos.isFilterActive({ type: 'category', value: category.id }) ? 'bg-c-neutral-1 dark:bg-s-dark-3': ''}
					"
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
		<div class="mt-2 p-2 text-base font-bold 2xl:text-2xl 2xl:font-normal">
			{section.header}
		</div>
		{#each section.items as item (item.filter)}
			<a
				href="?filterType={item.filter?.type}&filterValue={item.filter?.value}"
				onclick={() => {
					if (item.filter) todos.useFilters([item.filter]);
				}}
			>
				<div
					class="
					    cursor-pointer rounded-lg px-2 py-1 text-sm hover:bg-c-neutral 2xl:text-base dark:hover:bg-s-dark-3
						{item.filter && todos.isFilterActive(item.filter) ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}
					"
				>
					{item.label}
				</div>
			</a>
		{/each}
	{/each}
	<div
		role="button"
		tabindex="0"
		class="cursor-pointer"
		onclick={() => {
			tagsExpanded = !tagsExpanded;
		}}
	>
		<ListAndAdd
			title={ts.get.todos.tags}
			type="tag"
			onStart={() => (tagsExpanded = false)}
			onFinish={() => (tagsExpanded = true)}
		/>
	</div>
	{#if tagsExpanded}
		{#each tags.tags as tag (tag.id)}
			<a
				href="?filterType=tag&filterValue={tag.id}"
				onclick={() => todos.useFilters([{ type: 'tag', value: tag.id }])}
				in:fade
			>
				<div
					class="
					    cursor-pointer rounded-lg px-2 py-1 text-sm hover:bg-c-neutral 2xl:text-base dark:hover:bg-s-dark-3
						{todos.isFilterActive({ type: 'tag', value: tag.id }) ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}
					"
				>
					#{tag.name}
				</div>
			</a>
		{/each}
	{/if}
</div>
