<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import type { CreateContactForm } from '$lib/types/contact';
	import ContactFormService from '$lib/services/ContactFormService';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import IconMapPinHouse from '$lib/icons/lucide/map-pin-house.svelte';
	import IconUser from '$lib/icons/lucide/user.svelte';
	import IconPhone from '$lib/icons/lucide/phone.svelte';
	import IconMail from '$lib/icons/lucide/mail.svelte';
	import IconBuilding from '$lib/icons/lucide/building-complex.svelte';
	import IconStickyNote from '$lib/icons/lucide/sticky-note.svelte';
	import IconUsersRound from '$lib/icons/lucide/users-round.svelte';
	import IconBookUser from '$lib/icons/lucide/book-user.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import ChooseAddressBook from '$lib/components/contacts/ChooseAddressBook.svelte';
	import ContactTypeValueEdit from '$lib/components/contacts/ContactTypeValueEdit.svelte';
	import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';

	const contacts = getContacts();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	const formService = new ContactFormService();
	const PHONE_TYPES = ['cell', 'home', 'work', 'other'];
	const EMAIL_TYPES = ['home', 'work', 'other'];

	let form = $state<CreateContactForm>(initialForm());

	const canSubmit = $derived(formService.hasName(form));

	function initialForm(): CreateContactForm {
		if (contacts.activeContact) return formService.fromContact(contacts.activeContact);
		return formService.emptyForm(contacts.addressBooks[0].id);
	}

	function close(): void {
		contacts.closeCreateModal();
	}

	function addPhone(): void {
		form.phone.push({ value: '', type: 'mobile' });
	}

	function removePhone(index: number): void {
		form.phone.splice(index, 1);
	}

	function addEmail(): void {
		form.email.push({ value: '', type: 'home' });
	}

	function removeEmail(index: number): void {
		form.email.splice(index, 1);
	}

	async function onsubmit(): Promise<void> {
		if (!canSubmit) {
			notifications.error(ts.get.contacts.name_required);
			return;
		}

		const request = formService.toRequest(form);

		loadingIndicator.start();
		let saved: boolean;
		try {
			saved = contacts.activeContact ? await contacts.update(contacts.activeContact, request) : await contacts.create(request);
		} finally {
			loadingIndicator.stop();
		}

		if (!saved) {
			notifications.error(ts.get.contacts.save_error);
			return;
		}

		form = formService.emptyForm(contacts.addressBooks[0].id);
		contacts.closeCreateModal();
	}
</script>

<ContentModal
	title={contacts.activeContact ? ts.get.contacts.update_title : ts.get.contacts.add_title}
	rounded="2xl"
	p="4"
	onClose={close}
>
	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-4">
			<IconBookUser class="size-4 text-c-btn" />
			<ChooseAddressBook bind:addressBook={form.address_book_id} availableAddressBooks={contacts.addressBooks} />
		</div>
		<div class="mt-2 flex gap-4">
			<IconUser class="mt-2 size-4 text-c-btn" />
			<div class="flex w-full flex-col gap-2">
				<div class="flex gap-2">
					<TextInput placeholder={ts.get.contacts.first_name} bind:value={form.first_name} />
					<TextInput placeholder={ts.get.contacts.last_name} bind:value={form.last_name} />
				</div>
				<div class="flex gap-2">
					<TextInput placeholder={ts.get.contacts.prefix} bind:value={form.prefix} />
					<TextInput placeholder={ts.get.contacts.middle_name} bind:value={form.middle_name} />
					<TextInput placeholder={ts.get.contacts.suffix} bind:value={form.suffix} />
				</div>
			</div>
		</div>
		<div class="mt-2 flex gap-4">
			<IconPhone class="mt-2 size-4 text-c-btn" />
			<div class="flex flex-col gap-2">
				{#each form.phone as phone, index (index)}
					<div class="flex gap-2">
						<ContactTypeValueEdit bind:value={phone.value} bind:type={phone.type} placeholder={ts.get.contacts.phone_placeholder} types={PHONE_TYPES} otherIcon={IconPhone} />
						<InlineDeleteButton onClick={() => removePhone(index)} />
					</div>
				{/each}
			</div>
			<AddButton colorOnHover={true} onClick={addPhone} />
		</div>
		<div class="mt-2 flex items-center gap-4">
			<IconMail class="size-4 text-c-btn" />
			<div class="flex flex-col gap-2">
				{#each form.email as email, index (index)}
					<div class="flex gap-2">
						<ContactTypeValueEdit bind:value={email.value} bind:type={email.type} placeholder={ts.get.contacts.email_placeholder} types={EMAIL_TYPES} otherIcon={IconMail} />
						<InlineDeleteButton onClick={() => removeEmail(index)} />
					</div>
				{/each}
			</div>
			<AddButton colorOnHover={true} onClick={addEmail} />
		</div>
		<div class="mt-2 flex items-center gap-4">
			<IconUsersRound class="size-4 text-c-btn" />
			<TextInput placeholder={ts.get.contacts.groups} bind:value={form.groups} />
		</div>
		<div class="mt-2 flex items-center gap-4">
			<IconBuilding class="size-4 text-c-btn" />
			<TextInput placeholder={ts.get.contacts.organization} bind:value={form.organization} />
		</div>
		<div class="mt-2 flex gap-4">
			<IconMapPinHouse class="mt-2 size-4 text-c-btn" />
			<div class="flex w-full flex-col gap-2">
				<div class="flex gap-2">
					<TextInput placeholder={ts.get.contacts.street} bind:value={form.street} />
					<TextInput placeholder={ts.get.contacts.city} bind:value={form.city} />
				</div>
				<div class="flex gap-2">
					<TextInput placeholder={ts.get.contacts.postal_code} bind:value={form.postal_code} />
					<TextInput placeholder={ts.get.contacts.country} bind:value={form.country} />
				</div>
			</div>
		</div>
		<div class="mt-4 flex items-start gap-4">
			<IconStickyNote class="mt-2 size-4 text-c-btn" />
			<TextInput placeholder={ts.get.contacts.notes} multiLine={true} height={80} bind:value={form.note} />
		</div>
		<div class="mt-8 flex w-full flex-row items-center justify-end">
			<TextButton title={ts.get.layout.save} onclick={onsubmit} disabled={!canSubmit} />
		</div>
	</div>
</ContentModal>
