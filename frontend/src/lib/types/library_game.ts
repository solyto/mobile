import type { Tag } from './tag';

export interface GameGenre {
	id: number;
	title: string;
	created_at: string;
	updated_at: string;
}

export interface Game {
	id: string;
	title: string;
	platform: string;
	developer: string | null;
	publisher: string | null;
	cover: string | null;
	link: string | null;
	rating: number | null;
	publication_year: number | null;
	playtime_hours: number | null;
	completed: boolean;
	wishlist: boolean;
	genres: GameGenre[];
	tags: Tag[];
	started_at: string | null;
	finished_at: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreateGameRequest {
	title: string;
	platform: string;
	developer?: string | null;
	publisher?: string | null;
	rating?: number | null;
	publication_year?: number | null;
	playtime_hours?: number | null;
	completed?: boolean;
	wishlist?: boolean;
	cover_path?: string | null;
	link?: string | null;
	started_at?: string | null;
	finished_at?: string | null;
	genres?: number[];
	tags?: number[];
}

export interface UpdateGameRequest {
	title?: string;
	platform?: string | null;
	developer?: string | null;
	publisher?: string | null;
	rating?: number | null;
	publication_year?: number | null;
	playtime_hours?: number | null;
	completed?: boolean;
	wishlist?: boolean;
	cover_path?: string | null;
	link?: string | null;
	started_at?: string | null;
	finished_at?: string | null;
	genres?: number[];
	tags?: number[];
}

export interface CreateGameGenreRequest {
	title: string;
}

export interface UpdateGameGenreRequest {
	title: string;
}

export interface GameRelease {
	id: number;
	title: string;
	url: string;
	provider: string;
	cover: string | null;
	description: string | null;
	publication_year: number | null;
	developer: string | null;
	publisher: string | null;
	genres: string[];
}

export interface GameSearchResult {
	id: number;
	title: string;
	cover: string | null;
	release_year: number | null;
	provider: string;
	url: string;
}
