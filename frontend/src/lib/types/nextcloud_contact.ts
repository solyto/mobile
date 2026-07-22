export interface AddressBook {
	id: number;
	name: string;
	url: string;
	color: string | null;
	created_at: string;
	updated_at: string;
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
	id: string;
	uid: string;
	address_book: AddressBook;
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
	photo: string;
	title: string;
	note: string;
	street: string;
	city: string;
	state: string;
	postal_code: string;
	country: string;
	url: string;
	etag: string;
	created_at: string;
	updated_at: string;
}

export interface CreateContactForm {
	address_book_id: number;
	first_name: string | null;
	last_name: string | null;
	middle_name: string | null;
	prefix: string | null;
	suffix: string | null;
	email: ContactEmail[] | null;
	phone: ContactPhone[] | null;
	groups: string | null;
	organization: string | null;
	photo: string | null;
	title: string | null;
	note: string | null;
	street: string | null;
	city: string | null;
	state: string | null;
	postal_code: string | null;
	country: string | null;
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
	photo: string | null;
	title: string | null;
	note: string | null;
	street: string | null;
	city: string | null;
	state: string | null;
	postal_code: string | null;
	country: string | null;
}

export interface UpdateAddressBookRequest {
	color: string;
}
