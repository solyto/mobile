<script lang="ts">
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const contacts = getContacts();
	const ts = getTranslation();

	let input = $state<HTMLInputElement | null>(null);
	let value = $state<string>('');

	async function onCreate() {
		await contacts.createAddressBook({ name: value });
		value = '';
		contacts.createModal = false;
	}

	function onCancel(): void {
		contacts.createModal = false;
	}
</script>

{#if contacts.createModal}
	<ConfirmationModal
		onConfirm={onCreate}
		{onCancel}
		title={ts.get.contacts.create_address_book}
	>
		<TextInput bind:input bind:value placeholder={ts.get.contacts.address_book_name_placeholder} onblur={() => {}} />
	</ConfirmationModal>
{/if}
