import { getContext, setContext } from 'svelte';
import { getAuth } from '$lib/state/Auth.svelte';
import ApiService from '$lib/services/ApiService';
import { apiRoutes } from '$lib/config/apiRoutes';
import type { ManagedUser, UpdateUserRoleRequest } from '$lib/types/managed_user';

export class UserManagement {
	loaded = $state<boolean>(false);
	users = $state<ManagedUser[]>([]);
	auth = getAuth();
	apiService: ApiService;
	search = $state<string>('');

	constructor() {
		this.apiService = new ApiService(this.auth.getToken());
	}

	filterUsers(): ManagedUser[] {
		if (this.search === '') return this.users;
		return this.users.filter(
			(user) =>
				user.name.toLowerCase().includes(this.search.toLowerCase()) ||
				user.email.toLowerCase().includes(this.search.toLowerCase())
		);
	}

	async load(): Promise<void> {
		const res = await this.apiService.get(apiRoutes.admin.users.list, null);
		if (res) {
			this.users = res.data as ManagedUser[];
			this.loaded = true;
		}
	}

	async updateRole(user: ManagedUser, role: UpdateUserRoleRequest['role']): Promise<boolean> {
		const res = await this.apiService.update(apiRoutes.admin.users.update, user.id, { role });
		if (res) await this.load();
		return res;
	}
}

const USER_MANAGEMENT_KEY = Symbol('SOLYTO_USER_MANAGEMENT');

export function setUserManagement(): UserManagement {
	return setContext(USER_MANAGEMENT_KEY, new UserManagement());
}

export function getUserManagement(): UserManagement {
	return getContext<UserManagement>(USER_MANAGEMENT_KEY);
}
