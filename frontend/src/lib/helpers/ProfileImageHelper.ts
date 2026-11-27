import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';

export function profileImageUrl(path: string | null): string {
	return `${API_USER_STORAGE_URL}/${path}`;
}
