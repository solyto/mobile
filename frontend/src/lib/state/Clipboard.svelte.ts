import type { ClipboardEntry, CreateClipboardEntryRequest } from '$lib/types/clipboard';
import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class Clipboard {
	loaded = $state<boolean>(false);
	entries = $state<ClipboardEntry[]>([]);
	auth: Auth;
	apiService: ApiService;

	constructor(auth: Auth = getAuth(), apiService: ApiService = auth.apiService) {
		this.auth = auth;
		this.apiService = apiService;
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.clipboard.list);
		if (res) {
			this.entries = res.data as ClipboardEntry[];
			this.loaded = true;
		}
	}

	async create(request: CreateClipboardEntryRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.clipboard.create, request);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async createImage(file: File): Promise<'ok' | 'too_large' | 'error'> {
		const formData = new FormData();
		formData.append('image', file);
		try {
			const res = await this.apiService.postWithStatus(apiRoutes.clipboard.createImage, formData);
			if (res.ok) {
				await this.load();
				return 'ok';
			}
			return res.status === 413 ? 'too_large' : 'error';
		} catch {
			// A server aborting an oversized upload can surface as a network error.
			return 'too_large';
		}
	}

	async delete(entry: ClipboardEntry): Promise<boolean> {
		const res = await this.apiService.delete(apiRoutes.clipboard.delete, entry.id);
		if (res) await this.load();
		return res;
	}
}

const CLIPBOARD_KEY = Symbol('SOLYTO_CLIPBOARD');

export function setClipboard(): Clipboard {
	return setContext(CLIPBOARD_KEY, new Clipboard());
}

export function getClipboard(): Clipboard {
	return getContext<Clipboard>(CLIPBOARD_KEY);
}
