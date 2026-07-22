<script lang="ts">
	import CreateEntry from '$lib/components/settings/CreateEntry.svelte';
	import WorkspaceEdit from '$lib/components/settings/WorkspaceEdit.svelte';
	import CategoryEdit from '$lib/components/settings/CategoryEdit.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import SettingsSection from '$lib/components/settings/SettingsSection.svelte';

	const ts = getTranslation();
	const todos = getTodos();
</script>

<div class="flex flex-col gap-8 md:p-4">
	<SettingsSection label={ts.get.settings.categories}>
		{#snippet headerAction()}
			<CreateEntry
				label={ts.get.settings.new_category}
				create={(title) => todos.createCategory(title)}
				useAddButton={true}
			/>
		{/snippet}
		<div class="flex flex-row flex-wrap gap-2 py-4">
			{#each todos.categories as category (category.id)}
				<CategoryEdit {category} />
			{/each}
		</div>
	</SettingsSection>
	<SettingsSection label={ts.get.settings.workspaces}>
		{#snippet headerAction()}
			<CreateEntry
				label={ts.get.settings.new_workspace}
				create={(title) => todos.createWorkspace(title)}
				useAddButton={true}
			/>
		{/snippet}
		<div class="flex flex-row flex-wrap gap-4 py-4">
			{#each todos.workspaces as workspace (workspace.id)}
				<WorkspaceEdit {workspace} />
			{/each}
		</div>
	</SettingsSection>
</div>
