<script lang="ts">
	import { fade } from 'svelte/transition';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import type {
		ImportForm,
		ImportRequest,
		ImportState,
		SelectImportAddressBooksRequest
	} from '$lib/types/contact';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import IconLoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import PasswordInput from '$lib/components/forms/PasswordInput.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';

	const contacts = getContacts();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const ts = getTranslation();

	let loading = $state<boolean>(false);
	let form = $state<ImportForm>({
		url: '',
		username: '',
		secret: ''
	});
	let selectedAddressBooks = $state<string[]>([]);
	let importState = $state<ImportState | null>(null);
	let error = $state<boolean>(false);

	async function initImport(): Promise<void> {
		if (form.url === '' || form.username === '' || form.secret === '') return;

		loadingIndicator.start();
		loading = true;

		const request = form as ImportRequest;
		const res = await contacts.startImport(request);

		loadingIndicator.stop();

		if (!res) {
			error = true;
			loading = false;
			return;
		}

		await loadState();
	}

	function selectCalendar(calendar: string): void {
		if (selectedAddressBooks.includes(calendar)) {
			selectedAddressBooks = selectedAddressBooks.filter((c) => c !== calendar);
		} else {
			selectedAddressBooks.push(calendar);
		}
	}

	async function startImport(): Promise<void> {
		if (selectedAddressBooks.length === 0) return;

		loadingIndicator.start();
		loading = true;

		const request: SelectImportAddressBooksRequest = { address_books: selectedAddressBooks };
		const res = await contacts.selectImportAddressBooks(request);

		loadingIndicator.stop();

		if (res) await loadState(true);
	}

	async function loadState(firstCall: boolean = false): Promise<void> {
		setTimeout(async () => {
			const state = await contacts.getImportState();

			if (!state && !firstCall) {
				return;
			}

			importState = state;

			if (importState?.stage === 'select') loading = false;

			if (importState?.stage === 'finished') {
				notifications.success(ts.get.contacts.import_success);
				await contacts.loadAddressBooks();
				await contacts.loadContacts();
				onClose();
			}

			if (loading) {
				await loadState();
			}
		}, 1000);
	}

	function onClose(): void {
		importState = null;
		error = false;
		loading = false;
		contacts.importModal = false;
		selectedAddressBooks = [];
	}
</script>

{#if contacts.importModal}
	<ContentModal title={ts.get.contacts.import_contacts} rounded="2xl" {onClose}>
		{#if loading}
			<div
				class="absolute top-[10px] right-[10px] z-20 rounded-full bg-c-primary p-1 text-white shadow-lg"
			>
				<IconLoaderCircle class="animate-spin" />
			</div>
		{/if}
		{#if importState === null && !loading && !error}
			<div class="flex flex-col gap-2">
				<ModalFormRow label="URL">
					<TextInput bind:value={form.url} />
				</ModalFormRow>
				<ModalFormRow label="Username">
					<TextInput bind:value={form.username} />
				</ModalFormRow>
				<ModalFormRow label="Secret">
					<PasswordInput bind:value={form.secret} />
				</ModalFormRow>
				<TextButton title="Import" onclick={initImport} class="mt-4" />
			</div>
		{:else if importState === null && loading}
			<p>{ts.get.contacts.import_start}</p>
		{:else if importState === null && error}
			<p>{ts.get.contacts.import_error}</p>
		{:else if importState?.stage === 'select'}
			<div class="flex flex-col gap-2">
				{#each importState?.address_books as calendar (calendar)}
					<div class="flex w-full justify-between" in:fade>
						<span>{calendar}</span>
						<Checkbox
							isChecked={false}
							onchange={() => {
								selectCalendar(calendar);
							}}
						/>
					</div>
				{/each}
				<TextButton title="Import" onclick={startImport} class="mt-4" />
			</div>
		{:else if importState?.stage === 'address-books'}
			{#if importState?.address_books_current}
				<p>
					{ts.get.contacts.import_create_address_book.replace(
						'%s',
						importState.address_books_current
					)}
				</p>
			{:else}
				<p>{ts.get.contacts.import_address_books}</p>
			{/if}
		{:else if importState?.stage === 'contacts'}
			<div class="flex flex-col gap-2">
				<p>
					{ts.get.contacts.import_contacts_running
						.replace('%s', importState.address_books_current ?? '')
						.replace(
							'%d',
							importState.contacts_done > 0 ? importState.contacts_count + ' ' : ''
						)}
				</p>
				{#if importState.contacts_count > 0}
					<div
						class="mt-2 h-4 w-full rounded-lg border-1 border-c-primary shadow-sm"
						in:fade
					>
						<div
							class="h-full rounded-lg bg-c-primary transition-all duration-1000"
							style="width: {(importState?.contacts_done /
								importState?.contacts_count) *
								100}%;"
						></div>
					</div>
				{/if}
			</div>
		{/if}
	</ContentModal>
{/if}
