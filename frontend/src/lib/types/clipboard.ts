export interface ClipboardEntry {
	id: number;
	content: string;
	type: 'text' | 'image';
	file_path: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreateClipboardEntryRequest {
	content: string;
}
