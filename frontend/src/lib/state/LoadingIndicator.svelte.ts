import { setContext, getContext } from 'svelte';

export class LoadingIndicator {
	active = $state<boolean>(false);
	progress = $state<number | null>(null);

	start(): void {
		this.active = true;
	}

	stop(): void {
		this.active = false;
	}

	setProgress(progress: number): void {
		this.progress = progress;
	}
}

const LOADING_KEY = Symbol('SOLYTO_LOADING');

export function setLoadingIndicator(): LoadingIndicator {
	return setContext(LOADING_KEY, new LoadingIndicator());
}

export function getLoadingIndicator(): LoadingIndicator {
	return getContext<LoadingIndicator>(LOADING_KEY);
}
