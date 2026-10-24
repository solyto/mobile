export interface ListResponse {
	data: [];
	meta?: Record<string, unknown>;
}

export interface GetResponse {
	data: object;
	meta?: Record<string, unknown>;
}

export interface CreateResponse {
	data: object;
}

export interface PostResponse {
	data: object;
}

export interface PutResponse {
	data: object;
}
