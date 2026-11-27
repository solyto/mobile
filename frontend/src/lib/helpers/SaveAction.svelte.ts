import { getLoadingIndicator, type LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
import { getUiNotifications, type UiNotifications } from '$lib/state/UiNotifications.svelte';

// One save from a component: the loading indicator while it runs, an error message when it fails.
export class SaveAction {
	busy = $state<boolean>(false);
	#errorMessage: () => string;
	#loadingIndicator: LoadingIndicator;
	#notifications: UiNotifications;

	constructor(
		errorMessage: () => string,
		loadingIndicator: LoadingIndicator = getLoadingIndicator(),
		notifications: UiNotifications = getUiNotifications()
	) {
		this.#errorMessage = errorMessage;
		this.#loadingIndicator = loadingIndicator;
		this.#notifications = notifications;
	}

	async run(action: () => Promise<boolean>): Promise<boolean> {
		this.#loadingIndicator.start();
		try {
			const ok = await action();
			if (!ok) this.#notifications.error(this.#errorMessage());
			return ok;
		} finally {
			this.#loadingIndicator.stop();
		}
	}

	// For a button that must not save twice: a call while one is running is ignored.
	async runIfIdle(action: () => Promise<boolean>): Promise<boolean> {
		if (this.busy) return false;
		this.busy = true;
		try {
			return await this.run(action);
		} finally {
			this.busy = false;
		}
	}
}
