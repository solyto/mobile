<script lang="ts">
	import ColorPicker from '$lib/components/forms/ColorPicker.svelte';
	import IconEye from '$lib/icons/lucide/eye.svelte';
	import IconEyeOff from '$lib/icons/lucide/eye-off.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import InlineActionButton from '$lib/components/ui/buttons/InlineActionButton.svelte';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import type { AddressBook, UpdateAddressBookRequest } from '$lib/types/contact';
	import { getContacts } from '$lib/state/Contacts.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const contacts = getContacts();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let { addressBook }: { addressBook: AddressBook } = $props();

	const NO_COLOR = 'var(--color-c-neutral-2)';

	let hex = $state<string>(addressBook.color ?? NO_COLOR);

	async function onColorChange(): Promise<void> {
		if (hex === NO_COLOR || hex === addressBook.color) return;

		const request: UpdateAddressBookRequest = { color: hex };
		loadingIndicator.start();
		try {
			await contacts.updateAddressBook(addressBook, request);
		} finally {
			loadingIndicator.stop();
		}
	}

	function toggleHidden(): void {
		contacts.toggleAddressBook(addressBook.id);
	}

	function onDelete(): void {
		contacts.activeAddressBook = addressBook;
		contacts.deleteModal = true;
	}
</script>

<div class="flex items-center gap-4">
	<div use:clickOutside={onColorChange}>
		<ColorPicker bind:hex />
	</div>
	<span class="min-w-0 flex-1">{addressBook.name}</span>
	<div class="flex items-center gap-1">
		<InlineActionButton
			onClick={toggleHidden}
			label={ts.get.layout.toggle}
			icon={contacts.isAddressBookHidden(addressBook.id) ? IconEyeOff : IconEye}
			color={contacts.isAddressBookHidden(addressBook.id) ? 'text-c-neutral-3' : 'text-c-primary'}
			fill="bg-c-primary"
		/>
		<InlineDeleteButton onClick={onDelete} />
	</div>
</div>
