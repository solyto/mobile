<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import SegmentedControl from '$lib/components/forms/SegmentedControl.svelte';
	import CarddavForm from '$lib/components/contacts/import/CarddavForm.svelte';
	import CarddavSelect from '$lib/components/contacts/import/CarddavSelect.svelte';
	import FileForm from '$lib/components/contacts/import/FileForm.svelte';
	import type { ContactImportError, ContactImportView } from '$lib/services/ContactImportService';
	import type { ImportFileTarget, ImportRequest, ImportSource, ImportState } from '$lib/types/contact';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';
	import { getContactImport } from '$lib/state/ContactImport.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const MUTED = 'text-sm text-c-neutral-5 dark:text-c-neutral-4';

	const contacts = getContacts();
	const contactImport = getContactImport();
	const ts = getTranslation();

	let source = $state<ImportSource>('carddav');
	let error: ContactImportError | null = null;
	const saving = new SaveAction(() => errorMessage(error));

	const sourceOptions = [
		{ label: ts.get.contacts.import_source_carddav, value: 'carddav' },
		{ label: ts.get.contacts.import_source_file, value: 'file' }
	];

	function view(): ContactImportView {
		return contactImport.stalled ? 'failed' : contactImport.service.view(contactImport.state, contactImport.awaitingState);
	}

	function changeSource(value: string): void {
		source = value === 'file' ? 'file' : 'carddav';
	}

	async function run(action: () => Promise<ContactImportError | null>): Promise<void> {
		await saving.runIfIdle(async () => {
			error = await action();
			return error === null;
		});
	}

	function startCarddav(request: ImportRequest): void {
		run(() => contactImport.startCarddavImport(request));
	}

	function selectCarddav(selected: string[]): void {
		run(() => contactImport.selectCarddavAddressBooks(selected));
	}

	function importFile(file: File, target: ImportFileTarget): void {
		run(() => contactImport.importFile(file, target));
	}

	function errorMessage(error: ContactImportError | null): string {
		switch (error) {
			case 'invalid_file':
				return ts.get.contacts.import_error_invalid_file;
			case 'address_book_not_found':
				return ts.get.contacts.import_error_address_book_not_found;
			case 'already_running':
				return ts.get.contacts.import_error_running;
			case 'rate_limited':
				return ts.get.contacts.import_error_rate_limited;
			default:
				return ts.get.contacts.import_error;
		}
	}

	function progressLabel(state: ImportState): string {
		switch (state.stage) {
			case 'address-books':
				return state.address_books_current
					? ts.get.contacts.import_create_address_book.replace('%s', state.address_books_current)
					: ts.get.contacts.import_address_books;
			case 'contacts':
				return ts.get.contacts.import_contacts_running
					.replace('%s', state.address_books_current ?? '')
					.replace('%d', state.contacts_count > 0 ? state.contacts_count + ' ' : '');
			default:
				return ts.get.contacts.import_start;
		}
	}

	function close(): void {
		contactImport.close();
	}
</script>

{#snippet count(label: string, value: number)}
	<div class="flex justify-between">
		<span class={MUTED}>{label}</span>
		<span>{value}</span>
	</div>
{/snippet}

{#if contactImport.importModal}
	<ContentModal title={ts.get.contacts.import_contacts} rounded="2xl" onClose={close}>
		<div class="flex flex-col gap-4">
			{#if view() === 'start'}
				<SegmentedControl value={source} options={sourceOptions} onchange={changeSource} />
				{#if source === 'carddav'}
					<CarddavForm busy={saving.busy} onsubmit={startCarddav} />
				{:else}
					<FileForm targets={contacts.addressBooks} busy={saving.busy} onsubmit={importFile} />
				{/if}
			{:else if view() === 'select' && contactImport.state}
				<CarddavSelect addressBooks={contactImport.state.address_books ?? []} busy={saving.busy} onsubmit={selectCarddav} />
			{:else if view() === 'progress' && contactImport.state}
				<p>{progressLabel(contactImport.state)}</p>
				{#if contactImport.state.contacts_count > 0}
					<ProgressBar value={contactImport.service.progress(contactImport.state)} label={progressLabel(contactImport.state)} />
				{/if}
			{:else if view() === 'finished' && contactImport.state}
				<p>{ts.get.contacts.import_success}</p>
				{@render count(ts.get.contacts.import_imported, contactImport.state.contacts_done)}
				{#if contactImport.state.contacts_skipped > 0}
					{@render count(ts.get.contacts.import_skipped, contactImport.state.contacts_skipped)}
				{/if}
				<TextButton type="primary" title={ts.get.layout.close} onclick={close} />
			{:else if view() === 'failed'}
				<p class="text-sm text-c-danger" role="alert">{ts.get.contacts.import_error}</p>
				<TextButton type="primary" title={ts.get.layout.close} onclick={close} />
			{/if}
		</div>
	</ContentModal>
{/if}
