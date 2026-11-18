import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Contacts } from '$lib/state/Contacts.svelte';
import { api, storage, resetStoreMocks } from '../setup/storeMocks';
import type { Contact, AddressBook, CreateContactRequest } from '$lib/types/contact';

function contact(overrides: Partial<Contact> = {}): Contact {
	return {
		uid: 'u1',
		uri: 'contact-1',
		full_name: 'Alice Example',
		first_name: 'Alice',
		last_name: 'Example',
		middle_name: '',
		prefix: '',
		suffix: '',
		email: null,
		phone: null,
		groups: null,
		organization: '',
		title: '',
		note: '',
		street: '',
		city: '',
		state: '',
		postal_code: '',
		country: '',
		etag: '',
		address_book_id: 1,
		address_book_color: '#fff',
		...overrides
	};
}

function addressBook(overrides: Partial<AddressBook> = {}): AddressBook {
	return {
		id: 1,
		name: 'Personal',
		uri: 'ab-1',
		color: '#ff0000',
		description: '',
		...overrides
	};
}

beforeEach(() => {
	resetStoreMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('Contacts store', () => {
	describe('contactsAZ', () => {
		it('groups contacts by the first letter of the first name', () => {
			const s = new Contacts();
			s.contacts = [contact({ first_name: 'Alice' }), contact({ first_name: 'Bob' })];
			expect(s.contactsAZ['A'].map((c) => c.first_name)).toEqual(['Alice']);
			expect(s.contactsAZ['B'].map((c) => c.first_name)).toEqual(['Bob']);
			expect(s.contactsAZ['Z']).toEqual([]);
		});

		it('sorts the entries in each letter group', () => {
			const s = new Contacts();
			s.contacts = [contact({ first_name: 'Zed' }), contact({ first_name: 'Anna' })];
			expect(s.contactsAZ['A'].map((c) => c.first_name)).toEqual(['Anna']);
		});

		it('excludes contacts from hidden address books', () => {
			const s = new Contacts();
			s.contacts = [
				contact({ first_name: 'Alice', address_book_id: 1 }),
				contact({ first_name: 'Bob', address_book_id: 2 })
			];
			s.hiddenAddressBooks = [1];
			expect(s.contactsAZ['A']).toEqual([]);
			expect(s.contactsAZ['B'].map((c) => c.first_name)).toEqual(['Bob']);
		});

		it('restricts to the active address book when set', () => {
			const s = new Contacts();
			s.contacts = [
				contact({ first_name: 'Alice', address_book_id: 1 }),
				contact({ first_name: 'Bob', address_book_id: 2 })
			];
			s.activeAddressBook = addressBook({ id: 2 });
			expect(s.contactsAZ['A']).toEqual([]);
			expect(s.contactsAZ['B'].map((c) => c.first_name)).toEqual(['Bob']);
		});

		it('prefers search entries when a search is active', () => {
			const s = new Contacts();
			s.contacts = [contact({ first_name: 'Alice' })];
			s.searchEntries = [contact({ first_name: 'Alice' }), contact({ first_name: 'Anna' })];
			expect(s.contactsAZ['A']).toHaveLength(2);
		});
	});

	describe('contactTotal', () => {
		it('counts all contacts', () => {
			const s = new Contacts();
			s.contacts = [contact(), contact({ uri: 'c2' })];
			expect(s.contactTotal).toBe(2);
		});

		it('excludes contacts from hidden address books', () => {
			const s = new Contacts();
			s.contacts = [contact(), contact({ uri: 'c2', address_book_id: 2 })];
			s.hiddenAddressBooks = [2];
			expect(s.contactTotal).toBe(1);
		});
	});

	describe('search', () => {
		it('filters contacts by first or last name', () => {
			const s = new Contacts();
			s.contacts = [
				contact({ first_name: 'Alice', last_name: 'Smith' }),
				contact({ first_name: 'Bob', last_name: 'Miller' })
			];
			s.search('alice');
			expect(s.searchEntries.map((c) => c.first_name)).toEqual(['Alice']);
			s.search('miller');
			expect(s.searchEntries.map((c) => c.last_name)).toEqual(['Miller']);
		});

		it('is case-insensitive', () => {
			const s = new Contacts();
			s.contacts = [contact({ first_name: 'Alice' })];
			s.search('ALICE');
			expect(s.searchEntries).toHaveLength(1);
		});

		it('ignores empty search terms', () => {
			const s = new Contacts();
			s.contacts = [contact()];
			s.search('');
			expect(s.searchEntries).toEqual([]);
		});

		it('clearSearch resets the entries', () => {
			const s = new Contacts();
			s.contacts = [contact()];
			s.search('alice');
			s.clearSearch();
			expect(s.searchEntries).toEqual([]);
		});
	});

	describe('hidden address books', () => {
		it('toggleAddressBook adds and removes ids and persists', () => {
			const s = new Contacts();
			s.toggleAddressBook(1);
			expect(s.isAddressBookHidden(1)).toBe(true);
			expect(storage.setJson).toHaveBeenCalledWith(Contacts.LS_HIDDEN_KEY, [1]);

			s.toggleAddressBook(1);
			expect(s.isAddressBookHidden(1)).toBe(false);
		});

		it('loadHidden reads the persisted ids', () => {
			storage.getJson.mockReturnValue([2, 3]);
			const s = new Contacts();
			s.loadHidden();
			expect(s.hiddenAddressBooks).toEqual([2, 3]);
		});

		it('loadHidden falls back to an empty list', () => {
			storage.getJson.mockReturnValue(null);
			const s = new Contacts();
			s.loadHidden();
			expect(s.hiddenAddressBooks).toEqual([]);
		});
	});

	describe('address book helpers', () => {
		it('getAddressBookColor returns the stored color or the fallback', () => {
			const s = new Contacts();
			s.addressBooks = [addressBook({ id: 1, color: '#123456' })];
			expect(s.getAddressBookColor(1)).toBe('#123456');
			expect(s.getAddressBookColor(99)).toBe('var(--color-c-neutral-2)');
		});

		it('getAddressBookCount counts contacts in the book', () => {
			const s = new Contacts();
			s.contacts = [contact(), contact({ uri: 'c2', address_book_id: 2 })];
			expect(s.getAddressBookCount(1)).toBe(1);
			expect(s.getAddressBookCount(2)).toBe(1);
			expect(s.getAddressBookCount(3)).toBe(0);
		});
	});

	describe('contact photos', () => {
		it('getContactPhoto returns the cached photo or null', () => {
			const s = new Contacts();
			s.contactPhotos = { 'contact-1': 'data:image/png;base64,x' };
			expect(s.getContactPhoto('contact-1')).toBe('data:image/png;base64,x');
			expect(s.getContactPhoto('missing')).toBeNull();
		});

		it('loadContactPhotos batches the missing photos and merges the results', async () => {
			const s = new Contacts();
			s.contacts = [contact(), contact({ uri: 'c2' })];
			api.post.mockResolvedValue({ data: { 'contact-1': 'data:a', c2: 'data:b' } });

			await s.loadContactPhotos();

			expect(api.post).toHaveBeenCalledWith(
				expect.stringContaining('/photos'),
				expect.objectContaining({ contacts: expect.any(Array) })
			);
			expect(s.contactPhotos['contact-1']).toBe('data:a');
			expect(s.contactPhotos['c2']).toBe('data:b');
			expect(s.contactPhotosLoaded).toBe(true);
		});

		it('loadContactPhotos does not request a contact again that had no photo', async () => {
			const s = new Contacts();
			s.contacts = [contact(), contact({ uri: 'c2' })];
			api.post.mockResolvedValue({ data: { 'contact-1': 'data:a' } });

			await s.loadContactPhotos();
			await s.loadContactPhotos();

			expect(api.post).toHaveBeenCalledTimes(1);
			expect(s.getContactPhoto('c2')).toBeNull();
		});

		it('loadContactPhotos skips contacts the list marks as having no photo', async () => {
			const s = new Contacts();
			s.contacts = [
				contact({ uri: 'with', has_photo: true }),
				contact({ uri: 'without', has_photo: false }),
				contact({ uri: 'unknown' })
			];
			api.post.mockResolvedValue({ data: { with: 'data:a' } });

			await s.loadContactPhotos();

			expect(api.post).toHaveBeenCalledTimes(1);
			const uris = (api.post.mock.calls[0][1] as { contacts: { uri: string }[] }).contacts.map(
				(c) => c.uri
			);
			expect(uris).toEqual(['with', 'unknown']);
			expect(s.contactPhotosLoaded).toBe(true);
		});

		it('loadContactPhotos sends no request when no contact has a photo', async () => {
			const s = new Contacts();
			s.contacts = [contact({ has_photo: false }), contact({ uri: 'c2', has_photo: false })];

			await s.loadContactPhotos();

			expect(api.post).not.toHaveBeenCalled();
			expect(s.contactPhotosLoaded).toBe(true);
		});

		it('loadContactPhotos requests a contact whose has_photo turned true', async () => {
			const s = new Contacts();
			s.contacts = [contact({ has_photo: false })];
			await s.loadContactPhotos();

			s.contacts = [contact({ has_photo: true })];
			api.post.mockResolvedValue({ data: { 'contact-1': 'data:a' } });
			await s.loadContactPhotos();

			expect(api.post).toHaveBeenCalledTimes(1);
			expect(s.getContactPhoto('contact-1')).toBe('data:a');
		});

		it('loadContactPhotos requests a failed batch again next time', async () => {
			const s = new Contacts();
			s.contacts = [contact()];
			api.post
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce({ data: { 'contact-1': 'data:a' } });

			await s.loadContactPhotos();
			await s.loadContactPhotos();

			expect(api.post).toHaveBeenCalledTimes(2);
			expect(s.contactPhotos['contact-1']).toBe('data:a');
		});

		it('loadContactPhotos sends 25 contacts in batches of 10, 10 and 5', async () => {
			const s = new Contacts();
			s.contacts = Array.from({ length: 25 }, (_, i) => contact({ uri: `c${i}` }));
			api.post.mockResolvedValue({ data: {} });

			await s.loadContactPhotos();

			const sizes = api.post.mock.calls.map(
				(call) => (call[1] as { contacts: unknown[] }).contacts.length
			);
			expect(sizes).toEqual([10, 10, 5]);
		});

		it('concurrent loadContactPhotos calls request each contact once', async () => {
			const s = new Contacts();
			s.contacts = [contact(), contact({ uri: 'c2' })];
			let resolveFirst!: (value: unknown) => void;
			api.post
				.mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)))
				.mockResolvedValue({ data: {} });

			const first = s.loadContactPhotos();
			const second = s.loadContactPhotos();
			resolveFirst({ data: {} });
			await Promise.all([first, second]);

			expect(api.post).toHaveBeenCalledTimes(1);
			expect(s.contactPhotosLoaded).toBe(true);
		});

		it('update requests the photo of the updated contact again', async () => {
			const c2 = contact({ uri: 'c2' });
			const s = new Contacts();
			s.contacts = [contact(), c2];
			api.post.mockResolvedValue({ data: {} });
			await s.loadContactPhotos();
			api.post.mockClear();

			api.update.mockResolvedValue(true);
			api.list
				.mockResolvedValueOnce({ data: [addressBook()] })
				.mockResolvedValueOnce({ data: [contact(), c2] });
			await s.update(c2, {} as CreateContactRequest);

			expect(api.post).toHaveBeenCalledTimes(1);
			const payload = api.post.mock.calls[0][1] as { contacts: { uri: string }[] };
			expect(payload.contacts.map((c) => c.uri)).toEqual(['c2']);
		});
	});

	describe('load', () => {
		it('loads hidden state, books, contacts and photos', async () => {
			storage.getJson.mockReturnValue([]);
			api.list
				.mockResolvedValueOnce({ data: [addressBook()] })
				.mockResolvedValueOnce({ data: [contact()] });
			api.post.mockResolvedValue({ data: {} });

			const s = new Contacts();
			await s.load();

			expect(s.loaded).toBe(true);
			expect(s.addressBooks).toHaveLength(1);
			expect(s.contacts).toHaveLength(1);
			await vi.waitFor(() => expect(s.contactPhotosLoaded).toBe(true));
		});
	});

	describe('contact selection', () => {
		it('selectContact opens the detail modal', () => {
			const s = new Contacts();
			const c = contact();
			s.selectContact(c);
			expect(s.activeContact).toBe(c);
			expect(s.detailModalVisible).toBe(true);
			expect(s.searchVisible).toBe(false);
		});

		it('closeDetailModal clears the active contact', () => {
			const s = new Contacts();
			s.selectContact(contact());
			s.closeDetailModal();
			expect(s.detailModalVisible).toBe(false);
			expect(s.activeContact).toBeNull();
		});
	});
});
