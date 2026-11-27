export function nl2br(text: string): string {
	return text.replace(/\n/g, '<br>');
}

export function pluralize(count: number, singular: string, plural: string): string {
	return count === 1 ? singular : plural.replace('{n}', String(count));
}

export function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength).trimEnd() + '...';
}

const KILOBYTE = 1024;
const MEGABYTE = 1024 * KILOBYTE;

export function formatFileSize(bytes: number, locale: string): string {
	const inMegabytes = bytes >= MEGABYTE;
	const value = inMegabytes ? bytes / MEGABYTE : bytes / KILOBYTE;
	const unit = inMegabytes ? 'megabyte' : 'kilobyte';
	return new Intl.NumberFormat(locale, { style: 'unit', unit, maximumFractionDigits: 1 }).format(value);
}

export function getFileExtension(fileName: string): string {
	const dot = fileName.lastIndexOf('.');
	return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : '';
}
