import { Marked, marked, type Tokens } from 'marked';

export function markdownToHtml(text: string): string {
	return marked.parse(text, { async: false });
}

// Block or inline syntax that plain prose rarely contains. "#tag" (no space) is no heading.
const MARKDOWN_SYNTAX = [
	/^#{1,6}\s+\S/m,
	/^\s*[-*+]\s+\S/m,
	/^\s*\d+[.)]\s+\S/m,
	/^>\s?\S/m,
	/^```/m,
	/\*\*[^*\n]+\*\*/,
	/\[[^\]\n]+\]\([^)\s]+\)/
];

export function looksLikeMarkdown(text: string): boolean {
	return MARKDOWN_SYNTAX.some((pattern) => pattern.test(text));
}

// Pasted images become links, so a pasted note never loads pictures from a stranger's server. Line breaks are kept,
// since pasted text is meant as written.
const pasteMarked = new Marked({
	breaks: true,
	walkTokens(token) {
		if (token.type !== 'image') return;
		const image = token as Tokens.Image;
		const label = image.text || image.href;
		Object.assign(token, { type: 'link', tokens: [{ type: 'text', raw: label, text: label }] });
	}
});

export function pastedMarkdownToHtml(text: string): string {
	return pasteMarked.parse(text, { async: false });
}
