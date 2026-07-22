import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import type { Friend, FriendRequest } from '$lib/types/friend';

export class Friends {
	friendsLoaded = $state<boolean>(false);
	requestsLoaded = $state<boolean>(false);
	friends = $state<Friend[]>([]);
	sentRequests = $state<FriendRequest[]>([]);
	receivedRequests = $state<FriendRequest[]>([]);
	auth = getAuth();
	apiService: ApiService;

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	async load(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.friends.list);
		if (res) {
			this.friends = res.data as Friend[];
			this.friendsLoaded = true;
		}
	}

	async loadRequests(): Promise<void> {
		const res = await this.apiService.list(apiRoutes.friends.listRequests);
		if (res) {
			const requests = res.data as FriendRequest[];
			this.sentRequests = requests.filter((request) => request.direction === 'sent');
			this.receivedRequests = requests.filter((request) => request.direction === 'received');
			this.requestsLoaded = true;
		}
	}

	async createFriendRequest(userId: string): Promise<boolean> {
		const res = await this.apiService.create(apiRoutes.friends.createRequest, {
			receiver_id: userId
		});
		if (res) {
			await this.loadRequests();
		}
		return Promise.resolve(res !== null);
	}

	async acceptRequest(request: FriendRequest): Promise<void> {
		const res = await this.apiService.update(apiRoutes.friends.acceptRequest, request.id, {});
		if (res) {
			await this.loadRequests();
			await this.load();
		}
		return Promise.resolve();
	}

	async rejectRequest(request: FriendRequest): Promise<void> {
		const res = await this.apiService.update(apiRoutes.friends.rejectRequest, request.id, {});
		if (res) {
			await this.loadRequests();
			await this.load();
		}
		return Promise.resolve();
	}
}

const FRIENDS_KEY = Symbol('SOLYTO_FRIENDS');

export function setFriends(): Friends {
	return setContext(FRIENDS_KEY, new Friends());
}

export function getFriends(): Friends {
	return getContext<Friends>(FRIENDS_KEY);
}
