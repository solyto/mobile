<script lang="ts">
	import IconChevronLeft from '@lucide/svelte/icons/chevron-left';
	import { getContacts } from '$lib/state/Contacts.svelte';
	import AddressBookEdit from '$lib/components/contacts/AddressBookEdit.svelte';
	import AddressBookCreate from '$lib/components/contacts/AddressBookCreate.svelte';

	let { onClose } = $props<{ onClose: () => void }>();

	const contacts = getContacts();
</script>

<div class="flex h-full w-full flex-col justify-center gap-2 p-4">
	<button
		onclick={onClose}
		class="cursor-pointer self-center rounded-full bg-c-neutral p-2 transition-all hover:bg-white dark:bg-s-dark-3 dark:hover:bg-s-dark-2"
	>
		<IconChevronLeft class="h-6 w-6" />
	</button>
	{#each contacts.addressBooks as addressBook (addressBook.id)}
		<AddressBookEdit {addressBook} />
	{/each}
	<AddressBookCreate />
</div>
