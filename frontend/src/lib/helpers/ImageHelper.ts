export function grabFaviconFromUrl(url: string): string {
	try {
		const hostname = new URL(url).hostname.replace('www.', '');
		return `https://icons.duckduckgo.com/ip3/${hostname}.ico`;
	} catch {
		return '';
	}
}
