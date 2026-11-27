import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import type { Todos } from '$lib/state/Todos.svelte';
import type { LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
import type { KeyManager } from '$lib/state/KeyManager.svelte';
import type { Translation } from '$lib/state/Translation.svelte';
import { renderWithContext } from './helpers/context';
import StoreHarness from './helpers/StoreHarness.svelte';
import { setTags } from '$lib/state/Tags.svelte';
import TodoNavigation from '$lib/components/todos/TodoNavigation.svelte';
import KanbanView from '$lib/components/todos/views/KanbanView.svelte';
import CompactEntry from '$lib/components/todos/views/CompactEntry.svelte';
import ListEntry from '$lib/components/todos/views/ListEntry.svelte';
import Flags from '$lib/components/todos/props/Flags.svelte';
import Effort from '$lib/components/todos/props/Effort.svelte';
import Priority from '$lib/components/todos/props/Priority.svelte';
import Title from '$lib/components/todos/props/Title.svelte';
import CategoryEdit from '$lib/components/todos/CategoryEdit.svelte';
import WorkspaceEdit from '$lib/components/todos/WorkspaceEdit.svelte';
import { category, todo, todoWorkspace } from '../unit/helpers/factories';

type Stores = { todos: Todos; loadingIndicator: LoadingIndicator; keyManager: KeyManager; ts: Translation };

function renderTodos(component: unknown, props: Record<string, unknown> = {}, todosOverrides: Record<string, unknown> = {}): Stores & { container: HTMLElement } {
	let stores: Stores | null = null;
	const { container } = renderWithContext(
		StoreHarness,
		{ component, props, provide: setTags },
		{ stores: { todos: todosOverrides }, onReady: (s) => (stores = s as unknown as Stores) }
	);
	return { ...stores!, container };
}

async function openMobileMenu(container: HTMLElement): Promise<void> {
	await fireEvent.click(container.querySelector('button.lg\\:hidden')!);
}

function pressKey(keyManager: KeyManager, key: string): void {
	keyManager.handleKeyDown(new KeyboardEvent('keydown', { key }));
}

describe('todo navigation', () => {
	it('applies a section filter from the mobile menu and closes it', async () => {
		const { todos, container } = renderTodos(TodoNavigation);
		const useFilters = vi.spyOn(todos, 'useFilters').mockImplementation(() => {});

		await openMobileMenu(container);
		await fireEvent.click(screen.getByRole('button', { name: 'Due at' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Overdue' }));

		expect(useFilters).toHaveBeenCalledWith([{ type: 'due', value: 'overdue' }]);
		expect(screen.queryByRole('button', { name: 'Due at' })).toBeNull();
	});

	it('clears the filters from the mobile menu', async () => {
		const { todos, container } = renderTodos(TodoNavigation);
		const useFilters = vi.spyOn(todos, 'useFilters').mockImplementation(() => {});

		await openMobileMenu(container);
		await fireEvent.click(screen.getByRole('button', { name: 'All Todos' }));

		expect(useFilters).toHaveBeenCalledWith([]);
	});

	it('highlights the active filter on desktop and in the mobile menu', async () => {
		const { todos, container } = renderTodos(TodoNavigation, {}, { activeFilters: [{ type: 'due', value: 'overdue' }] });

		expect(screen.getByRole('link', { name: 'Overdue' }).firstElementChild).toHaveClass('bg-c-neutral-1', 'dark:bg-s-dark-3');
		expect(screen.getByRole('link', { name: 'Tomorrow' }).firstElementChild).not.toHaveClass('bg-c-neutral-1');
		expect(screen.getByRole('link', { name: 'All Todos' })).not.toHaveClass('bg-c-neutral-1');

		await openMobileMenu(container);
		await fireEvent.click(screen.getByRole('button', { name: 'Due at' }));
		expect(screen.getByRole('button', { name: 'Overdue' })).toHaveClass('bg-c-neutral-1', 'dark:bg-s-dark-3');
		expect(screen.getByRole('button', { name: 'Tomorrow' })).not.toHaveClass('bg-c-neutral-1');

		todos.activeFilters = [];
		await tick();
		expect(screen.getByRole('link', { name: 'All Todos' })).toHaveClass('bg-c-neutral-1', 'dark:bg-s-dark-3');
	});
});

describe('KanbanView', () => {
	it('labels the status columns in the app language', () => {
		const { container } = renderTodos(KanbanView, { handleCheck: vi.fn() });
		const headings = [...container.querySelectorAll('.text-2xl')].map((h) => h.textContent?.trim());
		expect(headings).toEqual(['Pending', 'In Progress', 'Waiting', 'Almost done']);
	});
});

describe('todo entries', () => {
	it.each([
		['CompactEntry', CompactEntry],
		['ListEntry', ListEntry]
	])('%s marks a just-created todo with its border', (_, component) => {
		const fresh = todo({ id: 'new' });
		renderTodos(component, { todo: fresh, handleCheck: vi.fn() }, { recentlyCreated: 'new' });
		const card = screen.getAllByText('Test todo')[0].closest('.border-1');
		expect(card).toHaveClass('border-c-btn-hover');
		expect(card).not.toHaveClass('border-d-lightblue');
	});

	it.each([
		['CompactEntry', CompactEntry],
		['ListEntry', ListEntry]
	])('%s gives other todos the regular border', (_, component) => {
		renderTodos(component, { todo: todo(), handleCheck: vi.fn() });
		const card = screen.getAllByText('Test todo')[0].closest('.border-1');
		expect(card).toHaveClass('border-d-lightblue', 'dark:border-s-dark');
		expect(card).not.toHaveClass('border-c-btn-hover');
	});
});

describe('Flags', () => {
	it('shows one badge per extra a todo has', () => {
		const { container } = renderWithContext(Flags, { todo: todo({ description: 'x', link: 'https://a.b', recurrence_frequency: 'daily' }) });
		expect(container.querySelectorAll('svg')).toHaveLength(3);
	});

	it('shows nothing for a plain todo', () => {
		const { container } = renderWithContext(Flags, { todo: todo({ description: null as unknown as string }) });
		expect(container.querySelectorAll('svg')).toHaveLength(0);
	});
});

describe('Effort', () => {
	it('changes the effort from the quick-select menu', async () => {
		const { todos } = renderTodos(Effort, { todo: todo(), changeEffort: true });
		const changeEffort = vi.spyOn(todos, 'changeEffort').mockResolvedValue(true);

		for (const effort of ['low', 'medium', 'high']) {
			await fireEvent.click(document.querySelector('svg')!);
			const options = document.querySelectorAll('svg');
			await fireEvent.click(options[['low', 'medium', 'high'].indexOf(effort) + 1]);
		}

		expect(changeEffort.mock.calls.map((call) => call[1])).toEqual(['low', 'medium', 'high']);
	});
});

describe('Priority', () => {
	it('changes the priority from the quick-select menu', async () => {
		const { todos } = renderTodos(Priority, { todo: todo(), changePriority: true, expanded: false });
		const changePriority = vi.spyOn(todos, 'changePriority').mockResolvedValue(true);

		for (const index of [0, 1, 2]) {
			await fireEvent.click(document.querySelector('svg')!);
			await fireEvent.click(document.querySelectorAll('svg')[index + 1]);
		}

		expect(changePriority.mock.calls.map((call) => call[1])).toEqual(['high', 'medium', 'low']);
	});

	it.each([
		['high', 'text-c-danger', 'text-c-danger-icon'],
		['medium', 'text-c-btn', 'text-c-btn-icon'],
		['low', 'text-c-success', 'text-c-success-icon']
	] as const)('colours a %s priority icon', (priority, color, filledColor) => {
		const plain = renderTodos(Priority, { todo: todo({ priority }), changePriority: false, expanded: false });
		expect(plain.container.querySelector('svg')).toHaveClass(color);
		const filled = renderTodos(Priority, { todo: todo({ priority }), changePriority: true, expanded: false, filled: true });
		expect(filled.container.querySelector('svg')).toHaveClass('cursor-pointer', filledColor);
		const outlined = renderTodos(Priority, { todo: todo({ priority }), changePriority: true, expanded: false });
		expect(outlined.container.querySelector('svg')).toHaveClass('cursor-pointer', 'rounded-full', color);
	});
});

describe('Title', () => {
	it('does not leave the loading indicator running when the title is cleared', async () => {
		const { todos, loadingIndicator, keyManager } = renderTodos(Title, { todo: todo() });
		const changeTitle = vi.spyOn(todos, 'changeTitle').mockResolvedValue(true);

		await fireEvent.dblClick(screen.getByText('Test todo'));
		await fireEvent.input(screen.getByRole('textbox'), { target: { value: '   ' } });
		pressKey(keyManager, 'Enter');
		await tick();

		expect(changeTitle).not.toHaveBeenCalled();
		expect(loadingIndicator.active).toBe(false);
	});

	it('saves a trimmed title on Enter', async () => {
		const { todos, loadingIndicator, keyManager } = renderTodos(Title, { todo: todo() });
		const changeTitle = vi.spyOn(todos, 'changeTitle').mockResolvedValue(true);

		await fireEvent.dblClick(screen.getByText('Test todo'));
		await fireEvent.input(screen.getByRole('textbox'), { target: { value: ' Renamed ' } });
		pressKey(keyManager, 'Enter');
		await tick();

		expect(changeTitle).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }), 'Renamed');
		expect(loadingIndicator.active).toBe(false);
	});
});

describe('renaming categories and workspaces', () => {
	const cases = [
		['category', CategoryEdit, { category: category(1, 'Home') }, 'Rename Category', 'updateCategory'],
		['workspace', WorkspaceEdit, { workspace: { ...todoWorkspace(1, []), title: 'Home' } }, 'Rename Workspace', 'updateWorkspace']
	] as const;

	async function startRename(component: unknown, props: Record<string, unknown>, label: string) {
		const stores = renderTodos(component, props);
		await fireEvent.click(screen.getByTitle(label));
		await tick();
		return stores;
	}

	it.each(cases)('saves a trimmed new %s title on Enter', async (_, component, props, label, method) => {
		const { todos, keyManager, loadingIndicator } = await startRename(component, props, label);
		const update = vi.spyOn(todos, method).mockResolvedValue(true);

		await fireEvent.input(screen.getByPlaceholderText(label), { target: { value: ' Work ' } });
		pressKey(keyManager, 'Enter');
		await tick();

		expect(update).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), { title: 'Work' });
		expect(loadingIndicator.active).toBe(false);
		expect(screen.queryByPlaceholderText(label)).toBeNull();
	});

	it.each(cases)('does not save an unchanged or empty %s title', async (_, component, props, label, method) => {
		const { todos, keyManager } = await startRename(component, props, label);
		const update = vi.spyOn(todos, method).mockResolvedValue(true);

		pressKey(keyManager, 'Enter');
		await tick();
		await fireEvent.click(screen.getByTitle(label));
		await tick();
		await fireEvent.input(screen.getByPlaceholderText(label), { target: { value: '  ' } });
		pressKey(keyManager, 'Enter');
		await tick();

		expect(update).not.toHaveBeenCalled();
	});

	it.each(cases)('cancels renaming a %s on Escape', async (_, component, props, label, method) => {
		const { todos, keyManager } = await startRename(component, props, label);
		const update = vi.spyOn(todos, method).mockResolvedValue(true);

		await fireEvent.input(screen.getByPlaceholderText(label), { target: { value: 'Work' } });
		pressKey(keyManager, 'Escape');
		await tick();

		expect(update).not.toHaveBeenCalled();
		expect(screen.queryByPlaceholderText(label)).toBeNull();
		expect(screen.getByText(/Home/)).toBeInTheDocument();
	});
});
