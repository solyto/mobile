export interface Assistant {
	id: string;
	title: string;
	description: string | null;
	prompt: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreateAssistantRequest {
	title: string;
	description?: string | null;
	prompt?: string | null;
}

export interface UpdateAssistantRequest {
	title?: string | null;
	description?: string | null;
	prompt?: string | null;
}
