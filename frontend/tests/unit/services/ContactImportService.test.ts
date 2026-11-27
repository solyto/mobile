import { describe, it, expect } from 'vitest';
import ContactImportService from '$lib/services/ContactImportService';
import { contactImportState } from '../helpers/factories';

const service = new ContactImportService();

describe('defaultAddressBookName', () => {
	it('strips the .vcf and .vcard extensions in any case', () => {
		expect(service.defaultAddressBookName('Friends.vcf')).toBe('Friends');
		expect(service.defaultAddressBookName('contacts.VCF')).toBe('contacts');
		expect(service.defaultAddressBookName('Work.vcard')).toBe('Work');
	});

	it('keeps names without the extension and inner dots', () => {
		expect(service.defaultAddressBookName('export.2026.contacts')).toBe('export.2026.contacts');
		expect(service.defaultAddressBookName('my.vcf.backup.vcf')).toBe('my.vcf.backup');
	});
});

describe('fileRequest', () => {
	const file = new File(['BEGIN:VCARD'], 'friends.vcf', { type: 'text/vcard' });

	it('sends the file, a trimmed name and the colour for a new address book', () => {
		const body = service.fileRequest(file, { type: 'new', name: '  Friends ', color: '#1dbda5' });

		expect(body.get('file')).toBeInstanceOf(File);
		expect(body.get('name')).toBe('Friends');
		expect(body.get('color')).toBe('#1dbda5');
		expect(body.has('address_book_id')).toBe(false);
	});

	it('sends an empty name so the API picks one', () => {
		expect(service.fileRequest(file, { type: 'new', name: '', color: '#0088CC' }).get('name')).toBe('');
	});

	it('sends the address book id for an existing address book', () => {
		const body = service.fileRequest(file, { type: 'existing', addressBookId: 7 });

		expect(body.get('address_book_id')).toBe('7');
		expect(body.has('name')).toBe(false);
		expect(body.has('color')).toBe(false);
	});
});

describe('errorFor', () => {
	it.each([
		[422, 'invalid_file'],
		[413, 'invalid_file'],
		[404, 'address_book_not_found'],
		[409, 'already_running'],
		[429, 'rate_limited'],
		[403, 'generic'],
		[500, 'generic']
	])('maps %d of a file import to %s', (status, error) => {
		expect(service.errorFor(status, 'file')).toBe(error);
	});

	it.each([
		[409, 'already_running'],
		[429, 'rate_limited'],
		[422, 'generic'],
		[404, 'generic']
	])('maps %d of a CardDAV import to %s', (status, error) => {
		expect(service.errorFor(status, 'carddav')).toBe(error);
	});
});

describe('view', () => {
	it('starts fresh without a state', () => {
		expect(service.view(null)).toBe('start');
	});

	it.each([
		['select', 'select'],
		['started', 'progress'],
		['address-books', 'progress'],
		['contacts', 'progress'],
		['finished', 'finished'],
		['failed', 'failed']
	] as const)('shows %s as %s', (stage, view) => {
		expect(service.view(contactImportState({ stage }))).toBe(view);
	});

	it('treats a started CardDAV import as restartable, not running', () => {
		expect(service.view(contactImportState({ stage: 'started', source: 'carddav' }))).toBe('start');
		expect(service.isRunning(contactImportState({ stage: 'started', source: 'carddav' }))).toBe(false);
	});

	it('shows a CardDAV step that was just accepted as running until the first state arrives', () => {
		expect(service.view(contactImportState({ stage: 'started', source: 'carddav' }), true)).toBe('progress');
		expect(service.isRunning(contactImportState({ stage: 'started', source: 'carddav' }), true)).toBe(true);
	});
});

describe('isRunning and isStale', () => {
	it('is running only while address books or contacts are being imported', () => {
		expect(service.isRunning(contactImportState({ stage: 'contacts' }))).toBe(true);
		expect(service.isRunning(contactImportState({ stage: 'select' }))).toBe(false);
		expect(service.isRunning(null)).toBe(false);
	});

	it('treats finished and failed states as stale', () => {
		expect(service.isStale(contactImportState({ stage: 'finished' }))).toBe(true);
		expect(service.isStale(contactImportState({ stage: 'failed' }))).toBe(true);
		expect(service.isStale(contactImportState({ stage: 'contacts' }))).toBe(false);
		expect(service.isStale(null)).toBe(false);
	});
});

describe('progress', () => {
	it('is zero before the contacts are counted', () => {
		expect(service.progress(contactImportState({ contacts_count: 0 }))).toBe(0);
	});

	it('counts imported and skipped contacts as handled', () => {
		expect(service.progress(contactImportState({ contacts_count: 8, contacts_done: 2, contacts_skipped: 2 }))).toBe(0.5);
	});
});

describe('progressMarker', () => {
	it('changes when the import moves on', () => {
		const before = service.progressMarker(contactImportState({ contacts_done: 1 }));
		const after = service.progressMarker(contactImportState({ contacts_done: 2 }));

		expect(before).not.toBe(after);
	});

	it('changes when only skipped contacts grow', () => {
		const before = service.progressMarker(contactImportState({ contacts_skipped: 1 }));
		const after = service.progressMarker(contactImportState({ contacts_skipped: 2 }));

		expect(before).not.toBe(after);
	});

	it('is empty without a state', () => {
		expect(service.progressMarker(null)).toBe('');
	});
});
