import { tick } from 'svelte';
import { getKeyManager, type KeyManager } from '$lib/state/KeyManager.svelte';
import { getLoadingIndicator, type LoadingIndicator } from '$lib/state/LoadingIndicator.svelte';

export class InlineRename {
	editing = $state<boolean>(false);
	title = $state<string>('');
	input = $state<HTMLInputElement | null>(null);
	#keyHandlers: Record<string, string | null> = { Enter: null, Escape: null };
	#currentTitle: () => string;
	#save: (title: string) => Promise<unknown>;
	#keyManager: KeyManager;
	#loadingIndicator: LoadingIndicator;

	constructor(
		currentTitle: () => string,
		save: (title: string) => Promise<unknown>,
		keyManager: KeyManager = getKeyManager(),
		loadingIndicator: LoadingIndicator = getLoadingIndicator()
	) {
		this.#currentTitle = currentTitle;
		this.#save = save;
		this.#keyManager = keyManager;
		this.#loadingIndicator = loadingIndicator;
	}

	start = async (): Promise<void> => {
		this.destroy();
		this.editing = true;
		this.title = this.#currentTitle();
		this.#keyHandlers.Enter = this.#keyManager.registerKeyDown('Enter', this.finish, { priority: 2 });
		this.#keyHandlers.Escape = this.#keyManager.registerKeyDown('Escape', this.cancel, { priority: 2 });
		await tick();
		this.input?.focus();
	};

	finish = async (): Promise<void> => {
		if (!this.editing) return;
		this.destroy();
		this.editing = false;
		const trimmed = this.title.trim();
		if (!trimmed || trimmed === this.#currentTitle()) return;

		this.#loadingIndicator.start();
		try {
			await this.#save(trimmed);
		} finally {
			this.#loadingIndicator.stop();
		}
	};

	cancel = (): void => {
		this.destroy();
		this.editing = false;
		this.title = this.#currentTitle();
	};

	destroy(): void {
		this.#keyManager.unregisterAll(this.#keyHandlers);
	}
}
