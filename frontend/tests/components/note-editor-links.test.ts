import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/svelte';
import { renderWithContext } from './helpers/context';
import TipTapEditorHarness from './helpers/TipTapEditorHarness.svelte';
import { NotesSvelte } from '$lib/state/Notes.svelte';
import { note } from '../unit/helpers/factories';

const NOTE_ID = '3f1c2b4a-5d6e-4f70-8a9b-0c1d2e3f4a5b';

async function renderEditor(): Promise<HTMLElement> {
	const content = `<p><a href="/notes/${NOTE_ID}">Groceries</a> and <a href="https://example.com/page">Example</a></p>`;
	const { container } = renderWithContext(TipTapEditorHarness, { note: note({ id: 'n1', content }) });
	await waitFor(() => expect(container.querySelector('.tiptap-editor a')).not.toBeNull());
	return container;
}

function link(container: HTMLElement, text: string): HTMLAnchorElement {
	return [...container.querySelectorAll<HTMLAnchorElement>('.tiptap-editor a')].find((a) => a.textContent === text)!;
}

describe('Links in the note editor', () => {
	// jsdom has no layout; ProseMirror measures the cursor when a click places it.
	beforeAll(() => {
		Range.prototype.getClientRects ??= () => [] as unknown as DOMRectList;
		Range.prototype.getBoundingClientRect ??= () => new DOMRect();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('only places the cursor on a plain click', async () => {
		const opened = vi.spyOn(HTMLAnchorElement.prototype, 'click');
		const openNote = vi.spyOn(NotesSvelte.prototype, 'openNote').mockResolvedValue(undefined as never);
		const container = await renderEditor();

		const internal = fireEvent.click(link(container, 'Groceries'));
		const external = fireEvent.click(link(container, 'Example'));

		expect(await internal).toBe(false);
		expect(await external).toBe(false);
		expect(openNote).not.toHaveBeenCalled();
		expect(opened).not.toHaveBeenCalled();
	});

	it('opens a note link in the app on Ctrl+click', async () => {
		const openNote = vi.spyOn(NotesSvelte.prototype, 'openNote').mockResolvedValue(undefined as never);
		const container = await renderEditor();

		await fireEvent.click(link(container, 'Groceries'), { ctrlKey: true });

		expect(openNote).toHaveBeenCalledWith(NOTE_ID);
	});

	it('opens an external link in a new tab on Cmd+click', async () => {
		const opened: HTMLAnchorElement[] = [];
		vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
			opened.push(this);
		});
		const container = await renderEditor();

		await fireEvent.click(link(container, 'Example'), { metaKey: true });

		expect(opened).toHaveLength(1);
		expect(opened[0].href).toBe('https://example.com/page');
		expect(opened[0].target).toBe('_blank');
		expect(opened[0].rel).toBe('external');
	});

	it('renders note links without a new-tab target', async () => {
		const container = await renderEditor();

		expect(link(container, 'Groceries').hasAttribute('target')).toBe(false);
		expect(link(container, 'Example').getAttribute('target')).toBe('_blank');
	});
});
