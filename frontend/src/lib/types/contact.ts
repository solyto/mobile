export interface AddressBook {
	id: number;
	name: string;
	uri: string;
	color: string | null;
	description: string;
}

export interface ContactPhone {
	value: string;
	type: string;
}

export interface ContactEmail {
	value: string;
	type: string;
}

export interface Contact {
	uid: string;
	uri: string;
	full_name: string;
	first_name: string;
	last_name: string;
	middle_name: string;
	prefix: string;
	suffix: string;
	email: ContactEmail[] | null;
	phone: ContactPhone[] | null;
	groups: string[] | null;
	organization: string;
	title: string;
	note: string;
	street: string;
	city: string;
	state: string;
	postal_code: string;
	country: string;
	etag: string;
	address_book_id: number;
	address_book_color: string;
}

export interface CreateContactForm {
	address_book_id: number;
	first_name: string;
	last_name: string;
	middle_name: string;
	prefix: string;
	suffix: string;
	email: ContactEmail[];
	phone: ContactPhone[];
	groups: string;
	organization: string;
	title: string;
	note: string;
	street: string;
	city: string;
	state: string;
	postal_code: string;
	country: string;
}

export interface CreateContactRequest {
	address_book_id: number;
	full_name: string | null;
	first_name: string | null;
	last_name: string | null;
	middle_name: string | null;
	prefix: string | null;
	suffix: string | null;
	email: string | null;
	phone: string | null;
	groups: string | null;
	organization: string | null;
	title: string | null;
	note: string | null;
	street: string | null;
	city: string | null;
	state: string | null;
	postal_code: string | null;
	country: string | null;
}

export interface CreateAddressBookRequest {
	name: string;
}

export interface UpdateAddressBookRequest {
	color: string;
}

export interface ImportForm {
	url: string;
	username: string;
	secret: string;
}

export interface ImportRequest {
	url: string;
	username: string;
	secret: string;
}

export interface SelectImportAddressBooksRequest {
	address_books: string[];
}

export interface ImportState {
	stage: 'started' | 'select' | 'address-books' | 'contacts' | 'finished';
	address_books: string[];
	address_books_count: number;
	address_books_done: number;
	address_books_current: string | null;
	contacts_count: number;
	contacts_done: number;
}
