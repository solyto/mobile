<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { createdEntryValue, selectedIds, tagEntries } from '$lib/helpers/MultiSelectHelper';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import type { CreateQuoteRequest, Quote, UpdateQuoteRequest } from '$lib/types/library_quote';
	import MultiSelect, { type MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import CreateModal from '$lib/components/libraries/shared/CreateModal.svelte';
	import { getQuoteLibrary } from '$lib/state/QuoteLibrary.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';

	const ts = getTranslation();
	const library = getQuoteLibrary();
	const tags = getTags();
	const notifications = getUiNotifications();
	const saving = new SaveAction(() => (activeEntry ? ts.get.libraries.quotes.update_error : ts.get.libraries.quotes.create_error));

	let activeEntry = $state<Quote | null>(library.activeEntry);

	let summaryValue = $state<string>(activeEntry?.summary ?? '');
	let authorValue = $state<string>(activeEntry?.author ?? '');
	let sourceValue = $state<string>(activeEntry?.source ?? '');
	let quoteValue = $state<string>(activeEntry ? activeEntry.quote : '');
	let selectedTags = $state<MultiSelectEntry[]>(tagEntries(activeEntry?.tags ?? []));

	function onCreateTag(label: string): Promise<string | null> {
		return createdEntryValue(tags.create(label), () => notifications.error(ts.get.libraries.tag_error));
	}

	function createRequest(): CreateQuoteRequest {
		return {
			author: authorValue !== '' ? authorValue : null,
			summary: summaryValue !== '' ? summaryValue : null,
			source: sourceValue !== '' ? sourceValue : null,
			quote: quoteValue,
			tags: selectedIds(selectedTags)
		};
	}

	function updateRequest(): UpdateQuoteRequest {
		return {
			author: authorValue !== '' ? authorValue : null,
			summary: summaryValue !== '' ? summaryValue : null,
			source: sourceValue !== '' ? sourceValue : null,
			quote: quoteValue !== '' ? quoteValue : null,
			tags: selectedIds(selectedTags)
		};
	}

	function resetForm(): void {
		authorValue = '';
		summaryValue = '';
		quoteValue = '';
		sourceValue = '';
	}

	async function onsubmit(): Promise<void> {
		const ok = await saving.run(() => (activeEntry ? library.update(activeEntry, updateRequest()) : library.create(createRequest())));
		if (!ok) return;
		if (!activeEntry) resetForm();
		library.closeCreateModal();
	}

	function modalTitle(): string {
		return activeEntry !== null ? ts.get.libraries.quotes.edit_quote : ts.get.libraries.quotes.add_quote;
	}
</script>

<CreateModal
	title={modalTitle()}
	{library}
>
	<ModalFormRow label={ts.get.libraries.quotes.author}>
		<TextInput bind:value={authorValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.quotes.quote}>
		<TextInput bind:value={quoteValue} multiLine={true} height={150} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.tags}>
		<MultiSelect bind:value={selectedTags} options={tagEntries(tags.tags)} allowUserOptions oncreate={onCreateTag} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.quotes.summary}>
		<TextInput bind:value={summaryValue} multiLine={true} height={80} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.quotes.source}>
		<TextInput bind:value={sourceValue} />
	</ModalFormRow>
	<div class="mt-8 flex w-full flex-row items-center justify-end">
		<TextButton title={ts.get.layout.save} onclick={onsubmit} />
	</div>
</CreateModal>
