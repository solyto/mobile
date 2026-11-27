import { describe, it, expect } from 'vitest';
import ContactFormService from '$lib/services/ContactFormService';
import { contact } from '../helpers/factories';

const service = new ContactFormService();

describe('ContactFormService', () => {
	it('starts an empty form in the given address book', () => {
		expect(service.emptyForm(7)).toMatchObject({ address_book_id: 7, first_name: '', email: [], phone: [], groups: '' });
	});

	it('copies a contact into a form without sharing its lists', () => {
		const phone = [{ value: '123', type: 'cell' }];
		const form = service.fromContact(contact({ phone, groups: ['Family', 'Math'], email: null }));

		expect(form.phone).toEqual(phone);
		expect(form.phone).not.toBe(phone);
		expect(form.email).toEqual([]);
		expect(form.groups).toBe('Family, Math');
	});

	it('needs both a first and a last name', () => {
		expect(service.hasName({ ...service.emptyForm(1), first_name: 'Ada', last_name: ' ' })).toBe(false);
		expect(service.hasName({ ...service.emptyForm(1), first_name: 'Ada', last_name: 'Lovelace' })).toBe(true);
	});

	it('joins the name parts that are set into the full name', () => {
		const form = { ...service.emptyForm(1), first_name: 'Ada', last_name: 'Lovelace' };

		expect(service.toRequest(form).full_name).toBe('Ada Lovelace');
		expect(service.toRequest({ ...form, middle_name: 'King' }).full_name).toBe('Ada King Lovelace');
		expect(service.toRequest({ ...form, last_name: '' }).full_name).toBe('Ada');
	});

	it('sends lists as JSON and empty lists as null', () => {
		const empty = service.toRequest(service.emptyForm(1));
		expect([empty.email, empty.phone, empty.groups]).toEqual([null, null, null]);

		const filled = service.toRequest({
			...service.emptyForm(1),
			email: [{ value: 'a@example.org', type: 'home' }],
			groups: 'Family, Math '
		});
		expect(filled.email).toBe('[{"value":"a@example.org","type":"home"}]');
		expect(filled.groups).toBe('["Family","Math"]');
	});
});
