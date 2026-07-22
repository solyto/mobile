import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import { browser } from '$app/environment';
import type {
	AddressBook,
	Contact,
	CreateAddressBookRequest,
	CreateContactRequest,
	UpdateAddressBookRequest,
	ImportRequest,
	ImportState,
	SelectImportAddressBooksRequest
} from '$lib/types/contact';
import LocalStorageService from '$lib/services/LocalStorageService';

const letters = [
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'P',
	'Q',
	'R',
	'S',
	'T',
	'U',
	'V',
	'W',
	'X',
	'Y',
	'Z'
];

export class Contacts {
	static readonly LS_HIDDEN_KEY = 'address_books_hidden';

	addressBooks = $state<AddressBook[]>([]);
	contacts = $state<Contact[]>([]);
	activeAddressBook = $state<AddressBook | null>(null);
	activeContact = $state<Contact | null>(null);
	searchEntries = $state<Contact[]>([]);
	contactsAZ = $derived<Record<string, Contact[]>>(
		letters.reduce(
			(az, letter) => {
				const source = this.searchEntries.length > 0 ? this.searchEntries : this.contacts;
				az[letter] = source
					.filter((c) => {
						if (c.first_name[0]?.toLowerCase() !== letter.toLowerCase()) return false;
						if (this.isAddressBookHidden(c.address_book_id)) return false;
						if (
							this.activeAddressBook &&
							this.activeAddressBook.id !== c.address_book_id
						)
							return false;
						return true;
					})
					.sort((a, b) => a.first_name.localeCompare(b.first_name));
				return az;
			},
			{} as Record<string, Contact[]>
		)
	);
	contactTotal = $derived<number>(
		this.contacts.filter((c) => !this.isAddressBookHidden(c.address_book_id)).length
	);
	contactPhotos = $state<Record<string, string>>({});
	auth = getAuth();
	loaded = $state<boolean>(false);
	contactPhotosLoaded = $state<boolean>(false);
	detailModalVisible = $state<boolean>(false);
	createModalVisible = $state<boolean>(false);
	searchVisible = $state<boolean>(false);
	deleteModal = $state<boolean>(false);
	createModal = $state<boolean>(false);
	importModal = $state<boolean>(false);
	syncModal = $state<boolean>(false);
	hiddenAddressBooks = $state<number[]>([]);
	addressBookColorMap = $derived<Record<number, string>>(
		this.addressBooks.reduce(
			(map, ab) => {
				map[ab.id] = ab.color ?? 'var(--color-c-neutral-2)';
				return map;
			},
			{} as Record<number, string>
		)
	);
	apiService: ApiService;
	localStorage = new LocalStorageService();

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	async load(): Promise<void> {
		this.loadHidden();
		await this.loadAddressBooks();
		await this.loadContacts();
		this.loaded = true;

		this.loadContactPhotos();
	}

	async loadContactPhotos(): Promise<void> {
		const contactsToFetch = this.contacts.filter((c) => !this.contactPhotos[c.uri]);
		const batchSize = 10;

		for (let i = 0; i < contactsToFetch.length; i += batchSize) {
			const batch = contactsToFetch.slice(i, i + batchSize);
			const payload = batch.map((c) => ({
				address_book_id: c.address_book_id,
				uri: c.uri
			}));

			const res = await this.apiService.post(apiRoutes.contacts.getContactPhotos, {
				contacts: payload
			});
			if (res?.data) {
				this.contactPhotos = { ...this.contactPhotos, ...res.data };
			}
		}

		this.contactPhotosLoaded = true;
	}

	getContactPhoto(uri: string): string | null {
		return this.contactPhotos[uri] ?? null;
	}

	async loadAddressBooks(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.contacts.listAddressBooks);
		if (res) this.addressBooks = res.data as AddressBook[];
	}

	async loadContacts(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.contacts.listContacts);
		if (res) this.contacts = res.data as Contact[];
	}

	selectContact(contact: Contact): void {
		this.activeContact = contact;
		this.openDetailModal(contact);
	}

	selectAddressBook(addressBook: AddressBook | null): void {
		this.activeAddressBook = addressBook;
	}

	openDetailModal(contact: Contact) {
		this.activeContact = contact;
		this.detailModalVisible = true;
		this.searchVisible = false;
	}

	closeDetailModal(): void {
		this.detailModalVisible = false;
		this.activeContact = null;
	}

	openCreateModal(contact?: Contact): void {
		if (contact) this.activeContact = contact;

		this.createModalVisible = true;
		this.searchVisible = false;
	}

	closeCreateModal(): void {
		this.activeContact = null;
		this.createModalVisible = false;
	}

	search(searchTerm: string): void {
		if (searchTerm.length === 0) return;

		this.searchEntries = this.contacts.filter((contact) => {
			return ['first_name', 'last_name'].some((field) => {
				return String((contact as any)[field]).toLowerCase().includes(searchTerm.toLowerCase());
			});
		});
	}

	clearSearch(): void {
		this.searchEntries = [];
	}

	toggleAddressBook(id: number): void {
		const index = this.hiddenAddressBooks.indexOf(id);

		if (index === -1) {
			this.hiddenAddressBooks.push(id);
		} else {
			this.hiddenAddressBooks.splice(index, 1);
		}

		this.saveHidden();
	}

	isAddressBookHidden(id: number): boolean {
		return this.hiddenAddressBooks.indexOf(id) !== -1;
	}

	loadHidden(): void {
		const stored = this.localStorage.getJson(Contacts.LS_HIDDEN_KEY);
		this.hiddenAddressBooks = (stored as number[] | null) ?? [];
	}

	saveHidden(): void {
		this.localStorage.setJson(Contacts.LS_HIDDEN_KEY, this.hiddenAddressBooks);
	}

	getAddressBookColor(addressBookId: number): string {
		return this.addressBookColorMap[addressBookId] ?? 'var(--color-c-neutral-2)';
	}

	getAddressBookCount(addressBookId: number): number {
		return this.contacts.filter((ab) => ab.address_book_id === addressBookId).length;
	}

	async create(request: CreateContactRequest): Promise<boolean> {
		const res = await this.apiService.create(
			apiRoutes.contacts.createContact.replace('%d', request.address_book_id.toString()),
			request
		);
		if (res) await this.load();
		return res !== null;
	}

	async update(contact: Contact, request: CreateContactRequest): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.contacts.updateContact.replace('%d', contact.address_book_id.toString()),
			contact.uri,
			request
		);
		if (res) await this.load();
		return res;
	}

	async updateContactPhoto(contact: Contact, file: File): Promise<boolean> {
		if (!file.type.startsWith('image/')) {
			return Promise.resolve(false);
		}

		const formData = new FormData();
		formData.append('photo', file);

		const res = await this.apiService.postFormData(
			apiRoutes.contacts.updateContactPhoto
				.replace('%d', contact.address_book_id.toString())
				.replace('%s', contact.uri),
			formData
		);
		if (res) {
			const reader = new FileReader();
			reader.onload = () => {
				this.contactPhotos = {
					...this.contactPhotos,
					[contact.uri]: reader.result as string
				};
			};
			reader.readAsDataURL(file);
		}
		return Promise.resolve(res);
	}

	async removeContactPhoto(contact: Contact): Promise<boolean> {
		const res = await this.apiService.delete(
			apiRoutes.contacts.removeContactPhoto.replace('%d', contact.address_book_id.toString()),
			contact.uri
		);
		if (res) {
			const { [contact.uri]: _, ...rest } = this.contactPhotos;
			this.contactPhotos = rest;
		}
		return Promise.resolve(res);
	}

	async delete(contact: Contact): Promise<boolean> {
		const res = await this.apiService.delete(
			apiRoutes.contacts.deleteContact.replace('%d', contact.address_book_id.toString()),
			contact.uri
		);
		if (res) await this.load();
		return res;
	}

	async createAddressBook(request: CreateAddressBookRequest): Promise<boolean> {
		const res = await this.apiService.post(apiRoutes.contacts.createAddressBook, request);
		if (res) await this.loadAddressBooks();
		return res !== null;
	}

	async updateAddressBook(
		addressBook: AddressBook,
		request: UpdateAddressBookRequest
	): Promise<boolean> {
		const res = await this.apiService.update(
			apiRoutes.contacts.updateAddressBook,
			addressBook.id,
			request
		);
		if (res) {
			await this.loadAddressBooks();
			await this.loadContacts();
		}
		return res !== null;
	}

	async deleteAddressBook(addressBook: AddressBook): Promise<boolean> {
		const res = await this.apiService.delete(
			apiRoutes.contacts.deleteAddressBook,
			addressBook.id
		);
		if (res) {
			await this.loadAddressBooks();
			await this.loadContacts();
		}
		this.activeAddressBook = null;
		this.deleteModal = false;
		return res !== null;
	}

	async startImport(request: ImportRequest): Promise<boolean> {
		return (await this.apiService.post(apiRoutes.contacts.startImport, request)) !== null;
	}

	async selectImportAddressBooks(request: SelectImportAddressBooksRequest) {
		return (
			(await this.apiService.post(apiRoutes.contacts.selectImportAddressBooks, request)) !==
			null
		);
	}

	async getImportState(): Promise<ImportState | null> {
		const res = await this.apiService.get(apiRoutes.contacts.getImportState, '');
		if (res) return res.data as ImportState;
		return null;
	}
}

const CONTACTS_KEY = Symbol('SOLYTO_CONTACTS');

export function setContacts(): Contacts {
	return setContext(CONTACTS_KEY, new Contacts());
}

export function getContacts(): Contacts {
	return getContext<Contacts>(CONTACTS_KEY);
}
