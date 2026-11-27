import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import type { Component } from 'svelte';
import { setContacts, type Contacts } from '$lib/state/Contacts.svelte';
import type { LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
import ContactEdit from '$lib/components/contacts/ContactEdit.svelte';
import AddressBookCreateModal from '$lib/components/contacts/AddressBookCreateModal.svelte';
import AddressBookEdit from '$lib/components/contacts/AddressBookEdit.svelte';
import { renderWithContext } from './helpers/context';
import { rejectionsDuring } from './helpers/rejections';
import StoreHarness from './helpers/StoreHarness.svelte';
import { addressBook, contact } from '../unit/helpers/factories';

let loadingIndicator: LoadingIndicator;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderContacts(component: Component<any>, seed: (contacts: Contacts) => void = () => {}): Contacts {
	let store: Contacts | null = null;
	renderWithContext(StoreHarness, {
		component,
		provide: setContacts,
		onReady: (contacts: Contacts) => {
			contacts.addressBooks = [addressBook({ id: 4 })];
			seed(contacts);
			store = contacts;
		}
	}, { onReady: (stores) => (loadingIndicator = stores.loadingIndicator as LoadingIndicator) });
	return store!;
}

async function type(placeholder: string, value: string): Promise<void> {
	await fireEvent.input(screen.getByPlaceholderText(placeholder), { target: { value } });
}

describe('Contact form', () => {
	it('sends a new contact with the name parts joined and lists as JSON', async () => {
		const contacts = renderContacts(ContactEdit, (store) => {
			store.create = vi.fn().mockResolvedValue(true);
		});

		await type('First name', 'Ada');
		await type('Middle name', 'King');
		await type('Last name', 'Lovelace');
		await type('Groups', 'Family, Math ');
		await type('City', 'London');
		await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

		expect(contacts.create).toHaveBeenCalledWith({
			address_book_id: 4,
			first_name: 'Ada',
			last_name: 'Lovelace',
			middle_name: 'King',
			prefix: '',
			suffix: '',
			full_name: 'Ada King Lovelace',
			email: null,
			phone: null,
			groups: JSON.stringify(['Family', 'Math']),
			organization: '',
			title: '',
			note: '',
			street: '',
			city: 'London',
			state: '',
			postal_code: '',
			country: ''
		});
	});

	it('updates an existing contact with its phone numbers and emails', async () => {
		const existing = contact({
			address_book_id: 4,
			phone: [{ value: '123', type: 'cell' }],
			email: [{ value: 'a@example.org', type: 'work' }],
			groups: ['Friends']
		});
		const contacts = renderContacts(ContactEdit, (store) => {
			store.activeContact = existing;
			store.update = vi.fn().mockResolvedValue(true);
		});

		await fireEvent.click(screen.getByRole('button', { name: 'Save' }));

		expect(contacts.update).toHaveBeenCalledWith(existing, expect.objectContaining({
			full_name: 'Alice Example',
			phone: JSON.stringify([{ value: '123', type: 'cell' }]),
			email: JSON.stringify([{ value: 'a@example.org', type: 'work' }]),
			groups: JSON.stringify(['Friends'])
		}));
	});

	it('offers four phone types and three email types, and shows the chosen one', async () => {
		renderContacts(ContactEdit, (store) => {
			store.activeContact = contact({ address_book_id: 4, phone: [{ value: '123', type: 'other' }], email: [{ value: 'a@example.org', type: 'other' }] });
		});

		for (const [placeholder, count] of [['Phone number', 4], ['Email', 3]] as const) {
			const trigger = screen.getByPlaceholderText(placeholder).parentElement!.querySelector('button')!;
			await fireEvent.click(trigger);
			const options = [...trigger.nextElementSibling!.querySelectorAll('button')];
			expect(options).toHaveLength(count);

			const chosen = options[1].innerHTML;
			await fireEvent.click(options[1]);

			expect(trigger.nextElementSibling).toBeNull();
			expect(trigger.innerHTML).toBe(chosen);
		}
	});

	it('stops the loading indicator even when saving throws', async () => {
		renderContacts(ContactEdit, (store) => {
			store.activeContact = contact({ address_book_id: 4 });
			store.update = vi.fn().mockRejectedValue(new Error('offline'));
		});

		const rejections = await rejectionsDuring(() => fireEvent.click(screen.getByRole('button', { name: 'Save' })).then(() => {}));

		expect(rejections).toEqual([new Error('offline')]);
		expect(loadingIndicator.active).toBe(false);
	});
});

describe('Address book creation', () => {
	it('creates the named address book and closes', async () => {
		const contacts = renderContacts(AddressBookCreateModal, (store) => {
			store.createModal = true;
			store.createAddressBook = vi.fn().mockResolvedValue(true);
		});

		await type('Enter address book name', 'Work');
		await fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

		expect(contacts.createAddressBook).toHaveBeenCalledWith({ name: 'Work' });
		expect(contacts.createModal).toBe(false);
	});
});

describe('Address book row', () => {
	it('hides and shows the address book with the toggle button', async () => {
		let contacts!: Contacts;
		renderWithContext(StoreHarness, {
			component: AddressBookEdit,
			props: { addressBook: addressBook({ id: 4 }) },
			provide: setContacts,
			onReady: (store: Contacts) => (contacts = store)
		});

		await fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
		expect(contacts.isAddressBookHidden(4)).toBe(true);

		await fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
		expect(contacts.isAddressBookHidden(4)).toBe(false);
	});

	it('sends no colour for an address book without one when clicking outside', async () => {
		let contacts!: Contacts;
		renderWithContext(StoreHarness, {
			component: AddressBookEdit,
			props: { addressBook: addressBook({ id: 4, color: null }) },
			provide: setContacts,
			onReady: (store: Contacts) => {
				contacts = store;
				store.updateAddressBook = vi.fn().mockResolvedValue(true);
			}
		});

		await fireEvent.mouseDown(document.body);

		expect(contacts.updateAddressBook).not.toHaveBeenCalled();
	});
});
