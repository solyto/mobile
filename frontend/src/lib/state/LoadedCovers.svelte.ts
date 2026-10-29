import { setContext, getContext } from 'svelte';

export class LoadedCovers {
	sources = new Set<string>();

	has(src: string): boolean {
		return this.sources.has(src);
	}

	add(src: string): void {
		this.sources.add(src);
	}
}

const LOADED_COVERS_KEY = Symbol('SOLYTO_LOADED_COVERS');

export function setLoadedCovers(): LoadedCovers {
	return setContext(LOADED_COVERS_KEY, new LoadedCovers());
}

export function getLoadedCovers(): LoadedCovers {
	return getContext<LoadedCovers>(LOADED_COVERS_KEY);
}
