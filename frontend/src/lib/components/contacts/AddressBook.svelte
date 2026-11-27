<script lang="ts">
	import IconPen from '$lib/icons/lucide/pen.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { AddressBook, UpdateAddressBookRequest } from '$lib/types/contact';
	import { getContacts } from '$lib/state/Contacts.svelte';
	import ColorPicker from '$lib/components/forms/ColorPicker.svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';

	const contacts = getContacts();
	const loadingIndicator = getLoadingIndicator();

	let { addressBook }: {
		addressBook: AddressBook;
	} = $props();

	let edit = $state<boolean>(false);
	let hex = $state<string>(addressBook.color ?? 'var(--color-c-neutral-2)');

	function toggleEdit() {
		edit = !edit;
	}

	function color(): string {
		return addressBook.color ?? 'var(--color-c-primary)';
	}

	function select(): void {
		contacts.selectAddressBook(addressBook);
	}

	async function onColorChange(): Promise<void> {
		if (hex === addressBook.color) return;

		const request: UpdateAddressBookRequest = { color: hex };
		loadingIndicator.start();
		try {
			await contacts.updateAddressBook(addressBook, request);
		} finally {
			loadingIndicator.stop();
		}
	}

	function closeColorPicker(): void {
		onColorChange();
		toggleEdit();
	}
</script>

<div
	role="button"
	tabindex="0"
	class="group relative cursor-pointer touch-manipulation gap-2 rounded-sm bg-c-bg-surface p-8 font-bold drop-shadow-sm transition-all not-dark:border-1 not-dark:border-c-neutral-1 hover:bg-c-neutral max-md:w-full dark:hover:bg-s-dark-2"
	onclick={select}
>
	{addressBook.name}
	<Badge
		i={contacts.getAddressBookCount(addressBook.id)}
		color={color()}
		light={addressBook.color === 'var(--color-c-neutral-2)'}
	/>
	<div
		class="absolute bottom-0 left-0 h-1 w-full rounded-lg opacity-0 transition-all"
		style="background-color: {color()};"
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
		use:clickOutside={closeColorPicker}
	>
		<ColorPicker bind:hex isDialog={false} />
	</div>
{/if}
