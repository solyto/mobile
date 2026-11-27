import { describe, it, expect, vi, afterEach } from 'vitest';
import { fireEvent, screen } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { en } from '$lib/i18n/en';
import type { UpdaterStatus } from '$lib/types/platform';
import { renderWithContext } from './helpers/context';
import UpdateChecker from '$lib/components/settings/UpdateChecker.svelte';

function fakeElectron(checkForUpdates: () => Promise<void> = () => Promise.resolve()) {
	const fake = {
		listener: null as ((status: UpdaterStatus) => void) | null,
		unsubscribe: vi.fn(),
		checkForUpdates: vi.fn(checkForUpdates),
		installUpdate: vi.fn(),
		onUpdaterStatus: vi.fn((callback: (status: UpdaterStatus) => void) => {
			fake.listener = callback;
			return fake.unsubscribe;
		})
	};
	Object.assign(window, { electronAPI: fake });
	return fake;
}

function report(electron: ReturnType<typeof fakeElectron>, status: UpdaterStatus): void {
	electron.listener!(status);
	flushSync();
}

function checkButton(): HTMLButtonElement {
	return screen.getByRole('button', { name: en.settings.update_check });
}

afterEach(() => {
	Reflect.deleteProperty(window, 'electronAPI');
});

describe('UpdateChecker', () => {
	it('listens for updater status while shown and stops when closed', () => {
		const electron = fakeElectron();

		const { unmount } = renderWithContext(UpdateChecker);
		expect(electron.onUpdaterStatus).toHaveBeenCalledTimes(1);
		expect(electron.unsubscribe).not.toHaveBeenCalled();

		unmount();
		expect(electron.unsubscribe).toHaveBeenCalledTimes(1);
	});

	it('shows the status the desktop app reports', () => {
		const electron = fakeElectron();
		renderWithContext(UpdateChecker);

		report(electron, { type: 'available', version: '1.2.0' });
		expect(screen.getByText(en.settings.update_available.replace('%s', '1.2.0'))).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: en.settings.update_install })).not.toBeInTheDocument();

		report(electron, { type: 'ready' });
		expect(screen.getByText(en.settings.update_ready)).toBeInTheDocument();
	});

	it('installs a ready update', async () => {
		const electron = fakeElectron();
		renderWithContext(UpdateChecker);
		report(electron, { type: 'ready' });

		await fireEvent.click(screen.getByRole('button', { name: en.settings.update_install }));

		expect(electron.installUpdate).toHaveBeenCalledTimes(1);
	});

	it('disables the check button while checking', async () => {
		const electron = fakeElectron(() => new Promise(() => {}));
		renderWithContext(UpdateChecker);

		await fireEvent.click(checkButton());

		expect(electron.checkForUpdates).toHaveBeenCalledTimes(1);
		expect(checkButton()).toBeDisabled();
	});

	it('says so when the check fails', async () => {
		fakeElectron(() => Promise.reject(new Error('offline')));
		renderWithContext(UpdateChecker);

		await fireEvent.click(checkButton());

		expect(await screen.findByText(en.settings.update_check_failed)).toBeInTheDocument();
		expect(checkButton()).toBeEnabled();
	});

	it('renders in the web app, where there is no desktop bridge', () => {
		renderWithContext(UpdateChecker);

		expect(checkButton()).toBeEnabled();
	});
});
