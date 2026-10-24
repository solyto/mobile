import { marked } from 'marked';

export function nl2br(text: string): string {
	return text.replace(/\n/g, '<br>');
}

export function markdownToHtml(text: string): string {
	return marked.parse(text, { async: false });
}

export function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength).trimEnd() + '...';
}

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
