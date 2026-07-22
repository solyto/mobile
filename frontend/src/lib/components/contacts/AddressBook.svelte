<script lang="ts">
	import IconPen from '@lucide/svelte/icons/pen';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { AddressBook, UpdateAddressBookRequest } from '$lib/types/contact';
	import { getContacts } from '$lib/state/Contacts.svelte';
	import ColorPicker from 'svelte-awesome-color-picker';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';

	const contacts = getContacts();
	const loadingIndicator = getLoadingIndicator();

	let { addressBook } = $props<{
		addressBook: AddressBook;
	}>();

	let edit = $state<boolean>(false);
	let hex = $state<string>(addressBook.color ?? 'var(--color-c-neutral-2)');

	function toggleEdit() {
		edit = !edit;
	}

	async function onColorChange(): Promise<void> {
		if (hex === addressBook.color) return;

		loadingIndicator.start();
		const request: UpdateAddressBookRequest = { color: hex };
		await contacts.updateAddressBook(addressBook, request);
		loadingIndicator.stop();
	}
</script>

<div
	role="button"
	tabindex="0"
	class="group relative cursor-pointer touch-manipulation gap-2 rounded-sm bg-white p-8 font-bold drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral max-md:w-full dark:bg-s-dark-3 dark:hover:bg-s-dark-2"
	onclick={() => contacts.selectAddressBook(addressBook)}
>
	{addressBook.name}
	<Badge
		i={contacts.getAddressBookCount(addressBook.name)}
		color={addressBook.color ?? 'var(--color-c-primary)'}
		light={addressBook.color === 'var(--color-c-neutral-2)'}
	/>
	<div
		class="absolute bottom-0 left-0 h-1 w-full rounded-lg opacity-0 transition-all"
		style="background-color: {addressBook.color ?? 'var(--color-c-primary)'};"
		class:opacity-100={contacts.activeAddressBook?.name === addressBook.name}
	></div>
	<div
		class="absolute right-[-9px] bottom-[-4px] opacity-0 transition-all group-hover:opacity-100"
	>
		<button
			class="z-40 flex size-[24px] cursor-pointer items-center justify-center rounded-full bg-c-btn text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
			onclick={toggleEdit}
		>
			<IconPen class="size-4" />
		</button>
	</div>
</div>
{#if edit}
	<div
		class="absolute top-15 left-15 z-80"
		use:clickOutside={() => {
			onColorChange();
			toggleEdit();
		}}
	>
		<ColorPicker
			bind:hex
			position="responsive"
			nullable={false}
			label=""
			isTextInput={false}
			--cp-border-color="var(--color-c-neutral-2)"
			isDialog={false}
		/>
	</div>
{/if}
