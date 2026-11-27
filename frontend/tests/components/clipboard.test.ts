import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { Component } from 'svelte';
import { setClipboard, type Clipboard } from '$lib/state/Clipboard.svelte';
import type { LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
import type { UiNotifications } from '$lib/state/UiNotifications.svelte';
import { en } from '$lib/i18n/en';
import { rejectionsDuring } from './helpers/rejections';
import { renderWithContext } from './helpers/context';
import StoreHarness from './helpers/StoreHarness.svelte';
import { clipboardEntry } from '../unit/helpers/factories';
import ClipboardCreate from '$lib/components/clipboard/ClipboardCreate.svelte';
import ClipboardList from '$lib/components/clipboard/ClipboardList.svelte';

type Rendered = { clipboard: Clipboard; loadingIndicator: LoadingIndicator; notifications: UiNotifications };

function renderClipboard(component: Component<never>, setup: (clipboard: Clipboard) => void = () => {}): Rendered {
	const rendered = {} as Rendered;
	renderWithContext(
		StoreHarness,
		{
			component,
			provide: setClipboard,
			onReady: (clipboard: Clipboard) => {
				setup(clipboard);
				rendered.clipboard = clipboard;
			}
		},
		{
			onReady: (stores) => {
				rendered.loadingIndicator = stores.loadingIndicator as LoadingIndicator;
				rendered.notifications = stores.uiNotifications as UiNotifications;
			}
		}
	);
	return rendered;
}

function messages(notifications: UiNotifications): string[] {
	return notifications.queue.map((notification) => `${notification.type}: ${notification.message}`);
}

describe('ClipboardCreate', () => {
	async function typeAndSave(text: string): Promise<void> {
		await userEvent.type(screen.getByRole('textbox'), text);
		await userEvent.click(screen.getByText(en.clipboard.save));
	}

	it('saves the text, confirms and clears the input', async () => {
		const { clipboard, notifications } = renderClipboard(ClipboardCreate as Component<never>, (clipboard) => {
			clipboard.create = vi.fn().mockResolvedValue(true);
		});

		await typeAndSave('Hello');

		expect(clipboard.create).toHaveBeenCalledWith({ content: 'Hello' });
		expect(messages(notifications)).toEqual([`success: ${en.clipboard.save_success}`]);
		expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('');
	});

	it('keeps the text and reports a failed save', async () => {
		const { notifications, loadingIndicator } = renderClipboard(ClipboardCreate as Component<never>, (clipboard) => {
			clipboard.create = vi.fn().mockResolvedValue(false);
		});

		await typeAndSave('Hello');

		expect(messages(notifications)).toEqual([`error: ${en.clipboard.save_error}`]);
		expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Hello');
		expect(loadingIndicator.active).toBe(false);
	});

	it('stops the loading indicator when the save throws', async () => {
		const { loadingIndicator } = renderClipboard(ClipboardCreate as Component<never>, (clipboard) => {
			clipboard.create = vi.fn().mockRejectedValue(new Error('offline'));
		});

		const rejections = await rejectionsDuring(() => typeAndSave('Hello'));

		expect(rejections).toEqual([new Error('offline')]);
		expect(loadingIndicator.active).toBe(false);
	});
});

describe('ClipboardList', () => {
	it('reports a failed delete', async () => {
		const { notifications, loadingIndicator } = renderClipboard(ClipboardList as Component<never>, (clipboard) => {
			clipboard.entries = [clipboardEntry()];
			clipboard.delete = vi.fn().mockResolvedValue(false);
		});

		await userEvent.click(screen.getByRole('button', { name: en.clipboard.delete_entry }));

		expect(messages(notifications)).toEqual([`error: ${en.clipboard.delete_error}`]);
		expect(loadingIndicator.active).toBe(false);
	});

	it('stops the loading indicator when the delete throws', async () => {
		const { loadingIndicator } = renderClipboard(ClipboardList as Component<never>, (clipboard) => {
			clipboard.entries = [clipboardEntry()];
			clipboard.delete = vi.fn().mockRejectedValue(new Error('offline'));
		});

		const rejections = await rejectionsDuring(() => userEvent.click(screen.getByRole('button', { name: en.clipboard.delete_entry })));

		expect(rejections).toEqual([new Error('offline')]);
		expect(loadingIndicator.active).toBe(false);
	});
});
