<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import type { CreateContactForm, CreateContactRequest } from '$lib/types/contact';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import IconMapPinHouse from '@lucide/svelte/icons/map-pin-house';
	import IconUser from '@lucide/svelte/icons/user';
	import IconPhone from '@lucide/svelte/icons/phone';
	import IconMail from '@lucide/svelte/icons/mail';
	import IconBuilding from '@lucide/svelte/icons/building-2';
	import IconStickyNote from '@lucide/svelte/icons/sticky-note';
	import IconUsersRound from '@lucide/svelte/icons/users-round';
	import IconBookUser from '@lucide/svelte/icons/book-user';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import ChooseAddressBook from '$lib/components/contacts/ChooseAddressBook.svelte';
	import PhoneEdit from '$lib/components/contacts/PhoneEdit.svelte';
	import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import EmailEdit from '$lib/components/contacts/EmailEdit.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';

	const contacts = getContacts();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let loadedContactId = $state<string | null>(null);

	const emptyForm: CreateContactForm = {
		address_book_id: contacts.addressBooks[0].id,
		first_name: '',
		last_name: '',
		middle_name: '',
		prefix: '',
		suffix: '',
		email: [],
		phone: [],
		groups: '',
		organization: '',
		title: '',
		note: '',
		street: '',
		city: '',
		state: '',
		postal_code: '',
		country: ''
	};
	let form = $state<CreateContactForm>(emptyForm);

	$effect(() => {
		if (contacts.activeContact && loadedContactId !== contacts.activeContact.uid) {
			loadFormFromEntry();
			loadedContactId = contacts.activeContact.uid;
		}
	});

	function loadFormFromEntry(): void {
		const c = contacts.activeContact!;
		form.address_book_id = c.address_book_id;
		form.first_name = c.first_name;
		form.last_name = c.last_name;
		form.middle_name = c.middle_name;
		form.prefix = c.prefix;
		form.suffix = c.suffix;
		form.groups = c.groups?.join(', ') || '';
		form.organization = c.organization;
		form.title = c.title;
		form.note = c.note;
		form.street = c.street;
		form.city = c.city;
		form.state = c.state;
		form.postal_code = c.postal_code;
		form.country = c.country;
		form.phone = c.phone ? [...c.phone] : [];
		form.email = c.email ? [...c.email] : [];
	}

	async function onsubmit(): Promise<void> {
		loadingIndicator.start();
		const request: CreateContactRequest = {
			...form,
			full_name: `${form.first_name}${form.middle_name ? ' ' + form.middle_name : ''}${form.last_name ? ' ' + form.last_name : ''}`,
			email: form.email.length > 0 ? JSON.stringify(form.email) : null,
			phone: form.phone.length > 0 ? JSON.stringify(form.phone) : null,
			groups:
				form.groups.length > 0
					? JSON.stringify(form.groups.split(',').map((g) => g.trim()))
					: null
		};

		if (contacts.activeContact) {
			await contacts.update(contacts.activeContact, request);
		} else {
			await contacts.create(request);
		}

		loadingIndicator.stop();
		form = structuredClone(emptyForm);
		contacts.closeCreateModal();
	}
</script>

<ContentModal
	title={contacts.activeContact ? 'Update Contact' : 'Add a Contact'}
	rounded="2xl"
	p="4"
	onClose={() => contacts.closeCreateModal()}
>
	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-4">
			<IconBookUser class="size-4 text-c-btn" />
			<ChooseAddressBook
				bind:addressBook={form.address_book_id}
				availableAddressBooks={contacts.addressBooks}
			/>
		</div>
		<div class="mt-2 flex gap-4">
			<IconUser class="mt-2 size-4 text-c-btn" />
			<div class="flex w-full flex-col gap-2">
				<div class="flex gap-2">
					<TextInput placeholder="First name" bind:value={form.first_name} />
					<TextInput placeholder="Last name" bind:value={form.last_name} />
				</div>
				<div class="flex gap-2">
					<TextInput placeholder="Prefix" bind:value={form.prefix} />
					<TextInput placeholder="Middle name" bind:value={form.middle_name} />
					<TextInput placeholder="Suffix" bind:value={form.suffix} />
				</div>
			</div>
		</div>
		<div class="mt-2 flex gap-4">
			<IconPhone class="mt-2 size-4 text-c-btn" />
			<div class="flex flex-col gap-2">
				{#each form.phone as phone, index (index)}
					<div class="flex gap-2">
						<PhoneEdit bind:value={phone.value} bind:type={phone.type} />
						<InlineDeleteButton onClick={() => { form.phone.splice(index, 1); }} />
					</div>
				{/each}
			</div>
			<AddButton
				colorOnHover={true}
				onClick={() => form.phone.push({ value: '', type: 'mobile' })}
			/>
		</div>
		<div class="mt-2 flex items-center gap-4">
			<IconMail class="size-4 text-c-btn" />
			<div class="flex flex-col gap-2">
				{#each form.email as email, index (index)}
					<div class="flex gap-2">
						<EmailEdit bind:value={email.value} bind:type={email.type} />
						<InlineDeleteButton onClick={() => { form.email.splice(index, 1); }} />
					</div>
				{/each}
			</div>
			<AddButton
				colorOnHover={true}
				onClick={() => form.email.push({ value: '', type: 'home' })}
			/>
		</div>
		<div class="mt-2 flex items-center gap-4">
			<IconUsersRound class="size-4 text-c-btn" />
			<TextInput placeholder="Groups" bind:value={form.groups} />
		</div>
		<div class="mt-2 flex items-center gap-4">
			<IconBuilding class="size-4 text-c-btn" />
			<TextInput placeholder="Organization" bind:value={form.organization} />
		</div>
		<div class="mt-2 flex gap-4">
			<IconMapPinHouse class="mt-2 size-4 text-c-btn" />
			<div class="flex w-full flex-col gap-2">
				<div class="flex gap-2">
					<TextInput placeholder="Street" bind:value={form.street} />
					<TextInput placeholder="City" bind:value={form.city} />
				</div>
				<div class="flex gap-2">
					<TextInput placeholder="Postal Code" bind:value={form.postal_code} />
					<TextInput placeholder="Country" bind:value={form.country} />
				</div>
			</div>
		</div>
		<div class="mt-4 flex items-start gap-4">
			<IconStickyNote class="mt-2 size-4 text-c-btn" />
			<TextInput placeholder="Notes" multiLine={true} height={80} bind:value={form.note} />
		</div>
		<div class="mt-8 flex w-full flex-row items-center justify-end">
			<TextButton title={ts.get.layout.save} onclick={onsubmit} />
		</div>
	</div>
</ContentModal>
