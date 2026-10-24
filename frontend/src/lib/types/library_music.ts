export interface MusicGenre {
	id: number;
	title: string;
	created_at: string;
	updated_at: string;
}

export interface Music {
	id: string;
	title: string;
	artist: string;
	type: string | null;
	format: string | null;
	condition: string | null;
	acquired_where: string | null;
	additional_info: string | null;
	cover: string | null;
	link: string | null;
	rating: number | null;
	publication_year: number | null;
	wishlist: boolean;
	genres: MusicGenre[];
	created_at: string;
	updated_at: string;
}

export interface CreateMusicRequest {
	title: string;
	artist: string;
	type?: string | null;
	format?: string | null;
	condition?: string | null;
	rating?: number | null;
	publication_year?: number | null;
	wishlist?: boolean;
	acquired_where?: string | null;
	additional_info?: string | null;
	cover_path?: string | null;
	link?: string | null;
	genres?: number[];
}

export interface UpdateMusicRequest {
	title?: string;
	artist?: string;
	type?: string | null;
	format?: string | null;
	condition?: string | null;
	rating?: number | null;
	publication_year?: number | null;
	wishlist?: boolean;
	acquired_where?: string | null;
	additional_info?: string | null;
	cover_path?: string | null;
	link?: string | null;
	genres?: number[];
}

export interface CreateMusicGenreRequest {
	title: string;
}

export interface UpdateMusicGenreRequest {
	title: string;
}

export interface MusicForm {
	title: string;
	artist: string;
	type: string;
	format: string;
	condition: string;
	rating: number;
	publication_year: number;
	wishlist: boolean;
	acquired_where: string;
	additional_info: string;
	cover_path: string;
	link: string;
	genres: { label: string; value: number }[];
}

export interface MusicRelease {
	id: number;
	artist: string;
	artist_id: number;
	title: string;
	url: string;
	cover: string;
	provider: string;
	release_date: string | null;
	genres: string[];
	record_type: string | null;
}

export interface MusicSearchResult {
	id: number;
	title: string;
	artist: string | null;
	cover: string | null;
	release_year: number | null;
	provider: string;
	url: string;
}
