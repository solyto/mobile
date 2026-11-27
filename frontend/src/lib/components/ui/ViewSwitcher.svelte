<script lang="ts">
	import IconAlignJustify from '$lib/icons/lucide/text-align-justify.svelte';
	import IconList from '$lib/icons/lucide/list.svelte';
	import IconSquareKanban from '$lib/icons/lucide/square-kanban.svelte';
	import IconLayoutGrid from '$lib/icons/lucide/layout-grid.svelte';
	import IconGalleryHorizontal from '$lib/icons/lucide/gallery-horizontal.svelte';
	import IconLibrary from '$lib/icons/lucide/library.svelte';
	import IconSquare from '$lib/icons/lucide/square.svelte';
	import IconRectangleHorizontal from '$lib/icons/lucide/rectangle-horizontal.svelte';
	import IconListTree from '$lib/icons/lucide/list-tree.svelte';

	let {
		views,
		currentlySelected,
		onChange,
		class: className = ''
	}: {
		views: Array<{
			type: 'compact' | 'comfortable' | 'card' | 'list' | 'kanban' | 'overview' | 'grouped' | 'shelf' | 'cards' | 'spine';
			title: string;
		}>;
		currentlySelected: string;
		onChange: (type: string) => void;
		class?: string;
	} = $props();
</script>

<div class="flex items-center gap-1 {className}">
	{#each views as view (view.type)}
		<button
			class="cursor-pointer rounded-lg p-2 transition-all hover:bg-c-highlight dark:hover:bg-s-dark-3"
			class:bg-c-highlight={view.type === currentlySelected}
			class:dark:bg-s-dark-3={view.type === currentlySelected}
			onclick={() => onChange(view.type)}
			title={view.title}
		>
			{#if view.type === 'compact'}
				<IconAlignJustify class="size-4" />
			{:else if view.type === 'comfortable'}
				<IconList class="size-4" />
			{:else if view.type === 'card'}
				<IconRectangleHorizontal class="size-4" />
			{:else if view.type === 'list'}
				<IconAlignJustify class="size-4" />
			{:else if view.type === 'kanban'}
				<IconSquareKanban class="size-4" />
			{:else if view.type === 'cards'}
				<IconSquare class="size-4" />
			{:else if view.type === 'overview'}
				<IconLayoutGrid class="size-4" />
			{:else if view.type === 'grouped'}
				<IconListTree class="size-4" />
			{:else if view.type === 'shelf'}
				<IconGalleryHorizontal class="size-4" />
			{:else if view.type === 'spine'}
				<IconLibrary class="size-4" />
			{/if}
		</button>
	{/each}
</div>
