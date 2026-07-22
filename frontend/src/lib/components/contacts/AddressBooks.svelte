<script lang="ts">
	import { fade } from 'svelte/transition';
	import Badge from '$lib/components/ui/Badge.svelte';
	import AddressBook from '$lib/components/contacts/AddressBook.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';
	import AddButton from '$lib/components/ui/buttons/AddButton.svelte';

	const contacts = getContacts();
</script>

{#if contacts.loaded}
	<div class="mr-auto flex items-center gap-2 gap-4 max-md:hidden" in:fade>
		<button
			class="relative cursor-pointer touch-manipulation gap-2 rounded-sm bg-white p-8 font-bold drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral max-md:w-full dark:bg-s-dark-3 dark:hover:bg-s-dark-2"
			onclick={() => contacts.selectAddressBook(null)}
		>
			All
			<Badge i={contacts.contacts.length} color="var(--color-c-btn-hover)" />
			<div
				class="absolute bottom-0 left-0 h-1 w-full rounded-lg bg-[var(--color-c-btn-hover)] opacity-0 transition-all"
				class:opacity-100={contacts.activeAddressBook === null}
			></div>
		</button>
		{#each contacts.addressBooks as addressBook (addressBook.name)}
			<div class="relative flex">
				<AddressBook {addressBook} />
			</div>
		{/each}
		<div class="ml-8">
			<AddButton
				onClick={() => {
					contacts.createModal = true;
				}}
			/>
		</div>
	</div>
{/if}
