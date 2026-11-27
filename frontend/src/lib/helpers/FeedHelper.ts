export function parseKeywords(list: string | null): string[] {
	if (!list) return [];
	return list.split(',').map((keyword) => keyword.trim()).filter((keyword) => keyword !== '');
}

export function formatKeywords(keywords: string[]): string {
	return keywords.join(',');
}

export function displayHostname(url: string): string {
	try {
		return new URL(url).hostname.replace('www.', '');
	} catch {
		return url;
	}
}
