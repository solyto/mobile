<script lang="ts">
	import { getInitials } from '$lib/helpers/NameHelper';
	import { onDestroy } from 'svelte';
	import ContactHeader from '$lib/components/contacts/ContactHeader.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	const contacts = getContacts();
	const ts = getTranslation();

	let sectionRefs: Record<string, HTMLDivElement> = {};

	function scrollToSection(letter: string) {
		sectionRefs[letter]?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	}

	function hasVisibleContacts(): boolean {
		return Object.values(contacts.contactsAZ).some((entries) => entries.length > 0);
	}

	onDestroy(() => {
		Object.values(contacts.contactPhotos).forEach((url) => URL.revokeObjectURL(url));
	});
</script>

{#if contacts.loaded}
	<div
		class="flex h-full w-full flex-col gap-4 overflow-y-auto bg-c-bg p-4 drop-shadow-xl md:p-8"
	>
		<ContactHeader />
		{#if contacts.contacts.length === 0}
			<EmptyState title={ts.get.contacts.no_contacts} description={ts.get.contacts.no_contacts_desc} py={4} />
		{:else if !hasVisibleContacts()}
			<EmptyState title={ts.get.contacts.no_visible_contacts} description={ts.get.contacts.no_visible_contacts_desc} py={4} />
		{/if}
		{#each Object.entries(contacts.contactsAZ) as [letter, entries] (letter)}
			{#if entries.length > 0}
				<div class="flex w-full items-center gap-4 pt-4" bind:this={sectionRefs[letter]}>
					<span class="text-2xl font-bold text-c-neutral-5 dark:text-c-neutral-4">{letter}</span>
					<span class="h-px flex-1 bg-c-neutral-1 dark:bg-s-dark-3"></span>
				</div>
				<div class="grid w-full grid-cols-[repeat(auto-fill,minmax(min(20rem,100%),1fr))] gap-x-4 gap-y-1">
					{#each entries as contact (contact.address_book_id + '-' + contact.uid)}
						<button
							type="button"
							class="flex w-full min-w-0 cursor-pointer items-center gap-4 rounded-lg px-2 py-2 text-left transition-colors hover:bg-c-neutral dark:hover:bg-s-dark-3"
							onclick={() => contacts.openDetailModal(contact)}
						>
							{#if contacts.contactPhotos[contact.uri]}
								<img
									src={contacts.contactPhotos[contact.uri]}
									alt="{contact.first_name} {contact.last_name}"
									class="size-12 shrink-0 rounded-full object-cover shadow-xs"
								/>
							{:else}
								<div
									class="flex size-12 shrink-0 items-center justify-center rounded-full bg-c-neutral-2 text-xl font-bold text-c-btn shadow-xs dark:bg-s-dark-3"
								>
									{getInitials(contact.first_name, contact.last_name)}
								</div>
							{/if}
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									{#if contacts.activeAddressBook === null}
										<span
											class="size-2 shrink-0 rounded-full"
											style="background-color: {contacts.getAddressBookColor(contact.address_book_id)};"
										></span>
									{/if}
									<span class="truncate text-lg">{contact.first_name} {contact.last_name}</span>
								</div>
								{#if contact.groups}
									<div class="truncate text-sm text-c-neutral-5 dark:text-c-neutral-4" class:pl-4={contacts.activeAddressBook === null}>{contact.groups.join(', ')}</div>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/if}
		{/each}
	</div>
	<div class="top-0 right-0 flex w-16 flex-col items-center gap-3 py-4 max-md:hidden">
		{#each Object.keys(contacts.contactsAZ) as letter (letter)}
			<div
				class="group relative z-40 flex size-[34px] cursor-pointer items-center justify-center text-c-heading drop-shadow-md transition-all hover:drop-shadow-xl dark:text-c-primary"
			>
				<button
					class="absolute flex h-0 w-0 cursor-pointer items-center justify-center rounded-full bg-c-heading text-white transition-all group-hover:h-full group-hover:w-full hover:shadow-sm dark:bg-c-primary"
					onclick={() => scrollToSection(letter)}
				>
					<span class="opacity-0 transition-all group-hover:opacity-100">{letter}</span>
				</button>
				{letter}
			</div>
		{/each}
	</div>
{/if}
