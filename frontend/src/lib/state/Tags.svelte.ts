import type { CreateTagRequest, Tag, UpdateTagRequest } from '$lib/types/tag';
import { setContext, getContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class Tags {
	loaded = $state<boolean>(false);
	tags = $state<Tag[]>([]);
	auth = getAuth();
	apiService: ApiService;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.tags.list);
		if (res !== null) {
			this.loaded = true;
			this.tags = res.data as Tag[];
		}
		this.sort();
	}

	async create(name: string): Promise<Tag | null> {
		const request: CreateTagRequest = { name };
		const res = await this.apiService.create(apiRoutes.tags.create, request);
		if (res !== null) {
			await this.load();
		}
		return res ? (res.data as Tag) : null;
	}

	async delete(tagId: number): Promise<boolean> {
		const ok = await this.apiService.delete(apiRoutes.tags.delete, tagId);
		if (ok) await this.load();
		return ok;
	}

	async changeColor(tag: Tag, color: string): Promise<boolean> {
		const request: UpdateTagRequest = { color };
		const ok = await this.apiService.update(apiRoutes.tags.update, tag.id, request);
		if (ok) await this.load();
		return ok;
	}

	sort(): void {
		this.tags = [...this.tags].sort((a, b) => {
			return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
		});
	}
}

const TAGS_KEY = Symbol('SOLYTO_TAGS');

export function setTags(): Tags {
	return setContext(TAGS_KEY, new Tags());
}

export function getTags(): Tags {
	return getContext<Tags>(TAGS_KEY);
}
