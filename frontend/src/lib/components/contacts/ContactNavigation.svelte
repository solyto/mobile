<script lang="ts">
	import { blur, fade } from 'svelte/transition';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Divider from '$lib/components/ui/Divider.svelte';
	import EditButton from '$lib/components/ui/buttons/EditButton.svelte';
	import ImportButton from '$lib/components/ui/buttons/ImportButton.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';
	import ManageAddressBooks from '$lib/components/contacts/ManageAddressBooks.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import CloudButton from '$lib/components/ui/buttons/CloudButton.svelte';
	import IconFunnel from '@lucide/svelte/icons/funnel';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import FunnelButton from '$lib/components/ui/buttons/FunnelButton.svelte';

	let editMode = $state<boolean>(false);
	let navigation = $state<HTMLDivElement | null>(null);

	const contacts = getContacts();
	const ts = getTranslation();

	function toggleMobile(): void {
		if (navigation) {
			navigation.style.display = 'block';
		}
	}

	function handleNavigation(): void {
		if (navigation && navigation.style.display === 'block') {
			navigation.style.display = 'none';
		}
	}
</script>

<FunnelButton onclick={toggleMobile} />

<div
	bind:this={navigation}
	class="absolute top-0 left-0 z-20 hidden h-full max-h-screen w-full flex-col overflow-y-auto bg-c-bg drop-shadow-xl sm:relative sm:flex sm:w-60 dark:border-r-1 dark:border-s-dark-2 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
	class:lg:w-60={editMode}
	class:lg:w-80={editMode}
	in:fade
>
	{#if !editMode}
		<div class="flex w-full flex-col" in:blur>
			<div class="absolute top-4 right-4 md:hidden">
				<CloseButton onClick={() => handleNavigation()} inModal={false} />
			</div>
			<div class="border-b border-c-neutral-2 p-4 text-2xl font-bold md:hidden 2xl:font-normal dark:border-s-dark-3 mb-4">
				{ts.get.contacts.address_books}
			</div>
			<div class="flex w-full flex-col justify-center md:mt-4">
				<button
					class="relative my-1 h-full w-full cursor-pointer border-r-3 px-4 py-2 text-left font-bold transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
					class:bg-c-neutral={contacts.activeAddressBook === null}
					class:dark:bg-s-dark-3={contacts.activeAddressBook === null}
					class:border-c-border!={contacts.activeAddressBook}
					class:border-c-btn={contacts.activeAddressBook === null}
					onclick={() => {
						contacts.selectAddressBook(null);
						handleNavigation();
					}}
				>
					All
					<Badge
						i={contacts.contactTotal}
						color="var(--color-c-btn-hover)"
						top="6px"
						right="10px"
					/>
				</button>
				{#each contacts.addressBooks as addressBook (addressBook.id)}
					{#if !contacts.isAddressBookHidden(addressBook.id)}
						<button
							class="relative my-1 flex h-full w-full cursor-pointer items-center gap-2 border-r-3 px-4 py-2 text-left font-bold transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
							class:bg-c-neutral={addressBook.id === contacts.activeAddressBook?.id}
							class:dark:bg-s-dark-3={addressBook.id === contacts.activeAddressBook?.id}
							class:border-c-border!={addressBook.id !== contacts.activeAddressBook?.id}
							style="border-color: {addressBook.color ?? 'var(--color-c-neutral-2)'}"
							onclick={() => {
								contacts.selectAddressBook(addressBook);
								handleNavigation();
							}}
						>
							<span>{addressBook.name}</span>
							<Badge
								i={contacts.getAddressBookCount(addressBook.id)}
								color={addressBook.color ?? 'var(--color-c-neutral-2)'}
								light={!addressBook.color}
								top="6px"
								right="10px"
							/>
						</button>
					{/if}
				{/each}
			</div>
			<Divider />
			<div class="flex w-full items-center justify-center gap-4">
				<EditButton
					inModal={false}
					onClick={() => {
						editMode = true;
					}}
				/>
				<ImportButton
					onClick={() => {
						contacts.importModal = true;
					}}
				/>
				<CloudButton
					onClick={() => {
						contacts.syncModal = true;
					}}
					title={ts.get.dav.synchronize}
				/>
			</div>
		</div>
	{/if}
	{#if editMode}
		<div in:blur>
			<ManageAddressBooks
				onClose={() => {
					editMode = false;
				}}
			/>
		</div>
	{/if}
</div>
