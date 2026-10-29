import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import DevRequestEntry from '$lib/components/dev-requests/DevRequestEntry.svelte';
import DevRequestEdit from '$lib/components/dev-requests/DevRequestEdit.svelte';
import FixedIn from '$lib/components/dev-requests/FixedIn.svelte';
import Priority from '$lib/components/dev-requests/Priority.svelte';
import Status from '$lib/components/dev-requests/Status.svelte';
import Type from '$lib/components/dev-requests/Type.svelte';
import VersionInput from '$lib/components/forms/VersionInput.svelte';
import { renderWithContext } from './helpers/context';
import { devRequest } from '../unit/helpers/factories';
import type { DevRequest } from '$lib/types/dev_request';

const ADMIN = { id: 'admin', name: 'Admin', role: 'admin' };
const MEMBER = { id: 'member', name: 'Member', role: 'user' };

function devRequestsStub() {
	return {
		load: vi.fn().mockResolvedValue(undefined),
		update: vi.fn().mockResolvedValue(true),
		create: vi.fn().mockResolvedValue(true),
		loadComments: vi.fn().mockResolvedValue([])
	};
}

function renderEntry(entry: DevRequest, user: object, active = false) {
	return renderWithContext(DevRequestEntry, { entry, active }, { stores: { auth: { user }, devRequests: devRequestsStub() } });
}

function renderEdit(entry?: DevRequest) {
	const devRequests = devRequestsStub();
	const error = vi.fn();
	const onClose = vi.fn();
	renderWithContext(DevRequestEdit, { entry, onClose }, { stores: { auth: { user: ADMIN }, devRequests, uiNotifications: { error } } });
	return { devRequests, error, onClose };
}

describe('VersionInput', () => {
	it('shows the label and one number box per version part', () => {
		render(VersionInput, { props: { value: { major: 1, minor: 2, patch: 3 }, label: 'Fixed in version' } });

		expect(screen.getByText('Fixed in version')).toBeInTheDocument();
		expect(screen.getAllByRole('spinbutton').map((input) => (input as HTMLInputElement).value)).toEqual(['1', '2', '3']);
	});
});

describe('display-only badges', () => {
	it('render Priority, Status and Type without buttons', () => {
		const entry = devRequest({ priority: 3, status: 'cancelled', type: 'feature' });
		for (const component of [Priority, Status, Type]) {
			const { container, unmount } = renderWithContext(component, { entry });
			expect(container.querySelector('button')).toBeNull();
			unmount();
		}
	});

	it('labels the priority dot with the priority name', () => {
		renderWithContext(Priority, { entry: devRequest({ priority: 5 }) });
		expect(screen.getByRole('img', { name: 'Critical Priority' })).toBeInTheDocument();
	});

	it('shows cancelled as Rejected', () => {
		renderWithContext(Status, { entry: devRequest({ status: 'cancelled' }) });
		expect(screen.getByText('Rejected')).toBeInTheDocument();
	});
});

describe('FixedIn on the web', () => {
	it('shows the plain version', () => {
		renderWithContext(FixedIn, { version: '1.2.0' });
		expect(screen.getByText('Fixed in 1.2.0')).toBeInTheDocument();
	});
});

describe('DevRequestEntry', () => {
	it('shows the fixed-in badge only for completed requests with a version', () => {
		const { unmount } = renderEntry(devRequest({ status: 'completed', fixed_in_version: '1.2.0' }), MEMBER);
		expect(screen.getAllByText('Fixed in 1.2.0').length).toBeGreaterThan(0);
		unmount();

		renderEntry(devRequest({ status: 'pending', fixed_in_version: '1.2.0' }), MEMBER);
		expect(screen.queryByText(/Fixed in/)).toBeNull();
	});

	it('renders title and description as plain text, not inside buttons', () => {
		renderEntry(devRequest(), ADMIN, true);

		expect(screen.getByText('Login fails').closest('button')).toBeNull();
		expect(screen.getByText('The login button does nothing').closest('button')).toBeNull();
	});

	it('renders comments as plain text', async () => {
		const stub = devRequestsStub();
		stub.loadComments.mockResolvedValue([{ id: 1, content: 'Same here', created_at: '2026-10-02T10:00:00Z', user: { id: 'x', name: 'Bob' } }]);
		renderWithContext(DevRequestEntry, { entry: devRequest(), active: true }, { stores: { auth: { user: MEMBER }, devRequests: stub } });

		const comment = await screen.findByText('Same here', {}, { timeout: 2000 });
		expect(comment.closest('button')).toBeNull();
	});

	it('does not start editing on double click', async () => {
		const user = userEvent.setup();
		renderEntry(devRequest(), ADMIN);

		await user.dblClick(screen.getByText('Login fails'));
		expect(screen.queryByRole('textbox')).toBeNull();
	});

	it('shows no edit button to non-admins', () => {
		renderEntry(devRequest(), MEMBER);
		expect(screen.queryByTitle('Edit Request')).toBeNull();
	});

	it('opens the prefilled edit modal from the admin edit button', async () => {
		const user = userEvent.setup();
		renderEntry(devRequest(), ADMIN);

		await user.click(screen.getAllByTitle('Edit Request')[0]);
		expect(await screen.findByDisplayValue('Login fails')).toBeInTheDocument();
	});
});

describe('DevRequestEdit, create', () => {
	it('keeps the create form: screenshot and URL, no status', () => {
		renderEdit();

		expect(screen.getByText('New Request')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('URL')).toBeInTheDocument();
		expect(screen.queryByDisplayValue('Backlog')).toBeNull();
	});
});

describe('DevRequestEdit, edit', () => {
	it('prefills the form and hides screenshot and URL', () => {
		renderEdit(devRequest());

		expect(screen.getByText('Edit Request')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Login fails')).toBeInTheDocument();
		expect(screen.getByDisplayValue('The login button does nothing')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Pending')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Medium Priority')).toBeInTheDocument();
		expect(screen.queryByPlaceholderText('URL')).toBeNull();
	});

	it('shows the version input only while the status is completed', async () => {
		const user = userEvent.setup();
		renderEdit(devRequest());

		expect(screen.queryAllByRole('spinbutton')).toHaveLength(0);
		await user.selectOptions(screen.getByDisplayValue('Pending'), 'completed');
		expect(screen.getAllByRole('spinbutton')).toHaveLength(3);
	});

	it('saves only the changed fields, including the version', async () => {
		const user = userEvent.setup();
		const entry = devRequest();
		const { devRequests, onClose } = renderEdit(entry);

		const title = screen.getByDisplayValue('Login fails');
		await user.clear(title);
		await user.type(title, 'Login broken');
		await user.selectOptions(screen.getByDisplayValue('Pending'), 'completed');
		const [major, minor, patch] = screen.getAllByRole('spinbutton');
		await user.type(major, '1');
		await user.type(minor, '2');
		await user.type(patch, '0');
		await user.click(screen.getByRole('button', { name: 'Save' }));

		await waitFor(() => expect(onClose).toHaveBeenCalled());
		expect(devRequests.update).toHaveBeenCalledWith(entry, { title: 'Login broken', status: 'completed', fixed_in_version: '1.2.0' });
		expect(devRequests.load).toHaveBeenCalledTimes(1);
	});

	it('clears the version when the status leaves completed', async () => {
		const user = userEvent.setup();
		const entry = devRequest({ status: 'completed', fixed_in_version: '1.2.0' });
		const { devRequests, onClose } = renderEdit(entry);

		await user.selectOptions(screen.getByDisplayValue('Completed'), 'cancelled');
		await user.click(screen.getByRole('button', { name: 'Save' }));

		await waitFor(() => expect(onClose).toHaveBeenCalled());
		expect(devRequests.update).toHaveBeenCalledWith(entry, { status: 'cancelled', fixed_in_version: null });
	});

	it('rejects an empty title like on create', async () => {
		const user = userEvent.setup();
		const { devRequests, error, onClose } = renderEdit(devRequest());

		await user.clear(screen.getByDisplayValue('Login fails'));
		await user.click(screen.getByRole('button', { name: 'Save' }));

		expect(error).toHaveBeenCalledWith('Please add a title and a description');
		expect(devRequests.update).not.toHaveBeenCalled();
		expect(onClose).not.toHaveBeenCalled();
	});
});
