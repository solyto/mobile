<script lang="ts">
	import { fly } from 'svelte/transition';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import { Translation } from '$lib/state/Translation.svelte';
	import type { Snippet } from 'svelte';
	import type { TodoFilter, TodoNavigationItem, TodoNavigationSection } from '$lib/types/todo';
	import IconChevronRight from '$lib/icons/lucide/chevron-right.svelte';
	import IconArrowLeft from '$lib/icons/lucide/arrow-left.svelte';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import IconSub from '$lib/components/ui/icons/IconSub.svelte';
	import HamburgerButton from '$lib/components/ui/buttons/HamburgerButton.svelte';

	const todos = getTodos();
	const tags = getTags();

	let { sections, ts }: {
		sections: TodoNavigationSection[];
		ts: Translation;
	} = $props();

	type SectionKey = 'workspaces' | 'categories' | 'priority' | 'status' | 'effort' | 'due' | 'tags';

	let open = $state(false);
	let stack = $state<SectionKey[]>([]);
	let direction = $state<'forward' | 'back'>('forward');

	let current = $derived(stack.length > 0 ? stack[stack.length - 1] : null);

	const sectionHeaders: { key: SectionKey; label: string }[] = [
		{ key: 'workspaces', label: ts.get.todos.workspaces },
		{ key: 'categories', label: ts.get.todos.categories },
		{ key: 'priority', label: ts.get.todos.priority },
		{ key: 'status', label: ts.get.todos.status },
		{ key: 'effort', label: ts.get.todos.effort },
		{ key: 'due', label: ts.get.todos.due_at },
		{ key: 'tags', label: ts.get.todos.tags }
	];

	function close(): void {
		open = false;
	}

	function selectSection(key: SectionKey): void {
		direction = 'forward';
		stack = [...stack, key];
	}

	function goBack(): void {
		direction = 'back';
		stack = stack.slice(0, -1);
	}

	function applyFilter(filter: TodoFilter | null): void {
		if (filter) {
			todos.useFilters([filter]);
		} else {
			todos.useFilters([]);
		}
		close();
	}

	function currentSection(): TodoNavigationSection | undefined {
		const header = sectionHeaders.find((h) => h.key === current)?.label;
		return sections.find((s: TodoNavigationSection) => s.header === header);
	}

	function itemKey(item: TodoNavigationItem): string {
		return item.filter ? item.filter.type + '-' + item.filter.value : item.label;
	}

	function isActive(filter: TodoFilter | null): boolean {
		return filter !== null && todos.isFilterActive(filter);
	}

	function openMenu(): void {
		open = true;
	}

	function showAll(): void {
		applyFilter(null);
	}

	function chooseFilter(filter: TodoFilter | null): void {
		if (filter) applyFilter(filter);
	}

	function enterFromX(): number {
		return direction === 'forward' ? window.innerWidth : -window.innerWidth;
	}

	function leaveToX(): number {
		return -enterFromX();
	}
</script>

{#snippet subHeader(title: string)}
	<div class="flex shrink-0 items-center justify-between border-b border-c-neutral-2 p-4 dark:border-s-dark-3">
		<div class="flex items-center gap-3">
			<button
				class="cursor-pointer text-c-neutral-5 hover:text-c-neutral-7 dark:text-c-neutral-4 dark:hover:text-c-neutral-2"
				onclick={goBack}
			>
				<IconArrowLeft size={22} />
			</button>
			<span class="text-xl font-semibold">{title}</span>
		</div>
		<CloseButton onClick={close} inModal={false} />
	</div>
{/snippet}

{#snippet filterRow(filter: TodoFilter | null, content: Snippet)}
	<button
		class="flex w-full cursor-pointer items-center border-b border-c-neutral-1 px-4 py-4 text-left hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3"
		class:bg-c-neutral-1={isActive(filter)}
		class:dark:bg-s-dark-3={isActive(filter)}
		onclick={() => chooseFilter(filter)}
	>
		{@render content()}
	</button>
{/snippet}

{#snippet emptyHint()}
	<div class="px-4 py-8 text-center text-c-neutral-4">{ts.get.todos.no_todos}</div>
{/snippet}

<HamburgerButton onclick={openMenu} top={6} />

{#if open}
	<div
		class="secondary-nav-mobile-container fixed inset-x-0 top-0 bottom-16 z-50 flex flex-col bg-c-bg lg:hidden dark:bg-s-dark-1"
		transition:fly={{ x: -400, duration: 200 }}
	>
		<div class="relative flex-1 overflow-hidden">
			{#key current ?? 'root'}
				<div
					class="absolute inset-0 flex flex-col"
					in:fly={{ x: enterFromX(), duration: 250, opacity: 1 }}
					out:fly={{ x: leaveToX(), duration: 250, opacity: 1 }}
				>
					{#if current === null}
						<div class="flex shrink-0 items-center justify-between border-b border-c-neutral-2 p-4 dark:border-s-dark-3">
							<span class="text-2xl font-bold">{ts.get.todos.all_todos}</span>
							<CloseButton onClick={close} inModal={false} />
						</div>
						<div class="flex-1 overflow-y-auto">
							<button
								class="flex w-full cursor-pointer items-center justify-between border-b border-c-neutral-1 px-4 py-4 text-left hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3"
								onclick={showAll}
							>
								<span class="text-base">{ts.get.todos.all_todos}</span>
							</button>
							{#each sectionHeaders as section (section.key)}
								<button
									class="flex w-full cursor-pointer items-center justify-between border-b border-c-neutral-1 px-4 py-4 text-left hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3"
									onclick={() => selectSection(section.key)}
								>
									<span class="text-base">{section.label}</span>
									<IconChevronRight size={18} class="shrink-0 text-c-neutral-4" />
								</button>
							{/each}
						</div>
					{:else if current === 'workspaces'}
						{@render subHeader(ts.get.todos.workspaces)}
						<div class="flex-1 overflow-y-auto">
							{#each todos.workspaces as workspace (workspace.id)}
								{#snippet label()}
									<span class="text-base">{workspace.title}</span>
								{/snippet}
								{@render filterRow({ type: 'workspace', value: workspace }, label)}
							{/each}
							{#if todos.workspaces.length === 0}
								{@render emptyHint()}
							{/if}
						</div>
					{:else if current === 'categories'}
						{@render subHeader(ts.get.todos.categories)}
						<div class="flex-1 overflow-y-auto">
							{#each todos.filteredCategories as category (category.id)}
								{#snippet label()}
									<span class="text-base">
										{#if category.title.includes('/')}
											<div class="w-full flex items-center pl-2">
												<IconSub /> /{category.title.split('/').pop()}
											</div>
										{:else}
											/{category.title}
										{/if}
									</span>
								{/snippet}
								{@render filterRow({ type: 'category', value: category.id }, label)}
							{/each}
							{#if todos.filteredCategories.length === 0}
								{@render emptyHint()}
							{/if}
						</div>
					{:else if current === 'tags'}
						{@render subHeader(ts.get.todos.tags)}
						<div class="flex-1 overflow-y-auto">
							{#each tags.tags as tag (tag.id)}
								{#snippet label()}
									<span class="text-base">#{tag.name}</span>
								{/snippet}
								{@render filterRow({ type: 'tag', value: tag.id }, label)}
							{/each}
							{#if tags.tags.length === 0}
								{@render emptyHint()}
							{/if}
						</div>
					{:else}
						{@render subHeader(currentSection()?.header ?? current)}
						<div class="flex-1 overflow-y-auto">
							{#each currentSection()?.items ?? [] as item (itemKey(item))}
								{#snippet label()}
									<span class="text-base">{item.label}</span>
								{/snippet}
								{@render filterRow(item.filter, label)}
							{/each}
						</div>
					{/if}
				</div>
			{/key}
		</div>
	</div>
{/if}
