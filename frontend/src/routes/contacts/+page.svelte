<script lang="ts">
	import { onMount } from 'svelte';
	import ListView from '$lib/components/contacts/views/ListView.svelte';
	import ContactDetail from '$lib/components/contacts/ContactDetail.svelte';
	import ContactEdit from '$lib/components/contacts/ContactEdit.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';
	import AddressBookCreateModal from '$lib/components/contacts/AddressBookCreateModal.svelte';
	import AddressBookDeleteModal from '$lib/components/contacts/AddressBookDeleteModal.svelte';
	import ContactNavigation from '$lib/components/contacts/ContactNavigation.svelte';
	import ImportModal from '$lib/components/contacts/ImportModal.svelte';
	import SyncModal from '$lib/components/dav/SyncModal.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';

	const contacts = getContacts();
	const loadingIndicator = getLoadingIndicator();

	onMount(async () => {
		loadingIndicator.start();
		await contacts.load();
		loadingIndicator.stop();
	});
</script>

<div class="flex h-full w-full flex-row">
	{#if contacts.loaded}
		<ContactNavigation />
		<ListView />
		{#if contacts.detailModalVisible}
			<ContactDetail />
		{/if}
		{#if contacts.createModalVisible}
			<ContactEdit />
		{/if}
		<AddressBookCreateModal />
		<AddressBookDeleteModal />
		<ImportModal />
		{#if contacts.syncModal}
			<SyncModal onClose={() => (contacts.syncModal = false)} />
		{/if}
	{/if}
</div>
