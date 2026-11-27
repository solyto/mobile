import { describe, it, expect, vi } from 'vitest';
import { SaveAction } from '$lib/helpers/SaveAction.svelte';
import { LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
import { UiNotifications } from '$lib/state/UiNotifications.svelte';

function saveAction() {
	const loadingIndicator = new LoadingIndicator();
	const notifications = new UiNotifications();
	vi.spyOn(notifications, 'error').mockImplementation(() => {});
	return { save: new SaveAction(() => 'Could not save.', loadingIndicator, notifications), loadingIndicator, notifications };
}

describe('SaveAction', () => {
	it('shows the loading indicator while saving and no error when it works', async () => {
		const { save, loadingIndicator, notifications } = saveAction();
		let indicatorWhileSaving = false;

		const ok = await save.run(async () => {
			indicatorWhileSaving = loadingIndicator.active;
			return true;
		});

		expect(ok).toBe(true);
		expect(indicatorWhileSaving).toBe(true);
		expect(loadingIndicator.active).toBe(false);
		expect(notifications.error).not.toHaveBeenCalled();
	});

	it('shows the error message when the save fails', async () => {
		const { save, notifications } = saveAction();

		expect(await save.run(async () => false)).toBe(false);
		expect(notifications.error).toHaveBeenCalledWith('Could not save.');
	});

	it('stops the loading indicator when the save throws', async () => {
		const { save, loadingIndicator } = saveAction();

		await expect(save.run(async () => Promise.reject(new Error('offline')))).rejects.toThrow('offline');
		expect(loadingIndicator.active).toBe(false);
	});

	it('ignores a second save while the first is still running', async () => {
		const { save } = saveAction();
		let finish: (ok: boolean) => void = () => {};
		const action = vi.fn(() => new Promise<boolean>((resolve) => (finish = resolve)));

		const first = save.runIfIdle(action);
		expect(save.busy).toBe(true);
		expect(await save.runIfIdle(action)).toBe(false);

		finish(true);
		expect(await first).toBe(true);
		expect(action).toHaveBeenCalledTimes(1);
		expect(save.busy).toBe(false);
	});
});
