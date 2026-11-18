export interface ClipboardEntry {
	id: number;
	content: string;
	type: 'text' | 'image' | 'file';
	file_path: string | null;
	file_name?: string | null;
	file_size?: number | null;
	mime_type?: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreateClipboardEntryRequest {
	content: string;
}

export type ClipboardUploadResult = 'ok' | 'too_large' | 'invalid_type' | 'error';
