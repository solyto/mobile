function parseHtml(html: string): HTMLElement {
	return new DOMParser().parseFromString(html, 'text/html').body;
}

export function stripHtml(html: string): string {
	return parseHtml(html).textContent ?? '';
}

export function hasMeaningfulDescription(html: string): boolean {
	const body = parseHtml(html);
	const text = body.textContent?.trim() ?? '';
	if (text === '') return false;

	const links = body.querySelectorAll('a');
	return links.length !== 1 || links[0].textContent?.trim() !== text;
}
