import { describe, it, expect } from 'vitest';
import { looksLikeMarkdown, markdownToHtml, pastedMarkdownToHtml } from '$lib/helpers/MarkdownHelper';

describe('markdownToHtml', () => {
	it('renders a heading', () => {
		expect(markdownToHtml('# Hello')).toContain('<h1');
		expect(markdownToHtml('# Hello')).toContain('Hello');
	});

	it('renders bold text', () => {
		expect(markdownToHtml('**bold**')).toContain('<strong>bold</strong>');
	});

	it('renders inline code', () => {
		expect(markdownToHtml('`code`')).toContain('<code>code</code>');
	});

	it('renders links', () => {
		expect(markdownToHtml('[solyto](https://solyto.app)')).toContain(
			'href="https://solyto.app"'
		);
	});
});

describe('looksLikeMarkdown', () => {
	it.each(['# Heading', '- item', '* item', '1. item', '> quote', '```\ncode\n```', 'some **bold** text', 'a [link](https://solyto.app)'])(
		'recognises %j',
		(text) => {
			expect(looksLikeMarkdown(text)).toBe(true);
		}
	);

	it.each(['Meet at #office', 'file_name_v2 is ready', '5 * 3 = 15', 'Line one\nLine two'])('leaves %j as plain text', (text) => {
		expect(looksLikeMarkdown(text)).toBe(false);
	});
});

describe('pastedMarkdownToHtml', () => {
	it('turns an image into a link to it', () => {
		const html = pastedMarkdownToHtml('![logo](https://cdn.example/logo.png)');

		expect(html).toContain('<a href="https://cdn.example/logo.png">logo</a>');
		expect(html).not.toContain('<img');
	});

	it('keeps single line breaks', () => {
		expect(pastedMarkdownToHtml('# Title\nfirst\nsecond')).toContain('first<br>second');
	});
});
