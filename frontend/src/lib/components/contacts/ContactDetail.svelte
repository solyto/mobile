<script lang="ts">
	import { getInitials } from '$lib/helpers/NameHelper';
	import IconPhone from '@lucide/svelte/icons/phone';
	import IconMail from '@lucide/svelte/icons/mail';
	import IconUsersRound from '@lucide/svelte/icons/users-round';
	import IconCardSim from '@lucide/svelte/icons/card-sim';
	import IconHouse from '@lucide/svelte/icons/house';
	import IconBriefcaseBusiness from '@lucide/svelte/icons/briefcase-business';
	import IconBookUser from '@lucide/svelte/icons/book-user';
	import IconBuilding from '@lucide/svelte/icons/building-2';
	import IconMapPinHouse from '@lucide/svelte/icons/map-pin-house';
	import IconPlus from '@lucide/svelte/icons/plus';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import Divider from '$lib/components/ui/Divider.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import type { Contact } from '$lib/types/contact';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import { getContacts } from '$lib/state/Contacts.svelte';

	const contacts = getContacts();
	const loadingIndicator = getLoadingIndicator();

	let contact = $derived(contacts.activeContact as Contact);
	let addressBookName = $derived(contacts.addressBooks.find((ab) => ab.id === contact?.address_book_id)?.name ?? '');
	let fileInput = $state<HTMLInputElement | null>(null);
	let selectedFileUrl = $state<string>('');

	async function onDelete(): Promise<void> {
		loadingIndicator.start();
		await contacts.delete(contact as Contact);
		loadingIndicator.stop();
		contacts.closeDetailModal();
	}

	function handleFileSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			selectedFileUrl = URL.createObjectURL(input.files[0]);
			onUpload(input.files[0]);
		}
	}

	async function onUpload(file: File): Promise<void> {
		loadingIndicator.start();
		await contacts.updateContactPhoto(contact as Contact, file);
		loadingIndicator.stop();
	}

	async function onRemove(): Promise<void> {
		loadingIndicator.start();
		await contacts.removeContactPhoto(contact as Contact);
		selectedFileUrl = '';
		loadingIndicator.stop();
	}
</script>

<ContentModal
	rounded="2xl"
	p="4"
	onClose={() => contacts.closeDetailModal()}
	onEdit={() => {
		let activeContact = contact;
		contacts.closeDetailModal();
		contacts.openCreateModal(activeContact);
	}}
	onDelete={() => onDelete()}
>
	<div class="flex h-full w-full items-center gap-8">
		<div class="group relative">
			<div
				class="absolute top-[-15px] right-[-15px] z-40 opacity-0 transition-all group-hover:opacity-100"
			>
				<DeleteButton inModal={false} onClick={() => onRemove()} />
			</div>
			<div
				class="absolute z-30 flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-transparent opacity-0 backdrop-blur-xs transition-all group-hover:opacity-100 dark:bg-s-dark-2/20"
				onclick={() => fileInput?.click()}
				role="button"
				tabindex="0"
			>
				<input
					type="file"
					bind:this={fileInput}
					onchange={handleFileSelect}
					class="hidden"
					accept="image/*"
				/>
				<IconPlus class="group-hover:text-c-btn-dark size-10 text-c-btn" />
			</div>
			{#if selectedFileUrl}
				<img
					src={selectedFileUrl}
					alt="{contact.first_name} {contact.last_name}"
					class="size-20 rounded-full object-cover shadow-xs"
				/>
			{:else if contacts.contactPhotos[contact.uri]}
				<img
					src={contacts.contactPhotos[contact.uri]}
					alt="{contact.first_name} {contact.last_name}"
					class="size-20 rounded-full object-cover shadow-xs"
				/>
			{:else}
				<div
					class="flex size-20 items-center justify-center rounded-full bg-c-neutral-2 text-xl font-bold text-c-btn shadow-xs dark:bg-s-dark-2"
				>
					{getInitials(contact.first_name, contact.last_name)}
				</div>
			{/if}
		</div>
		<div class="text-2xl font-bold">
			{contact.prefix || ''}
			{contact.first_name}
			{contact.last_name}
			{contact.suffix || ''}
		</div>
	</div>
	<div class="mt-8 flex flex-col justify-between gap-8 md:flex-row">
		<div class="flex flex-col gap-1">
			{#each contact.phone ?? [] as phone (phone.value)}
				<a
					href="tel:{phone.value}"
					class="flex min-h-[44px] items-center gap-3 rounded-lg px-1 py-1 transition-colors hover:bg-c-neutral active:bg-c-neutral-2"
				>
					{#if phone.type === 'cell'}
						<IconCardSim class="size-5 flex-shrink-0 text-c-btn" />
					{:else if phone.type === 'home'}
						<IconHouse class="size-5 flex-shrink-0 text-c-btn" />
					{:else if phone.type === 'work'}
						<IconBriefcaseBusiness class="size-5 flex-shrink-0 text-c-btn" />
					{:else}
						<IconPhone class="size-5 flex-shrink-0 text-c-btn" />
					{/if}
					<span class="text-base font-medium">{phone.value}</span>
				</a>
			{/each}
			{#each contact.email ?? [] as email (email.value)}
				<a
					href="mailto:{email.value}"
					class="flex min-h-[44px] items-center gap-3 rounded-lg px-1 py-1 transition-colors hover:bg-c-neutral active:bg-c-neutral-2"
				>
					{#if email.type === 'home'}
						<IconHouse class="size-5 flex-shrink-0 text-c-btn" />
					{:else if email.type === 'work'}
						<IconBriefcaseBusiness class="size-5 flex-shrink-0 text-c-btn" />
					{:else}
						<IconMail class="size-5 flex-shrink-0 text-c-btn" />
					{/if}
					<span class="text-base font-medium">{email.value}</span>
				</a>
			{/each}
		</div>
		<div class="mr-4 flex flex-col gap-2 text-sm">
			<div
				class="flex items-center gap-2 rounded-lg bg-c-neutral px-2 py-1 text-xs text-c-neutral-5 dark:bg-s-dark-2"
			>
				<IconBookUser class="size-4 text-c-btn" />
				<div>{addressBookName}</div>
			</div>
			{#if contact.groups}
				{#each contact.groups as group (group)}
					<div
						class="flex items-center gap-2 rounded-lg bg-c-neutral px-2 py-1 text-xs text-c-neutral-5 dark:bg-s-dark-2"
					>
						<IconUsersRound class="size-4 text-c-btn" />
						<div>{group}</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
	{#if contact.street || contact.city || contact.state || contact.postal_code || contact.country || contact.organization}
		<Divider my={4} />
		<div class="mt-4 flex justify-between gap-8">
			{#if contact.street || contact.city || contact.state || contact.postal_code || contact.country}
				<div class="flex items-center items-start gap-2 text-sm">
					<IconMapPinHouse class="mt-[2px] size-4 text-c-btn" />
					<div>
						{contact.street}
						<br />
						{contact.postal_code}
						{contact.city}
						<br />
						{contact.country}
					</div>
				</div>
			{/if}
			{#if contact.organization}
				<div class="flex items-center gap-2">
					<IconBuilding class="size-4 text-c-btn" />
					<div>{contact.organization}</div>
				</div>
			{/if}
		</div>
	{/if}
	{#if contact.note}
		<Divider my={4} />
		<div class="mt-4 flex justify-between gap-8 text-sm">
			{contact.note}
		</div>
	{/if}
</ContentModal>
