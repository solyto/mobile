import type { Tag } from '$lib/types/tag';

export interface LinkCategory {
	id: number;
	title: string;
	color: string | null;
}

export interface Link {
	id: string;
	title: string;
	url: string;
	cover: string | null;
	tags: Tag[];
	category: LinkCategory | null;
	is_favorite: boolean;
	created_at: string;
	updated_at: string;
}

export interface CreateLinkRequest {
	title?: string | null;
	url: string;
	cover_path?: string | null;
	is_favorite?: boolean;
	tags?: number[];
	category_id: number | null;
}

export interface UpdateLinkRequest {
	title?: string;
	url?: string;
	is_favorite?: boolean;
	tags?: number[];
	category_id?: number | null;
}

export interface CreateLinkCategoryRequest {
	title: string;
	icon?: string | null;
}

export interface UpdateLinkCategoryRequest {
	title?: string;
	icon?: string | null;
}
