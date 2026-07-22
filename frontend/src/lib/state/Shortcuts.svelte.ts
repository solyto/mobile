import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import type { CreateShortcutRequest, Shortcut, UpdateShortcutRequest } from '$lib/types/shortcut';
import { apiRoutes } from '$lib/config/apiRoutes';

export class Shortcuts {
	loaded = $state<boolean>(false);
	auth = getAuth();
	shortcuts = $state<Shortcut[]>([]);
	edit = $state<boolean>(false);
	apiService: ApiService;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	async load() {
		const res = await this.apiService.list(apiRoutes.shortcuts.list);
		if (res) {
			this.shortcuts = res.data as Shortcut[];
			this.loaded = true;
		}
	}

	async create(request: CreateShortcutRequest): Promise<void> {
		const res = await this.apiService.create(apiRoutes.shortcuts.create, request);
		if (res) await this.load();
		return Promise.resolve();
	}

	async update(shortcut: Shortcut, request: UpdateShortcutRequest): Promise<void> {
		const res = await this.apiService.update(apiRoutes.shortcuts.update, shortcut.id, request);
		if (res) await this.load();
		return Promise.resolve();
	}

	async delete(shortcut: Shortcut): Promise<void> {
		const res = await this.apiService.delete(apiRoutes.shortcuts.delete, shortcut.id);
		if (res) await this.load();
		return Promise.resolve();
	}

	async reorder(ids: (string | number)[]): Promise<void> {
		await this.apiService.put(apiRoutes.shortcuts.reorder, { shortcuts: ids });
		await this.load();
	}
}

const WIDGETS_KEY = Symbol('SOLYTO_WIDGETS');

export function setShortcuts(): Shortcuts {
	return setContext(WIDGETS_KEY, new Shortcuts());
}

export function getShortcuts(): Shortcuts {
	return getContext<Shortcuts>(WIDGETS_KEY);
}
