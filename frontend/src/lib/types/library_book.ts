import type { Tag } from './tag';

export interface BookGenre {
	id: number;
	title: string;
	created_at: string;
	updated_at: string;
}

export interface Book {
	id: string;
	title: string;
	author: string;
	series: string | null;
	volume: number | null;
	pages: number | null;
	current_page: number | null;
	lent_to: string | null;
	is_where: string | null;
	cover: string | null;
	link: string | null;
	rating: number | null;
	publication_year: number | null;
	wishlist: boolean;
	summary: string | null;
	genres: BookGenre[];
	tags: Tag[];
	started_at: string | null;
	finished_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreateBookRequest {
	title: string;
	author: string;
	series?: string | null;
	volume?: number | null;
	pages?: number | null;
	current_page?: number | null;
	lent_to?: string | null;
	is_where?: string | null;
	rating?: number | null;
	publication_year?: number | null;
	wishlist?: boolean;
	summary?: string | null;
	cover_path?: string | null;
	link?: string | null;
	started_at?: string | null;
	finished_at?: string | null;
	genres?: number[];
	tags?: number[];
}

export interface UpdateBookRequest {
	title?: string;
	author?: string;
	series?: string | null;
	volume?: number | null;
	pages?: number | null;
	current_page?: number | null;
	lent_to?: string | null;
	is_where?: string | null;
	rating?: number | null;
	publication_year?: number | null;
	wishlist?: boolean;
	summary?: string | null;
	cover_path?: string | null;
	link?: string | null;
	started_at?: string | null;
	finished_at?: string | null;
	genres?: number[];
	tags?: number[];
}

export interface CreateBookGenreRequest {
	title: string;
}

export interface UpdateBookGenreRequest {
	title: string;
}

export interface BookRelease {
	id: number | null;
	author: string;
	author_id: number | null;
	title: string;
	description: string | null;
	page_count: number | null;
	url: string;
	cover: string | null;
	provider: string;
	release_date: string | null;
}

export interface BookSearchResult {
	id: number;
	title: string;
	author: string | null;
	cover: string | null;
	release_year: number | null;
	provider: string;
	url: string;
}