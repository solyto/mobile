<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import CreateEntry from '$lib/components/settings/CreateEntry.svelte';
	import CategoryEdit from '$lib/components/todos/CategoryEdit.svelte';
	import WorkspaceEdit from '$lib/components/todos/WorkspaceEdit.svelte';
	import HelpTooltip from '$lib/components/ui/HelpTooltip.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';

	const ts = getTranslation();
	const todos = getTodos();
</script>

<ContentModal rounded="2xl" p="6" width="4xl" onClose={() => todos.closeSettingsModal()}>
	<div class="flex flex-col gap-8">
		<section>
			<div class="mb-4 flex min-h-10 items-center gap-4">
				<Heading title={ts.get.todos.categories} my={0} />
				<CreateEntry
					label={ts.get.todos.new_category}
					create={(title) => todos.createCategory(title)}
					useAddButton={true}
				/>
			</div>
			{#if todos.categories.length === 0}
				<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.todos.no_categories}</p>
			{:else}
				<div class="-mx-2 gap-x-6 md:mx-0 md:columns-2 lg:columns-3">
					{#each todos.categories as category (category.id)}
						<CategoryEdit {category} />
					{/each}
				</div>
			{/if}
		</section>
		<section>
			<div class="mb-4 flex min-h-10 items-center gap-4">
				<Heading title={ts.get.todos.workspaces} my={0} />
				<CreateEntry
					label={ts.get.todos.new_workspace}
					create={(title) => todos.createWorkspace(title)}
					useAddButton={true}
				/>
				<div class="ml-auto">
					<HelpTooltip description={ts.get.todos.workspaces_help} align="right" muted={true} />
				</div>
			</div>
			{#if todos.workspaces.length === 0}
				<p class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.todos.no_workspaces}</p>
			{:else}
				<div class="flex flex-col">
					{#each todos.workspaces as workspace (workspace.id)}
						<WorkspaceEdit {workspace} />
					{/each}
				</div>
			{/if}
		</section>
	</div>
</ContentModal>
