import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { ContactImport } from '$lib/state/ContactImport.svelte';
import type { Contacts } from '$lib/state/Contacts.svelte';
import type { UiNotifications } from '$lib/state/UiNotifications.svelte';
import type { LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
import { renderWithContext } from './helpers/context';
import { rejectionsDuring } from './helpers/rejections';
import ContactImportModalHarness from './helpers/ContactImportModalHarness.svelte';
import { addressBook, contactImportState } from '../unit/helpers/factories';

const vcf = new File(['BEGIN:VCARD'], 'Friends.vcf', { type: 'text/vcard' });

async function openFileForm(user: ReturnType<typeof userEvent.setup>, props: Record<string, unknown> = {}): Promise<void> {
	renderWithContext(ContactImportModalHarness, props);
	await user.click(screen.getByRole('button', { name: '.vcf file' }));
}

describe('Contacts ImportModal', () => {
	it('starts with the CardDAV form', () => {
		renderWithContext(ContactImportModalHarness);

		expect(screen.getByLabelText('URL')).toBeInTheDocument();
		expect(screen.queryByLabelText('Select File')).not.toBeInTheDocument();
	});

	it('starts a CardDAV import with the trimmed account data', async () => {
		const user = userEvent.setup();
		const start = vi.spyOn(ContactImport.prototype, 'startCarddavImport').mockResolvedValue(null);
		renderWithContext(ContactImportModalHarness);

		await user.type(screen.getByLabelText('URL'), ' https://dav.test ');
		await user.type(screen.getByLabelText('Username'), 'me');
		await user.type(screen.getByLabelText('Secret'), 'x');
		await user.click(screen.getByRole('button', { name: 'Import' }));

		expect(start).toHaveBeenCalledWith({ url: 'https://dav.test', username: 'me', secret: 'x' });
	});

	it('stops the loading indicator even when starting the import throws', async () => {
		const user = userEvent.setup();
		vi.spyOn(ContactImport.prototype, 'startCarddavImport').mockRejectedValue(new Error('offline'));
		let loadingIndicator: LoadingIndicator | null = null;
		renderWithContext(ContactImportModalHarness, {}, { onReady: (stores) => (loadingIndicator = stores.loadingIndicator as LoadingIndicator) });

		await user.type(screen.getByLabelText('URL'), 'https://dav.test');
		await user.type(screen.getByLabelText('Username'), 'me');
		await user.type(screen.getByLabelText('Secret'), 'x');
		const rejections = await rejectionsDuring(() => user.click(screen.getByRole('button', { name: 'Import' })));

		expect(rejections).toEqual([new Error('offline')]);
		expect(loadingIndicator!.active).toBe(false);
	});

	it('sends the address books picked from the account', async () => {
		const user = userEvent.setup();
		const select = vi.spyOn(ContactImport.prototype, 'selectCarddavAddressBooks').mockResolvedValue(null);
		renderWithContext(ContactImportModalHarness, { state: contactImportState({ stage: 'select', source: 'carddav', address_books: ['Work', 'Family'] }) });

		await user.click(screen.getByLabelText('Family'));
		await user.click(screen.getByRole('button', { name: 'Import' }));

		expect(select).toHaveBeenCalledWith(['Family']);
	});

	it('imports a file into a new address book named after the file', async () => {
		const user = userEvent.setup();
		const importFile = vi.spyOn(ContactImport.prototype, 'importFile').mockResolvedValue(null);
		await openFileForm(user);

		await user.upload(screen.getByLabelText('Select File'), vcf);
		expect(screen.getByLabelText('Name')).toHaveValue('Friends');

		await user.click(screen.getByRole('button', { name: 'Import' }));

		expect(importFile).toHaveBeenCalledWith(vcf, { type: 'new', name: 'Friends', color: '#0088CC' });
	});

	it('keeps a name the user typed before picking the file', async () => {
		const user = userEvent.setup();
		await openFileForm(user);

		await user.type(screen.getByLabelText('Name'), 'Club');
		await user.upload(screen.getByLabelText('Select File'), vcf);

		expect(screen.getByLabelText('Name')).toHaveValue('Club');
	});

	it('keeps a name the user typed when another file is picked', async () => {
		const user = userEvent.setup();
		await openFileForm(user);

		await user.upload(screen.getByLabelText('Select File'), vcf);
		await user.clear(screen.getByLabelText('Name'));
		await user.type(screen.getByLabelText('Name'), 'Club');
		await user.upload(screen.getByLabelText('Select File'), new File([''], 'other.vcf'));

		expect(screen.getByLabelText('Name')).toHaveValue('Club');
	});

	it('imports into an existing address book', async () => {
		const user = userEvent.setup();
		const importFile = vi.spyOn(ContactImport.prototype, 'importFile').mockResolvedValue(null);
		await openFileForm(user, { addressBooks: [addressBook({ id: 1, name: 'Personal' }), addressBook({ id: 4, name: 'Family' })] });

		const picker = screen.getByRole('combobox', { name: 'Import into' });
		expect([...picker.querySelectorAll('option')].map((option) => option.textContent)).toEqual(['New address book', 'Personal', 'Family']);

		await user.selectOptions(picker, '4');
		await user.upload(screen.getByLabelText('Select File'), vcf);
		await user.click(screen.getByRole('button', { name: 'Import' }));

		expect(importFile).toHaveBeenCalledWith(vcf, { type: 'existing', addressBookId: 4 });
	});

	it('offers address books that arrive after the form', async () => {
		const user = userEvent.setup();
		const importFile = vi.spyOn(ContactImport.prototype, 'importFile').mockResolvedValue(null);
		let contactsStore: Contacts | null = null;
		await openFileForm(user, { onContacts: (store: Contacts) => (contactsStore = store) });

		contactsStore!.addressBooks = [addressBook({ id: 5, name: 'Family' })];
		await user.selectOptions(await screen.findByRole('combobox', { name: 'Import into' }), '5');
		await user.upload(screen.getByLabelText('Select File'), vcf);
		await user.click(screen.getByRole('button', { name: 'Import' }));

		expect(importFile).toHaveBeenCalledWith(vcf, { type: 'existing', addressBookId: 5 });
	});

	it('hides the target choice without address books', async () => {
		const user = userEvent.setup();
		await openFileForm(user);

		expect(screen.queryByRole('combobox', { name: 'Import into' })).not.toBeInTheDocument();
	});

	it('shows the message for a rejected file', async () => {
		const user = userEvent.setup();
		vi.spyOn(ContactImport.prototype, 'importFile').mockResolvedValue('invalid_file');
		let notifications: UiNotifications | null = null;
		renderWithContext(ContactImportModalHarness, {}, { onReady: (stores) => (notifications = stores.uiNotifications as UiNotifications) });
		const error = vi.spyOn(notifications!, 'error');

		await user.click(screen.getByRole('button', { name: '.vcf file' }));
		await user.upload(screen.getByLabelText('Select File'), vcf);
		await user.click(screen.getByRole('button', { name: 'Import' }));

		expect(error).toHaveBeenCalledWith(expect.stringContaining('.vcf file of at most 25 MB'));
	});

	it('shows the progress of a running import', () => {
		renderWithContext(ContactImportModalHarness, {
			state: contactImportState({ stage: 'contacts', address_books_current: 'Friends', contacts_count: 4, contacts_done: 1 })
		});

		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
	});

	it('shows imported and skipped counts when finished', () => {
		renderWithContext(ContactImportModalHarness, { state: contactImportState({ stage: 'finished', contacts_done: 9, contacts_skipped: 2 }) });

		expect(screen.getByText('Imported').nextElementSibling).toHaveTextContent('9');
		expect(screen.getByText('Skipped').nextElementSibling).toHaveTextContent('2');
	});

	it('hides the skipped count when nothing was skipped', () => {
		renderWithContext(ContactImportModalHarness, { state: contactImportState({ stage: 'finished', contacts_done: 9 }) });

		expect(screen.queryByText('Skipped')).not.toBeInTheDocument();
	});

	it('shows a failure and closes', async () => {
		const user = userEvent.setup();
		let store: ContactImport | null = null;
		renderWithContext(ContactImportModalHarness, { state: contactImportState({ stage: 'failed' }), onStore: (s: ContactImport) => (store = s) });

		expect(screen.getByRole('alert')).toHaveTextContent("The contacts couldn't be imported.");

		await user.click(screen.getByRole('button', { name: 'Close' }));

		expect(store!.importModal).toBe(false);
		expect(store!.state).toBeNull();
	});
});
