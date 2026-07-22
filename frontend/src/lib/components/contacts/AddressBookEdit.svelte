<script lang="ts">
	import ColorPicker from 'svelte-awesome-color-picker';
	import IconEye from '@lucide/svelte/icons/eye';
	import IconEyeOff from '@lucide/svelte/icons/eye-off';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import type { AddressBook, UpdateAddressBookRequest } from '$lib/types/contact';
	import { getContacts } from '$lib/state/Contacts.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const contacts = getContacts();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let { addressBook } = $props<{ addressBook: AddressBook }>();

	let hex = $state<string>(addressBook.color !== null ? addressBook.color : 'var(--color-c-neutral-2)');

	async function onColorChange(): Promise<void> {
		if (hex === addressBook.color) return;
		if (hex === null) return;

		loadingIndicator.start();
		const request: UpdateAddressBookRequest = { color: hex };
		await contacts.updateAddressBook(addressBook, request);
		loadingIndicator.stop();
	}

	function onDelete(): void {
		contacts.activeAddressBook = addressBook;
		contacts.deleteModal = true;
	}
</script>

<div class="flex items-center gap-4">
	<div use:clickOutside={onColorChange}>
		<ColorPicker
			bind:hex
			position="responsive"
			nullable={false}
			label=""
			isTextInput={false}
			--cp-border-color="var(--color-c-neutral-2)"
		/>
	</div>
	<span class="w-60 text-lg">{addressBook.name}</span>
	<div class="flex items-center gap-1">
		<button
			class="cursor-pointer transition-all"
			class:text-c-primary={!contacts.isAddressBookHidden(addressBook.id)}
			class:text-c-neutral-3={contacts.isAddressBookHidden(addressBook.id)}
			title={ts.get.layout.toggle}
			onclick={() => contacts.toggleAddressBook(addressBook.id)}
		>
			{#if contacts.isAddressBookHidden(addressBook.id)}
				<IconEyeOff />
			{:else}
				<IconEye />
			{/if}
		</button>
		<InlineDeleteButton onClick={onDelete} />
	</div>
</div>
