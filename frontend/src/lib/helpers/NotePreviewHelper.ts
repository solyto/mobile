export function notePreview(content: string): string {
	return content
		.replace(/<[^>]*>/g, ' ')
		.replace(/#{1,6}\s+/g, '')
		.replace(/(\*\*|__)(.*?)\1/g, '$2')
		.replace(/(\*|_)(.*?)\1/g, '$2')
		.replace(/`{1,3}[^`]*`{1,3}/g, '')
		.replace(/^\s*[-*+]\s+/gm, '')
		.replace(/^\s*\d+\.\s+/gm, '')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/[>~]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}
