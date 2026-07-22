import type { Tag } from './tag';

export interface Note {
	id: string;
	title: string;
	content: string;
	category_id: number | null;
	tags: Tag[];
	is_favorite: boolean;
	created_at: string;
	updated_at: string;
}

export interface CreateNoteRequest {
	title: string;
	category_id?: number | null;
	tags?: number[];
}

export interface UpdateNoteRequest {
	title?: string;
	content?: string;
	category_id?: number | null;
	tags?: number[];
	is_favorite?: boolean;
}

export interface NoteCategory {
	id: number;
	title: string;
	parent_id: number | null;
	sort_order: number;
	created_at: string;
	updated_at: string;
	children: NoteCategory[];
}

export interface CreateNoteCategoryRequest {
	title: string;
	parent_id?: number | null;
}

export interface UpdateNoteCategoryRequest {
	title?: string;
	parent_id?: number | null;
}
