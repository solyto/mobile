<script lang="ts">
	import CreateEntry from '$lib/components/settings/CreateEntry.svelte';
	import TagEdit from '$lib/components/settings/TagEdit.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import SettingsSection from '$lib/components/settings/SettingsSection.svelte';

	const ts = getTranslation();
	const tags = getTags();
</script>

<div class="md:p-4">
	<SettingsSection label={ts.get.settings.tags}>
		{#snippet headerAction()}
			<CreateEntry
				label={ts.get.settings.new_tag}
				create={(title) => tags.create(title)}
				useAddButton={true}
			/>
		{/snippet}
		<div class="flex flex-row flex-wrap gap-2 py-4">
			{#each tags.tags as tag (tag.id)}
				<TagEdit {tag} />
			{/each}
		</div>
	</SettingsSection>
</div>
