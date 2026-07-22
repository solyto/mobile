<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { AddressBook } from '$lib/types/contact';

	let { addressBook = $bindable(), availableAddressBooks } = $props<{
		addressBook: number;
		availableAddressBooks: AddressBook[];
		preSelect?: AddressBook;
	}>();

	const ts = getTranslation();

	let menuOpen = $state<boolean>(false);
	let selectedAddressBook = $derived(getSelected(addressBook) ?? availableAddressBooks[0]);

	$effect(() => {
		addressBook = selectedAddressBook.id;
	});

	function getSelected(id: number): AddressBook | null {
		if (!id) return null;

		return availableAddressBooks.find((c: AddressBook) => c.id === id) || null;
	}
</script>

<div
	role="button"
	tabindex="0"
	class="relative z-50 flex h-10 w-full cursor-pointer items-center justify-start rounded-lg border-1 border-c-neutral-2 px-3 text-sm text-c-neutral-5 shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-2 dark:bg-s-dark-3 dark:focus:ring-c-primary"
	onclick={() => {
		menuOpen = !menuOpen;
	}}
>
	{#if selectedAddressBook}
		<div class="border-l-4 border-c-warning pl-4 dark:text-white">
			{selectedAddressBook.name}
		</div>
	{:else}
		{ts.get.calendar.choose_calendar}
	{/if}
	{#if menuOpen}
		<div
			class="absolute top-10 right-0 z-40 flex max-h-40 w-full flex-col gap-1 overflow-y-auto rounded-lg bg-white p-3 shadow-lg dark:bg-s-dark-3"
		>
			{#each availableAddressBooks as a (a.id)}
				<button
					class="cursor-pointer border-l-4 border-c-warning py-1 pl-4 text-left hover:bg-c-neutral"
					onclick={() => {
						addressBook = a.id;
					}}
				>
					{a.name}
				</button>
			{/each}
		</div>
	{/if}
</div>
