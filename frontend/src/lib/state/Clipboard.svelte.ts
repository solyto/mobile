import type { ClipboardEntry, ClipboardUploadResult, CreateClipboardEntryRequest } from '$lib/types/clipboard';
import { getContext, setContext } from 'svelte';
import { getAuth, type Auth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import { getFileExtension } from '$lib/helpers/FormatHelper';

export class Clipboard {
	static readonly MAX_FILE_BYTES = 10 * 1024 * 1024;
	static readonly FILE_EXTENSIONS = ['pdf', 'txt', 'md', 'csv', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];

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

	async createFile(file: File): Promise<ClipboardUploadResult> {
		// Checked before uploading because rejected uploads count toward the daily quota.
		if (file.size > Clipboard.MAX_FILE_BYTES) return 'too_large';
		if (!Clipboard.FILE_EXTENSIONS.includes(getFileExtension(file.name))) return 'invalid_type';

		const formData = new FormData();
		formData.append('file', file);
		const res = await this.apiService.postWithStatus(apiRoutes.clipboard.createFile, formData);
		if (res.ok) {
			await this.load();
			return 'ok';
		}
		if (res.status === 413) return 'too_large';
		return res.status === 422 ? 'invalid_type' : 'error';
	}

	getImage(entry: ClipboardEntry): Promise<Blob | null> {
		return this.apiService.image(apiRoutes.clipboard.getImage.replace('%d', entry.id.toString()));
	}

	getFile(entry: ClipboardEntry): Promise<Blob | null> {
		const accept = entry.mime_type ?? 'application/octet-stream';
		return this.apiService.download(apiRoutes.clipboard.getFile.replace('%d', entry.id.toString()), accept);
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
