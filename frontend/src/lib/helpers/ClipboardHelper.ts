import type { ClipboardEntry } from '$lib/types/clipboard';
import { getFileExtension } from '$lib/helpers/FormatHelper';

const FALLBACK_IMAGE_EXTENSION = 'png';

export function clipboardImageFileName(entry: ClipboardEntry, mimeType: string): string {
	return `clipboard-${entry.id}.${imageExtension(entry, mimeType)}`;
}

// Images have no original name; the stored path keeps the original format's extension.
function imageExtension(entry: ClipboardEntry, mimeType: string): string {
	const storedExtension = getFileExtension(entry.file_path ?? '');
	if (storedExtension) return storedExtension;

	const subtype = mimeType.split('/')[1]?.replace('jpeg', 'jpg');
	return subtype || FALLBACK_IMAGE_EXTENSION;
}
