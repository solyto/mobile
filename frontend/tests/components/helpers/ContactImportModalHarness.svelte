<script lang="ts">
	import { onDestroy } from 'svelte';
	import ImportModal from '$lib/components/contacts/ImportModal.svelte';
	import { setContacts, type Contacts } from '$lib/state/Contacts.svelte';
	import { setContactImport, type ContactImport } from '$lib/state/ContactImport.svelte';
	import type { AddressBook, ImportState } from '$lib/types/contact';

	let { addressBooks = [], state = null, onStore, onContacts }: {
		addressBooks?: AddressBook[];
		state?: ImportState | null;
		onStore?: (store: ContactImport) => void;
		onContacts?: (store: Contacts) => void;
	} = $props();

	const contacts = setContacts();
	// svelte-ignore state_referenced_locally
	contacts.addressBooks = addressBooks;
	// svelte-ignore state_referenced_locally
	onContacts?.(contacts);
	const contactImport = setContactImport();
	// svelte-ignore state_referenced_locally
	contactImport.state = state;
	contactImport.importModal = true;
	// svelte-ignore state_referenced_locally
	onStore?.(contactImport);

	onDestroy(() => contactImport.destroy());
</script>

<ImportModal />
