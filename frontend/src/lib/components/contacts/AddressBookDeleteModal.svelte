<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';

	const ts = getTranslation();
	const contacts = getContacts();
</script>

{#if contacts.deleteModal && contacts.activeAddressBook}
	<Modal
		title={ts.get.calendar.delete_title}
		description={ts.get.calendar.delete_description}
		type="confirm-delete"
		onConfirm={() => {
			contacts.deleteAddressBook(contacts.activeAddressBook!);
		}}
		onCancel={() => {
			contacts.deleteModal = false;
		}}
	/>
{/if}
