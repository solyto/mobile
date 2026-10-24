import { API_FAVICON_URL } from '$lib/config/apiRoutes';

export function grabFaviconFromUrl(url: string): string {
	try {
		const hostname = new URL(url).hostname.replace(/^www\./, '');
		return `${API_FAVICON_URL}/${hostname}.ico`;
	} catch {
		return '';
	}
}

export const REDUCED_IMAGE_MAX_SIDE = 2048;
export const REDUCED_IMAGE_TYPE = 'image/jpeg';
export const REDUCED_IMAGE_QUALITY = 0.85;

const REDUCE_ABOVE_BYTES = 2 * 1024 * 1024;
const REDUCE_ABOVE_SIDE = 2560;

export function canReduceImage(type: string): boolean {
	return type === 'image/jpeg' || type === 'image/webp';
}

export function shouldReduceImage(type: string, size: number, width: number, height: number): boolean {
	if (!canReduceImage(type)) return false;
	return size > REDUCE_ABOVE_BYTES || Math.max(width, height) > REDUCE_ABOVE_SIDE;
}

export function getReducedSize(width: number, height: number): { width: number; height: number } {
	const scale = Math.min(1, REDUCED_IMAGE_MAX_SIDE / Math.max(width, height));
	return { width: Math.round(width * scale), height: Math.round(height * scale) };
}
