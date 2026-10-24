import type { Tag } from './tag';

export interface Quote {
	id: string;
	summary: string | null;
	author: string | null;
	quote: string;
	source: string | null;
	tags: Tag[];
	created_at: string;
	updated_at: string;
}

export interface CreateQuoteRequest {
	summary?: string | null;
	author?: string | null;
	quote: string;
	source?: string | null;
	tags?: number[];
}

export interface UpdateQuoteRequest {
	summary?: string | null;
	author?: string | null;
	quote?: string | null;
	source?: string | null;
	tags?: number[];
}
