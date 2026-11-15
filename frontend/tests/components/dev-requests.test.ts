import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Comments from '$lib/components/dev-requests/Comments.svelte';
import DevRequestEntry from '$lib/components/dev-requests/DevRequestEntry.svelte';
import DevRequestEdit from '$lib/components/dev-requests/DevRequestEdit.svelte';
import FixedIn from '$lib/components/dev-requests/FixedIn.svelte';
import Priority from '$lib/components/dev-requests/Priority.svelte';
import Status from '$lib/components/dev-requests/Status.svelte';
import Type from '$lib/components/dev-requests/Type.svelte';
import { renderWithContext } from './helpers/context';
import { devRequest } from '../unit/helpers/factories';
import type { DevRequest } from '$lib/types/dev_request';
import type { KeyManager } from '$lib/state/KeyManager.svelte';

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

	it('shows waiting-for-deployment with its label', () => {
		renderWithContext(Status, { entry: devRequest({ status: 'waiting-for-deployment' }) });
		expect(screen.getByText('Waiting for Deployment')).toBeInTheDocument();
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

		expect(screen.queryByPlaceholderText('Fixed in version')).toBeNull();
		await user.selectOptions(screen.getByDisplayValue('Pending'), 'completed');
		expect(screen.getByPlaceholderText('Fixed in version')).toBeInTheDocument();
	});

	it('saves only the changed fields, including the version', async () => {
		const user = userEvent.setup();
		const entry = devRequest();
		const { devRequests, onClose } = renderEdit(entry);

		const title = screen.getByDisplayValue('Login fails');
		await user.clear(title);
		await user.type(title, 'Login broken');
		await user.selectOptions(screen.getByDisplayValue('Pending'), 'completed');
		await user.type(screen.getByPlaceholderText('Fixed in version'), '1.2.0');
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

	it('rejects a version that is not X.X.X and keeps the modal open', async () => {
		const user = userEvent.setup();
		const { devRequests, error, onClose } = renderEdit(devRequest());

		await user.selectOptions(screen.getByDisplayValue('Pending'), 'completed');
		await user.type(screen.getByPlaceholderText('Fixed in version'), '1.2');
		await user.click(screen.getByRole('button', { name: 'Save' }));

		expect(error).toHaveBeenCalledWith('Please enter the version as X.X.X, e.g. 1.2.0');
		expect(devRequests.update).not.toHaveBeenCalled();
		expect(onClose).not.toHaveBeenCalled();
	});

	it('saves other changes when an unchanged stored version is not X.X.X', async () => {
		const user = userEvent.setup();
		const entry = devRequest({ status: 'completed', fixed_in_version: '1.2' });
		const { devRequests, error, onClose } = renderEdit(entry);

		const title = screen.getByDisplayValue('Login fails');
		await user.clear(title);
		await user.type(title, 'Login broken');
		await user.click(screen.getByRole('button', { name: 'Save' }));

		await waitFor(() => expect(onClose).toHaveBeenCalled());
		expect(error).not.toHaveBeenCalled();
		expect(devRequests.update).toHaveBeenCalledWith(entry, { title: 'Login broken' });
	});

	it('saves the waiting-for-deployment status', async () => {
		const user = userEvent.setup();
		const entry = devRequest({ status: 'in-progress' });
		const { devRequests, onClose } = renderEdit(entry);

		await user.selectOptions(screen.getByDisplayValue('In Progress'), 'waiting-for-deployment');
		expect(screen.queryByPlaceholderText('Fixed in version')).toBeNull();
		await user.click(screen.getByRole('button', { name: 'Save' }));

		await waitFor(() => expect(onClose).toHaveBeenCalled());
		expect(devRequests.update).toHaveBeenCalledWith(entry, { status: 'waiting-for-deployment' });
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

describe('Comments', () => {
	function renderComments() {
		const devRequests = { ...devRequestsStub(), createComment: vi.fn().mockResolvedValue(true) };
		let keyManager!: KeyManager;
		renderWithContext(
			Comments,
			{ entry: devRequest() },
			{ stores: { auth: { user: MEMBER }, devRequests }, onReady: (stores) => (keyManager = stores.keyManager as KeyManager) }
		);
		const textarea = screen.getByPlaceholderText('Add a comment...') as HTMLTextAreaElement;
		return { devRequests, keyManager, textarea };
	}

	// The app layout forwards window keydowns to the KeyManager; do the same here.
	function press(keyManager: KeyManager, key: string, shift = false) {
		if (shift) keyManager.handleKeyDown(new KeyboardEvent('keydown', { key: 'Shift' }));
		keyManager.handleKeyDown(new KeyboardEvent('keydown', { key, shiftKey: shift }));
		if (shift) keyManager.handleKeyUp(new KeyboardEvent('keyup', { key: 'Shift' }));
	}

	it('inserts a newline at the cursor on Shift+Enter without submitting', async () => {
		const user = userEvent.setup();
		const { devRequests, keyManager, textarea } = renderComments();

		await user.type(textarea, 'ab');
		textarea.setSelectionRange(1, 1);
		press(keyManager, 'Enter', true);

		await waitFor(() => expect(textarea.value).toBe('a\nb'));
		expect(textarea.selectionStart).toBe(2);
		expect(devRequests.createComment).not.toHaveBeenCalled();
	});

	it('submits the comment, including newlines, on Enter', async () => {
		const user = userEvent.setup();
		const { devRequests, keyManager, textarea } = renderComments();

		await user.type(textarea, 'a');
		press(keyManager, 'Enter', true);
		await waitFor(() => expect(textarea.value).toBe('a\n'));
		await user.type(textarea, 'b');
		press(keyManager, 'Enter');

		await waitFor(() => expect(devRequests.createComment).toHaveBeenCalledWith(expect.anything(), 'a\nb'));
	});

	it('leaves Shift+Enter to other handlers when the comment box is not focused', () => {
		const { keyManager } = renderComments();
		const other = vi.fn();
		keyManager.registerKeyDown('Enter', other, { priority: 0 });

		press(keyManager, 'Enter', true);

		expect(other).toHaveBeenCalled();
	});
});
