<script lang="ts">
	import ColorPicker from '$lib/components/forms/ColorPicker.svelte';
	import FileUpload from '$lib/components/forms/FileUpload.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ContactImportService from '$lib/services/ContactImportService';
	import type { AddressBook, ImportFileTarget } from '$lib/types/contact';

	let { targets, busy, onsubmit }: {
		targets: AddressBook[];
		busy: boolean;
		onsubmit: (file: File, target: ImportFileTarget) => void;
	} = $props();

	const DEFAULT_COLOR = '#0088CC';
	const NEW = 'new';

	const ts = getTranslation();
	const service = new ContactImportService();
	const uid = $props.id();

	let file = $state<File | null>(null);
	let into = $state<string>(NEW);
	let name = $state<string>('');
	let hex = $state<string>(DEFAULT_COLOR);

	async function pick(picked: File): Promise<boolean> {
		const suggested = file === null ? '' : service.defaultAddressBookName(file.name);
		if (name === suggested) name = service.defaultAddressBookName(picked.name);
		file = picked;
		return true;
	}

	function intoOptions(): { label: string; value: string }[] {
		return [
			{ label: ts.get.contacts.import_target_new, value: NEW },
			...targets.map((addressBook) => ({ label: addressBook.name, value: addressBook.id.toString() }))
		];
	}

	function changeInto(value: string): void {
		into = value;
	}

	function target(): ImportFileTarget {
		if (into !== NEW) return { type: 'existing', addressBookId: Number(into) };
		return { type: 'new', name, color: hex };
	}

	function canSubmit(): boolean {
		return !busy && file !== null;
	}

	function submit(): void {
		if (file !== null && canSubmit()) onsubmit(file, target());
	}
</script>

<div class="flex flex-col gap-3">
	<ModalFormRow label={ts.get.layout.file}>
		<FileUpload accept=".vcf,.vcard,text/vcard,text/x-vcard" onfile={pick} />
	</ModalFormRow>
	{#if targets.length > 0}
		<ModalFormRow label={ts.get.layout.import_into}>
			<Select value={into} onchange={changeInto} options={intoOptions()} ariaLabel={ts.get.layout.import_into} />
		</ModalFormRow>
	{/if}
	{#if into === NEW}
		<ModalFormRow label={ts.get.layout.name} labelFor="{uid}-name">
			<TextInput bind:value={name} id="{uid}-name" maxlength={100} />
		</ModalFormRow>
		<ModalFormRow label={ts.get.layout.color}>
			<ColorPicker bind:hex />
		</ModalFormRow>
	{/if}
	<TextButton type="primary" title={ts.get.contacts.import} disabled={!canSubmit()} onclick={submit} class="mt-2" />
</div>
