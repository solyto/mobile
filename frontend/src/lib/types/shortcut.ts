export interface Shortcut {
	id: string;
	title: string;
	url: string;
	order: number;
	created_at: string;
	updated_at: string;
}

export interface CreateShortcutRequest {
	title: string;
	url: string;
}

export interface UpdateShortcutRequest {
	title?: string;
	url?: string;
}
