import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import ApiService, { RateLimitedError } from '$lib/services/ApiService';
import type { ExportStatus } from '$lib/types/export';
import type { Translation } from '$lib/state/Translation.svelte';
import type { UiNotifications } from '$lib/state/UiNotifications.svelte';
import type { LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
import type { KeyManager } from '$lib/state/KeyManager.svelte';
import { setNavigation, type Navigation } from '$lib/state/Navigation.svelte';
import { setTags, type Tags } from '$lib/state/Tags.svelte';
import { setPlugins, type Plugins } from '$lib/state/Plugins.svelte';
import { setShortcuts, type Shortcuts } from '$lib/state/Shortcuts.svelte';
import { setDataExport } from '$lib/state/DataExport.svelte';
import FeatureSettings from '$lib/components/settings/FeatureSettings.svelte';
import NavigationOrder from '$lib/components/settings/NavigationOrder.svelte';
import TagEdit from '$lib/components/settings/TagEdit.svelte';
import PasswordSettings from '$lib/components/settings/PasswordSettings.svelte';
import AiPluginSettings from '$lib/components/settings/AiPluginSettings.svelte';
import CreateEntry from '$lib/components/settings/CreateEntry.svelte';
import ManageShortcuts from '$lib/components/shortcuts/ManageShortcuts.svelte';
import ShortcutEdit from '$lib/components/shortcuts/ShortcutEdit.svelte';
import ExportSettings from '$lib/components/settings/ExportSettings.svelte';
import { en } from '$lib/i18n/en';
import { de } from '$lib/i18n/de';
import { renderWithContext } from './helpers/context';
import { rejectionsDuring } from './helpers/rejections';
import StoreHarness from './helpers/StoreHarness.svelte';
import { tag } from '../unit/helpers/factories';

const offline = new Error('offline');

type Rendered<T> = { store: T; loadingIndicator: LoadingIndicator; keyManager: KeyManager; container: HTMLElement };

function renderWithStore<T>(
	component: unknown,
	provide: () => T,
	options: { props?: Record<string, unknown>; seed?: (store: T) => void; stores?: Record<string, Record<string, unknown>> } = {}
): Rendered<T> {
	const rendered = {} as Rendered<T>;
	const { container } = renderWithContext(
		StoreHarness,
		{
			component,
			props: options.props ?? {},
			provide,
			onReady: (store: T) => {
				options.seed?.(store);
				rendered.store = store;
			}
		},
		{
			stores: options.stores,
			onReady: (stores) => {
				rendered.loadingIndicator = stores.loadingIndicator as LoadingIndicator;
				rendered.keyManager = stores.keyManager as KeyManager;
			}
		}
	);
	rendered.container = container;
	return rendered;
}

function toggleNextTo(text: string): HTMLInputElement {
	return screen.getByText(text).parentElement!.querySelector('input[type=checkbox]') as HTMLInputElement;
}

function pressKey(keyManager: KeyManager, key: string): void {
	keyManager.handleKeyDown(new KeyboardEvent('keydown', { key }));
}

describe('The loading indicator stops when a settings request fails', () => {
	it('for the journal and calendar mark toggles', async () => {
		const { loadingIndicator } = renderWithStore(FeatureSettings, setNavigation, {
			stores: { auth: { updateJournalEnabled: vi.fn().mockRejectedValue(offline) } }
		});

		const rejections = await rejectionsDuring(() => fireEvent.click(toggleNextTo('Enable journal')).then(() => {}));

		expect(rejections).toEqual([offline]);
		expect(loadingIndicator.active).toBe(false);
	});

	it('for the navigation feature toggles', async () => {
		const { loadingIndicator, container } = renderWithStore<Navigation>(NavigationOrder, setNavigation, {
			seed: (nav) => (nav.save = vi.fn().mockRejectedValue(offline))
		});

		const rejections = await rejectionsDuring(() => fireEvent.click(container.querySelector('input[type=checkbox]')!).then(() => {}));

		expect(rejections).toEqual([offline]);
		expect(loadingIndicator.active).toBe(false);
	});

	it('for deleting a tag', async () => {
		const { loadingIndicator, container } = renderWithStore<Tags>(TagEdit, setTags, {
			props: { tag: tag(3, 'travel') },
			seed: (tags) => (tags.delete = vi.fn().mockRejectedValue(offline))
		});

		const rejections = await rejectionsDuring(() => fireEvent.click(container.querySelector('.ml-2 button')!).then(() => {}));

		expect(rejections).toEqual([offline]);
		expect(loadingIndicator.active).toBe(false);
	});

	it('for changing the password', async () => {
		let loadingIndicator: LoadingIndicator | null = null;
		const { container } = renderWithContext(PasswordSettings, {}, {
			stores: { auth: { changePassword: vi.fn().mockRejectedValue(offline) } },
			onReady: (stores) => (loadingIndicator = stores.loadingIndicator as LoadingIndicator)
		});
		const [current, next, confirmation] = container.querySelectorAll('input');
		await fireEvent.input(current, { target: { value: 'old password 123' } });
		await fireEvent.input(next, { target: { value: 'new password 123' } });
		await fireEvent.input(confirmation, { target: { value: 'new password 123' } });

		const rejections = await rejectionsDuring(() => fireEvent.submit(container.querySelector('form')!).then(() => {}));

		expect(rejections).toEqual([offline]);
		expect(loadingIndicator!.active).toBe(false);
	});

	it('for loading the AI settings', async () => {
		let rendered: Rendered<Plugins> | null = null;
		const rejections = await rejectionsDuring(async () => {
			rendered = renderWithStore<Plugins>(AiPluginSettings, setPlugins, {
				seed: (plugins) => (plugins.load = vi.fn().mockRejectedValue(offline))
			});
		});

		expect(rejections).toEqual([offline]);
		expect(rendered!.loadingIndicator.active).toBe(false);
	});

	it('for creating an entry', async () => {
		let stores: { loadingIndicator: LoadingIndicator; keyManager: KeyManager } | null = null;
		renderWithContext(CreateEntry, { label: 'Tag', create: vi.fn().mockRejectedValue(offline) }, {
			onReady: (s) => (stores = s as typeof stores)
		});
		await fireEvent.click(screen.getByRole('button', { name: '+ Tag' }));
		await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'travel' } });

		const rejections = await rejectionsDuring(async () => pressKey(stores!.keyManager, 'Enter'));

		expect(rejections).toEqual([offline]);
		expect(stores!.loadingIndicator.active).toBe(false);
	});

	it('for creating a shortcut', async () => {
		const { loadingIndicator, keyManager, container } = renderWithStore<Shortcuts>(ManageShortcuts, setShortcuts, {
			props: { onClose: vi.fn() },
			seed: (shortcuts) => (shortcuts.create = vi.fn().mockRejectedValue(offline))
		});
		await fireEvent.click(container.querySelector('.mt-4 button')!);
		const [title, url] = screen.getAllByRole('textbox');
		await fireEvent.input(title, { target: { value: 'Mail' } });
		await fireEvent.input(url, { target: { value: 'https://mail.example.org' } });

		const rejections = await rejectionsDuring(async () => pressKey(keyManager, 'Enter'));

		expect(rejections).toEqual([offline]);
		expect(loadingIndicator.active).toBe(false);
	});

	it('for deleting a shortcut', async () => {
		const { loadingIndicator, container } = renderWithStore<Shortcuts>(ShortcutEdit, setShortcuts, {
			props: { shortcut: { id: '1', title: 'Mail', url: 'https://mail.example.org', order: 0, created_at: '', updated_at: '' } },
			seed: (shortcuts) => (shortcuts.delete = vi.fn().mockRejectedValue(offline))
		});

		const rejections = await rejectionsDuring(() => fireEvent.click(container.querySelectorAll('button')[1]).then(() => {}));

		expect(rejections).toEqual([offline]);
		expect(loadingIndicator.active).toBe(false);
	});
});

describe('Creating an entry', () => {
	it('releases its Escape key once Enter has created the entry', async () => {
		let keyManager: KeyManager | null = null;
		const create = vi.fn().mockResolvedValue(undefined);
		renderWithContext(CreateEntry, { label: 'Tag', create }, {
			onReady: (stores) => (keyManager = stores.keyManager as KeyManager)
		});
		await fireEvent.click(screen.getByRole('button', { name: '+ Tag' }));
		await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'travel' } });

		pressKey(keyManager!, 'Enter');

		await waitFor(() => expect(create).toHaveBeenCalledWith('travel'));
		await waitFor(() => expect(keyManager!.handlers.Escape).toHaveLength(0));
	});
});

describe('Data export', () => {
	const status: ExportStatus = { id: 7, status: 'completed', created_at: '2026-11-20T10:15:00Z', expires_at: '2026-11-27T10:15:00Z', is_expired: false };

	function renderExport(onReady: (stores: Record<string, unknown>) => void = () => {}) {
		renderWithContext(StoreHarness, { component: ExportSettings, provide: setDataExport }, { onReady });
	}

	function renderExportCollectingMessages(): () => string[] {
		let notifications: UiNotifications | null = null;
		renderExport((stores) => (notifications = stores.uiNotifications as UiNotifications));
		return () => notifications!.queue.map((n) => n.message);
	}

	it('shows the export dates in the app language', async () => {
		vi.spyOn(ApiService.prototype, 'getRaw').mockResolvedValue({ success: true, data: status });

		renderExport(({ ts }) => (ts as Translation).changeLanguage('de'));

		expect(await screen.findByText(new Date(status.created_at).toLocaleString('de'))).toBeInTheDocument();
		expect(screen.getByText(`${de.settings.export_expires_at}: ${new Date(status.expires_at!).toLocaleString('de')}`)).toBeInTheDocument();
	});

	it('names the features in the app language', async () => {
		vi.spyOn(ApiService.prototype, 'getRaw').mockResolvedValue(null);

		renderExport(({ ts }) => (ts as Translation).changeLanguage('de'));

		expect(screen.getByText(de.nav.calendar)).toBeInTheDocument();
		expect(screen.getByText(de.finances.wealth)).toBeInTheDocument();
	});

	it('asks for at least one feature in the app language', async () => {
		vi.spyOn(ApiService.prototype, 'getRaw').mockResolvedValue(null);
		const messages = renderExportCollectingMessages();

		await fireEvent.click(screen.getByRole('button', { name: en.settings.export_deselect_all }));
		await fireEvent.click(screen.getByRole('button', { name: en.settings.export_start }));

		expect(messages()).toEqual([en.settings.export_select_at_least_one]);
	});

	it('says the export failed in the app language', async () => {
		vi.spyOn(ApiService.prototype, 'getRaw').mockResolvedValue(null);
		vi.spyOn(ApiService.prototype, 'postRaw').mockResolvedValue({ success: false });
		const messages = renderExportCollectingMessages();

		await fireEvent.click(screen.getByRole('button', { name: en.settings.export_start }));

		await waitFor(() => expect(messages()).toEqual([en.settings.export_status_failed]));
	});

	it('starts the export for every feature, confirms it and shows the new status', async () => {
		const getRaw = vi.spyOn(ApiService.prototype, 'getRaw').mockResolvedValueOnce(null).mockResolvedValue({ success: true, data: status });
		const postRaw = vi.spyOn(ApiService.prototype, 'postRaw').mockResolvedValue({ success: true, message: 'Export started.' } as never);
		const messages = renderExportCollectingMessages();

		await fireEvent.click(screen.getByRole('button', { name: en.settings.export_start }));

		await waitFor(() => expect(messages()).toEqual(['Export started.']));
		expect(postRaw).toHaveBeenCalledWith(expect.stringMatching(/\/export$/), { features: expect.arrayContaining(['todos', 'financesWealth']) });
		expect((postRaw.mock.calls[0][1] as { features: string[] }).features).toHaveLength(15);
		expect(await screen.findByText(en.settings.export_status_completed)).toBeInTheDocument();
		expect(getRaw).toHaveBeenCalledTimes(2);
		expect(getRaw).toHaveBeenCalledWith(expect.stringMatching(/\/export\/status$/));
	});

	it('says when the export limit is reached', async () => {
		vi.spyOn(ApiService.prototype, 'getRaw').mockResolvedValue(null);
		vi.spyOn(ApiService.prototype, 'postRaw').mockRejectedValue(new RateLimitedError(null, 'export_rate_limited'));
		const messages = renderExportCollectingMessages();

		await fireEvent.click(screen.getByRole('button', { name: en.settings.export_start }));

		await waitFor(() => expect(messages()).toEqual([en.settings.export_rate_limited]));
	});

	it('downloads the finished export as a zip and says when that fails', async () => {
		vi.spyOn(ApiService.prototype, 'getRaw').mockResolvedValue({ success: true, data: status });
		const download = vi.spyOn(ApiService.prototype, 'download').mockResolvedValue(null);
		const messages = renderExportCollectingMessages();

		await fireEvent.click(await screen.findByRole('button', { name: en.settings.export_download }));

		await waitFor(() => expect(messages()).toEqual([en.settings.export_download_failed]));
		expect(download).toHaveBeenCalledWith(expect.stringMatching(/\/export\/7\/download$/), 'application/zip');
	});
});

