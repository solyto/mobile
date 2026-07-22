import type {
	DevRequest,
	CreateDevRequestRequest,
	UpdateDevRequestRequest,
	DevRequestVote,
	DevRequestComment
} from '$lib/types/dev_request';
import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';

export class DevRequests {
	loaded = $state<boolean>(false);
	entries = $state<DevRequest[]>([]);
	auth = getAuth();
	apiService: ApiService;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.dev.requests.list);
		if (res) {
			this.entries = res.data as DevRequest[];
			this.sort();
			await this.loadProfiles();
			this.loaded = true;
		}
	}

	async loadProfiles(): Promise<void> {
		const uniqueIds = [
			...new Set(this.entries.map((e) => e.created_by_user_id).filter((id) => id !== null))
		];

		const users = await Promise.all(uniqueIds.map((id) => this.auth.getPublicProfile(id)));
		const profileMap = new Map(uniqueIds.map((id, i) => [id, users[i]]));

		this.entries.forEach((entry) => {
			const user = entry.created_by_user_id ? profileMap.get(entry.created_by_user_id) : null;
			if (user) entry.created_by_user = { id: user.id, name: user.name };
		});
	}

	sort(): void {
		this.entries.sort((a, b) => {
			if (a.status === 'completed' && b.status !== 'completed') return 1;
			if (a.status !== 'completed' && b.status === 'completed') return -1;
			if (a.status === 'cancelled' || b.status === 'cancelled') {
				if (a.status === 'cancelled' && b.status !== 'cancelled') return 1;
				if (a.status !== 'cancelled' && b.status === 'cancelled') return -1;
			}
			return (b.priority ?? 0) - (a.priority ?? 0);
		});
	}

	async create(request: CreateDevRequestRequest): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.dev.requests.create, request);
		if (res) {
			const devRequest = res.data as DevRequest;
			await this.vote(devRequest, 'up');
			await this.load();
		}
		return Promise.resolve(res !== null);
	}

	async update(entry: DevRequest, request: UpdateDevRequestRequest): Promise<boolean> {
		const res = await this.apiService.update(apiRoutes.dev.requests.update, entry.id, request);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async vote(entry: DevRequest, vote: DevRequestVote): Promise<boolean> {
		const res = await this.apiService.post(
			apiRoutes.dev.requests.vote.replace('%d', entry.id.toString()),
			{ vote }
		);
		if (res) await this.load();
		return Promise.resolve(res !== null);
	}

	async loadComments(entry: DevRequest): Promise<DevRequestComment[]> {
		const res = await this.apiService.list(
			apiRoutes.dev.requests.listComments.replace('%d', entry.id.toString())
		);
		if (res?.data) return res.data as DevRequestComment[];
		return [];
	}

	async createComment(entry: DevRequest, content: string): Promise<boolean> {
		const res = await this.apiService.post(
			apiRoutes.dev.requests.createComment.replace('%d', entry.id.toString()),
			{ content }
		);
		return Promise.resolve(res !== null);
	}
}

const DEV_REQUESTS_KEY = Symbol('SOLYTO_DEV_REQUESTS');

export function setDevRequests(): DevRequests {
	return setContext(DEV_REQUESTS_KEY, new DevRequests());
}

export function getDevRequests(): DevRequests {
	return getContext<DevRequests>(DEV_REQUESTS_KEY);
}
