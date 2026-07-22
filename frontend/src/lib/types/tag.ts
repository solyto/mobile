export interface Tag {
	id: number;
	name: string;
	color: string;
	created_at: string;
	updated_at: string;
}

export interface CreateTagRequest {
	name: string;
	color?: string;
}

export interface UpdateTagRequest {
	name?: string;
	color?: string;
}
