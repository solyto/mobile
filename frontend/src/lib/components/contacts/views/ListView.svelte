<script lang="ts">
	import { getInitials } from '$lib/helpers/NameHelper';
	import { onDestroy } from 'svelte';
	import ContactHeader from '$lib/components/contacts/ContactHeader.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';

	const contacts = getContacts();

	let sectionRefs: Record<string, HTMLDivElement> = {};

	function scrollToSection(letter: string) {
		sectionRefs[letter]?.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
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
		{#each Object.entries(contacts.contactsAZ) as [letter, entries] (letter)}
			{#if entries.length > 0}
				<div class="w-full py-4 text-2xl font-bold" bind:this={sectionRefs[letter]}>
					<span class="rounded-full bg-c-heading px-4 py-1 text-white dark:bg-c-primary"
						>{letter}</span
					>
				</div>
				<div class="flex w-full flex-wrap gap-4">
					{#each entries as contact (contact.address_book_id + '-' + contact.uid)}
						<button
							type="button"
							class="cursor-pointer transition-all max-md:w-full"
							onclick={() => contacts.openDetailModal(contact)}
						>
							<div
								class="relative h-full w-full rounded-lg bg-c-bg-surface px-2 py-3 shadow-sm transition-all hover:bg-c-bg-elevated md:w-96"
							>
								{#if contact.groups}
									<div
										class="absolute top-0 right-0 rounded-tr-lg rounded-bl-lg bg-c-neutral px-2 py-1 text-xs text-c-neutral-5 dark:bg-s-dark-3 dark:text-c-neutral-4"
									>
										{contact.groups.join(', ')}
									</div>
								{/if}
								<div class="flex h-full w-full items-center gap-4">
									<div
										class="ml-1 h-full w-1 flex-shrink-0 rounded-full"
										style="background-color: {contacts.getAddressBookColor(contact.address_book_id)}"
									></div>
									{#if contacts.contactPhotos[contact.uri]}
										<img
											src={contacts.contactPhotos[contact.uri]}
											alt="{contact.first_name} {contact.last_name}"
											class="size-12 rounded-full object-cover shadow-xs"
										/>
									{:else}
										<div
											class="flex size-12 items-center justify-center rounded-full bg-c-neutral-2 text-xl font-bold text-c-btn shadow-xs dark:bg-s-dark-3"
										>
											{getInitials(contact.first_name, contact.last_name)}
										</div>
									{/if}
									<div class="text-lg">
										{contact.first_name}
										{contact.last_name}
									</div>
								</div>
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
