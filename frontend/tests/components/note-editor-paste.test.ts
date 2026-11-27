import { describe, it, expect, beforeAll } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/svelte';
import { renderWithContext } from './helpers/context';
import TipTapEditorHarness from './helpers/TipTapEditorHarness.svelte';
import { note } from '../unit/helpers/factories';

const SNIPPET = '# Step two';

const FULL_NOTE = `# Shopping list

**Weekend**

1. Buy bread.

2. Buy milk.

- Before leaving:

\`\`\`

check the fridge

\`\`\`

- **Optional:** flowers for the table.`;

async function renderEditor(content = '<p></p>'): Promise<HTMLElement> {
	const { container } = renderWithContext(TipTapEditorHarness, { note: note({ id: 'n1', content }) });
	await waitFor(() => expect(container.querySelector('.tiptap-editor')).not.toBeNull());
	return container.querySelector<HTMLElement>('.tiptap-editor')!;
}

function paste(editor: HTMLElement, data: Record<string, string>): void {
	const event = new Event('paste', { bubbles: true, cancelable: true });
	Object.defineProperty(event, 'clipboardData', {
		value: { getData: (type: string) => data[type] ?? '', types: Object.keys(data), items: [], files: [] }
	});
	editor.dispatchEvent(event);
}

describe('Pasting Markdown into a note', () => {
	// jsdom has no layout; ProseMirror measures the cursor after the paste.
	beforeAll(() => {
		Range.prototype.getClientRects ??= () => [] as unknown as DOMRectList;
		Range.prototype.getBoundingClientRect ??= () => new DOMRect();
	});

	it('formats a pasted plain-text snippet', async () => {
		const editor = await renderEditor();

		paste(editor, { 'text/plain': SNIPPET });

		await waitFor(() => expect(editor.querySelector('h1')?.textContent).toBe('Step two'));
	});

	it('formats a pasted plain-text note', async () => {
		const editor = await renderEditor();

		paste(editor, { 'text/plain': FULL_NOTE });

		await waitFor(() => expect(editor.querySelector('h1')?.textContent).toBe('Shopping list'));
		expect(editor.querySelector('ol li')?.textContent).toBe('Buy bread.');
		expect(editor.querySelector('pre code')?.textContent).toContain('check the fridge');
		expect(editor.textContent).not.toContain('**');
	});

	it('leaves plain text that is no Markdown as it is', async () => {
		const editor = await renderEditor();

		paste(editor, { 'text/plain': 'Meet at #office, file_name_v2 is ready' });

		await waitFor(() => expect(editor.textContent).toBe('Meet at #office, file_name_v2 is ready'));
		expect(editor.querySelector('em, h1')).toBeNull();
	});

	it('leaves a paste with HTML to the editor', async () => {
		const editor = await renderEditor();

		paste(editor, { 'text/plain': SNIPPET, 'text/html': `<p>${SNIPPET}</p>` });

		await waitFor(() => expect(editor.textContent).toBe(SNIPPET));
		expect(editor.querySelector('h1')).toBeNull();
	});

	it('pastes Markdown literally with Ctrl+Shift+V', async () => {
		const editor = await renderEditor();

		await fireEvent.keyDown(editor, { key: 'V', ctrlKey: true, shiftKey: true });
		paste(editor, { 'text/plain': SNIPPET });

		await waitFor(() => expect(editor.textContent).toBe(SNIPPET));
		expect(editor.querySelector('h1')).toBeNull();
	});

	it('pastes Markdown literally into a code block', async () => {
		const editor = await renderEditor('<pre><code></code></pre>');

		paste(editor, { 'text/plain': SNIPPET });

		await waitFor(() => expect(editor.querySelector('pre code')?.textContent).toBe(SNIPPET));
		expect(editor.querySelector('h1')).toBeNull();
	});
});
