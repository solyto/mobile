import { marked } from 'marked';

export function nl2br(text: string): string {
	return text.replace(/\n/g, '<br>');
}

export function markdownToHtml(text: string): string {
	return marked.parse(text, { async: false });
}
