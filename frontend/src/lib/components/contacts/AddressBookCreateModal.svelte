<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';

	const ts = getTranslation();
	const notifications = getUiNotifications();
	const contacts = getContacts();

	let input = $state<HTMLInputElement | null>(null);
	let value = $state<string>('');

	async function onCreate() {
		await contacts.createAddressBook({ name: value });
		value = '';
		contacts.createModal = false;
	}
</script>

{#if contacts.createModal}
	<Modal
		onConfirm={onCreate}
		onCancel={() => {
			contacts.createModal = false;
		}}
		title="Create Address Book"
	>
		<TextInput bind:input bind:value placeholder="Enter address book name" onblur={() => {}} />
	</Modal>
{/if}
