import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { Component } from 'svelte';
import { setNotes, type NotesSvelte as Notes } from '$lib/state/Notes.svelte';
import { setTags, type Tags } from '$lib/state/Tags.svelte';
import type { KeyManager } from '$lib/state/KeyManager.svelte';
import { en } from '$lib/i18n/en';
import { renderWithContext } from './helpers/context';
import StoreHarness from './helpers/StoreHarness.svelte';
import NoteHeader from '$lib/components/notes/NoteHeader.svelte';
import NoteSearch from '$lib/components/notes/NoteSearch.svelte';
import ListAndAdd from '$lib/components/todos/ListAndAdd.svelte';
import { note } from '../unit/helpers/factories';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

type Rendered = { notes: Notes; keyManager: KeyManager };

function renderNotes(component: Component<never>, setup: (notes: Notes) => void = () => {}): Rendered {
	const rendered = {} as Rendered;
	renderWithContext(
		StoreHarness,
		{
			component,
			provide: () => {
				setTags();
				return setNotes();
			},
			onReady: (notes: Notes) => {
				setup(notes);
				rendered.notes = notes;
			}
		},
		{ onReady: (stores) => (rendered.keyManager = stores.keyManager as KeyManager) }
	);
	return rendered;
}

function press(keyManager: KeyManager, key: string): void {
	keyManager.handleKeyDown(new KeyboardEvent('keydown', { key }));
}

describe('Note header', () => {
	const active = note({ id: 'n1', title: 'Groceries' });

	function renderHeader(): Rendered {
		const rendered = renderNotes(NoteHeader as Component<never>, (notes) => {
			notes.notes = [active];
			notes.activeNote = active;
		});
		vi.spyOn(rendered.notes, 'changeTitle').mockResolvedValue(true);
		vi.spyOn(rendered.notes, 'updateFavoriteStatus').mockResolvedValue(true);
		return rendered;
	}

	it('offers to move the note', async () => {
		const { notes } = renderHeader();

		await fireEvent.click(screen.getByTitle(en.notes.move_note));

		expect(notes.noteToMove).toEqual(active);
	});

	it('adds the note to the favourites', async () => {
		const { notes } = renderHeader();

		await fireEvent.click(screen.getByTitle(en.notes.add_to_favorites));

		expect(notes.updateFavoriteStatus).toHaveBeenCalledWith(active, true);
	});

	it('renames the note after a double click on the title', async () => {
		const { notes, keyManager } = renderHeader();

		await fireEvent.dblClick(screen.getByText('Groceries'));
		const input = screen.getByDisplayValue('Groceries');
		expect(input).toHaveFocus();
		await userEvent.clear(input);
		await userEvent.type(input, 'Shopping');
		press(keyManager, 'Enter');

		await vi.waitFor(() => expect(notes.changeTitle).toHaveBeenCalledWith('Shopping'));
	});

	it('starts renaming from the pencil button', async () => {
		renderHeader();

		await fireEvent.click(screen.getByRole('button', { name: en.layout.rename }));

		expect(screen.getByDisplayValue('Groceries')).toHaveFocus();
	});

	it('keeps the title when renaming is cancelled', async () => {
		const { notes, keyManager } = renderHeader();

		await fireEvent.dblClick(screen.getByText('Groceries'));
		await userEvent.type(screen.getByDisplayValue('Groceries'), ' list');
		press(keyManager, 'Escape');

		expect(await screen.findByText('Groceries')).toBeInTheDocument();
		expect(screen.queryByDisplayValue('Groceries list')).toBeNull();
		expect(notes.changeTitle).not.toHaveBeenCalled();
	});
});

describe('Note search', () => {
	function renderSearch(): Rendered {
		return renderNotes(NoteSearch as Component<never>, (notes) => {
			notes.notes = [note({ id: 'n1', title: 'Groceries' }), note({ id: 'n2', title: 'Travel' })];
			notes.searchVisible = true;
		});
	}

	it('searches the notes while typing', async () => {
		const { notes } = renderSearch();
		const input = screen.getByLabelText(en.notes.search_placeholder);

		expect(input).toHaveFocus();
		await userEvent.type(input, 'groc');

		expect(notes.searchTerm).toBe('groc');
		expect(await screen.findByRole('button', { name: /Groceries/ })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /Travel/ })).toBeNull();
	});

	it('names its close button', () => {
		renderSearch();

		expect(screen.getByRole('button', { name: en.layout.close })).toBeInTheDocument();
	});

	it('closes from its close button', async () => {
		const { notes } = renderSearch();

		await fireEvent.click(screen.getByRole('button'));

		await vi.waitFor(() => expect(notes.searchVisible).toBe(false));
	});
});

describe('Todo list headings with an add action', () => {
	function renderList(type: 'tag' | 'category'): { tags: Tags; onStart: ReturnType<typeof vi.fn> } {
		let tags: Tags | null = null;
		const onStart = vi.fn();
		const { container } = renderWithContext(StoreHarness, {
			component: ListAndAdd,
			props: { title: 'Tags', type, onStart, onFinish: vi.fn() },
			provide: setTags,
			onReady: (store: Tags) => {
				tags = store;
				vi.spyOn(store, 'create').mockResolvedValue(null);
			}
		});
		fireEvent.click(container.querySelector('svg')!);
		return { tags: tags!, onStart };
	}

	it('adds a tag from the plus action', async () => {
		const { tags, onStart } = renderList('tag');

		await userEvent.type(await screen.findByRole('textbox'), 'urgent');
		await fireEvent.click(screen.getAllByRole('button').at(-1)!);

		expect(onStart).toHaveBeenCalled();
		expect(tags.create).toHaveBeenCalledWith('urgent');
	});
});
