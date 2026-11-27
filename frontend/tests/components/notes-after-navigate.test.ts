import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import ApiService from '$lib/services/ApiService';
import { NotesSvelte, setNotes } from '$lib/state/Notes.svelte';
import { en } from '$lib/i18n/en';
import { renderWithContext } from './helpers/context';
import StoreHarness from './helpers/StoreHarness.svelte';
import NotesLayout from '../../src/routes/notes/+layout.svelte';
import NoteNavigationMobile from '$lib/components/notes/NoteNavigationMobile.svelte';

const navigation = vi.hoisted(() => ({ callbacks: [] as (() => void)[] }));

vi.mock('$app/navigation', () => ({
	afterNavigate: (callback: () => void) => navigation.callbacks.push(callback),
	goto: vi.fn()
}));
vi.mock('$app/state', () => ({
	page: { params: {}, url: new URL('http://localhost/notes'), route: { id: '/notes' } }
}));

function navigate(): void {
	for (const callback of navigation.callbacks) callback();
	flushSync();
}

beforeEach(() => {
	navigation.callbacks = [];
	vi.spyOn(ApiService.prototype, 'list').mockResolvedValue(null);
});

describe('Notes after a navigation', () => {
	it('the layout lets the active note follow the URL', async () => {
		const sync = vi.spyOn(NotesSvelte.prototype, 'syncActiveNoteWithUrl');
		renderWithContext(NotesLayout);
		await waitFor(() => expect(ApiService.prototype.list).toHaveBeenCalled());
		sync.mockClear();

		navigate();

		expect(sync).toHaveBeenCalledTimes(1);
	});

	it('the mobile drawer closes', async () => {
		const { container } = renderWithContext(StoreHarness, { component: NoteNavigationMobile, provide: setNotes });
		await fireEvent.click(container.querySelector('button')!);
		expect(screen.getByText(en.notes.notebook)).toBeInTheDocument();

		navigate();

		await waitFor(() => expect(screen.queryByText(en.notes.notebook)).not.toBeInTheDocument());
	});
});
