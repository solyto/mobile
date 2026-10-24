<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import type { CreateQuoteRequest, Quote, UpdateQuoteRequest } from '$lib/types/library_quote';
	import MultiSelect, { type MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import CreateModal from '$lib/components/libraries/shared/CreateModal.svelte';
	import { getQuoteLibrary } from '$lib/state/QuoteLibrary.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';

	const ts = getTranslation();
	const library = getQuoteLibrary();
	const tags = getTags();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let activeEntry = $state<Quote | null>(library.activeEntry);

	let summaryValue = $state<string>(activeEntry?.summary ?? '');
	let authorValue = $state<string>(activeEntry?.author ?? '');
	let sourceValue = $state<string>(activeEntry?.source ?? '');
	let quoteValue = $state<string>(activeEntry ? activeEntry.quote : '');
	let selectedTags = $state<MultiSelectEntry[]>(
		activeEntry ? activeEntry.tags.map((t) => ({ label: t.name, value: t.id.toString() })) : []
	);

	let tagOptions: MultiSelectEntry[] = $derived(
		tags.tags.map((tag) => ({ label: tag.name, value: tag.id.toString() }))
	);

	async function onCreateTag(data: { option: MultiSelectEntry }): Promise<void> {
		const created = await tags.create(data.option.label.toString());
		if (!created) {
			notifications.error(ts.get.libraries.tag_error);
			return;
		}
		data.option.value = created.id.toString();
	}

	async function onsubmit(): Promise<void> {
		if (activeEntry) {
			return await update();
		} else {
			return await create();
		}
	}

	async function create(): Promise<void> {
		loadingIndicator.start();

		const request: CreateQuoteRequest = {
			author: authorValue !== '' ? authorValue : null,
			summary: summaryValue !== '' ? summaryValue : null,
			source: sourceValue !== '' ? sourceValue : null,
			quote: quoteValue,
			tags: selectedTags.map((v) => parseInt(v.value))
		};
		const ok = await library.create(request);
		if (ok) {
			authorValue = '';
			summaryValue = '';
			quoteValue = '';
			sourceValue = '';
			library.closeCreateModal();
			await library.load();
		} else {
			notifications.error(ts.get.libraries.quotes.create_error);
		}

		loadingIndicator.stop();
	}

	async function update(): Promise<void> {
		loadingIndicator.start();

		const request: UpdateQuoteRequest = {
			author: authorValue !== '' ? authorValue : null,
			summary: summaryValue !== '' ? summaryValue : null,
			source: sourceValue !== '' ? sourceValue : null,
			quote: quoteValue !== '' ? quoteValue : null,
			tags: selectedTags.map((v) => parseInt(v.value))
		};
		const ok = await library.update(activeEntry!, request);
		if (ok) {
			library.closeCreateModal();
			await library.load();
		} else {
			notifications.error(ts.get.libraries.quotes.update_error);
		}

		loadingIndicator.stop();
	}
</script>

<CreateModal
	title={activeEntry !== null
		? ts.get.libraries.quotes.edit_quote
		: ts.get.libraries.quotes.add_quote}
	{library}
>
	<ModalFormRow label={ts.get.libraries.quotes.author}>
		<TextInput bind:value={authorValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.quotes.quote}>
		<TextInput bind:value={quoteValue} multiLine={true} height={150} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.tags}>
		<MultiSelect bind:value={selectedTags} options={tagOptions} allowUserOptions oncreate={onCreateTag} />
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
