import type { Contact, CreateContactForm, CreateContactRequest } from '$lib/types/contact';

export default class ContactFormService {
	emptyForm(addressBookId: number): CreateContactForm {
		return {
			address_book_id: addressBookId,
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
	}

	fromContact(contact: Contact): CreateContactForm {
		return {
			address_book_id: contact.address_book_id,
			first_name: contact.first_name,
			last_name: contact.last_name,
			middle_name: contact.middle_name,
			prefix: contact.prefix,
			suffix: contact.suffix,
			email: contact.email ? [...contact.email] : [],
			phone: contact.phone ? [...contact.phone] : [],
			groups: contact.groups?.join(', ') || '',
			organization: contact.organization,
			title: contact.title,
			note: contact.note,
			street: contact.street,
			city: contact.city,
			state: contact.state,
			postal_code: contact.postal_code,
			country: contact.country
		};
	}

	hasName(form: CreateContactForm): boolean {
		return form.first_name.trim() !== '' && form.last_name.trim() !== '';
	}

	toRequest(form: CreateContactForm): CreateContactRequest {
		return {
			...form,
			full_name: this.fullName(form),
			email: form.email.length > 0 ? JSON.stringify(form.email) : null,
			phone: form.phone.length > 0 ? JSON.stringify(form.phone) : null,
			groups: form.groups.length > 0 ? JSON.stringify(form.groups.split(',').map((g) => g.trim())) : null
		};
	}

	private fullName(form: CreateContactForm): string {
		return [form.first_name, form.middle_name, form.last_name].filter((part) => part).join(' ');
	}
}
