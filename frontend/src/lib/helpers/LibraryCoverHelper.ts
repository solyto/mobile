import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
import type { Auth } from '$lib/state/Auth.svelte';
import type { LibraryConfig } from '$lib/types/library';

export function libraryCoverUrl(library: { auth: Pick<Auth, 'user'>; config: Pick<LibraryConfig, 'type'> }, file: string): string {
	return `${API_USER_STORAGE_URL}/${library.auth.user?.id}/${library.config.type}/${file}`;
}

export function previewFilename(file: string): string {
	const dot = file.lastIndexOf('.');
	return dot === -1 ? file + '_preview' : file.slice(0, dot) + '_preview' + file.slice(dot);
}
