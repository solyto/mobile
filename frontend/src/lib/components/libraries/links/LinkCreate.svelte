<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { createdEntryValue, selectedIds, tagEntries } from '$lib/helpers/MultiSelectHelper';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import type { CreateLinkRequest } from '$lib/types/library_link';
	import { getTags } from '$lib/state/Tags.svelte';
	import MultiSelect, { type MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import CreateModal from '$lib/components/libraries/shared/CreateModal.svelte';
	import { getLinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';

	const ts = getTranslation();
	const library = getLinkLibrary();
	const tags = getTags();
	const notifications = getUiNotifications();
	const saving = new SaveAction(() => ts.get.libraries.links.create_error);

	let titleValue = $state<string>('');
	let urlValue = $state<string>('');
	let selectedTags = $state<MultiSelectEntry[]>([]);

	function onCreateTag(label: string): Promise<string | null> {
		return createdEntryValue(tags.create(label), () => notifications.error(ts.get.libraries.tag_error));
	}

	function createRequest(): CreateLinkRequest {
		return {
			title: titleValue || null,
			url: urlValue,
			tags: selectedTags.length > 0 ? selectedIds(selectedTags) : undefined,
			category_id: library.getActiveCategoryId()
		};
	}

	async function onsubmit(): Promise<void> {
		if (!(await saving.run(() => library.create(createRequest())))) return;
		titleValue = '';
		urlValue = '';
		library.closeCreateModal();
	}
</script>

<CreateModal title={ts.get.libraries.links.add_link} {library}>
	<ModalFormRow label={ts.get.libraries.links.url}>
		<TextInput bind:value={urlValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.links.title}>
		<TextInput bind:value={titleValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.tags}>
		<MultiSelect bind:value={selectedTags} options={tagEntries(tags.tags)} allowUserOptions oncreate={onCreateTag} />
	</ModalFormRow>
	<div class="mt-8 flex w-full flex-row items-center justify-end">
		<TextButton title={ts.get.layout.save} onclick={onsubmit} />
	</div>
</CreateModal>
