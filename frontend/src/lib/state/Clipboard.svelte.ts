import type { ClipboardEntry, CreateClipboardEntryRequest } from '$lib/types/clipboard';
import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class Clipboard {
	loaded = $state<boolean>(false);
	entries = $state<ClipboardEntry[]>([]);
	auth = getAuth();
	apiService: ApiService;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
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

	async createImage(file: File): Promise<boolean> {
		const formData = new FormData();
		formData.append('image', file);
		const res = await this.apiService.postFormData(apiRoutes.clipboard.createImage, formData);
		if (res) await this.load();
		return res;
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
