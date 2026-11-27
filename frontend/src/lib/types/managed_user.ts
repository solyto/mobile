export interface ManagedUser {
	id: string;
	name: string;
	email: string;
	role: 'user' | 'admin' | 'super_admin';
	confirmed: boolean;
	created_at: string;
	updated_at: string;
}

export interface UpdateUserRoleRequest {
	role: 'user' | 'admin' | 'super_admin';
}

export type ManagedUserPagination = {
	current_page: number;
	last_page: number;
	per_page: number;
	total: number;
	from: number | null;
	to: number | null;
	has_more_pages: boolean;
};

export type ManagedUserListMeta = {
	pagination: ManagedUserPagination;
};

export type UserGrowthGroupBy = 'year' | 'month' | 'week' | 'day';

export interface UserGrowthPoint {
	period: string;
	total: number;
}
