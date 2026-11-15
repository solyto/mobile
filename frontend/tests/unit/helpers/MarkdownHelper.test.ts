import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '$lib/helpers/MarkdownHelper';

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
