export function lightenColor(color: string, amount = 0.7) {
	const hex = color.replace('#', '');
	const r = parseInt(hex.substr(0, 2), 16);
	const g = parseInt(hex.substr(2, 2), 16);
	const b = parseInt(hex.substr(4, 2), 16);

	const nr = Math.round(r + (255 - r) * amount);
	const ng = Math.round(g + (255 - g) * amount);
	const nb = Math.round(b + (255 - b) * amount);

	return `rgb(${nr}, ${ng}, ${nb})`;
}

/** True when an rgb hex colour is light enough that white text would lack contrast. */
export function isLightColor(color: string): boolean {
	const hex = color.trim().replace('#', '');
	const valid = hex.length === 6 || hex.length === 3;
	if (!valid || !/^[0-9a-fA-F]+$/.test(hex)) {
		// CSS variables and unknown colours get white text by default.
		return false;
	}
	const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
	const r = parseInt(full.slice(0, 2), 16);
	const g = parseInt(full.slice(2, 4), 16);
	const b = parseInt(full.slice(4, 6), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance > 0.6;
}

/** A readable text colour (light or dark) for use on a given background. */
export function getReadableTextColor(color: string): string {
	return isLightColor(color) ? 'var(--color-c-neutral-9)' : '#ffffff';
}

/** The left-border colour of a calendar event, neutral when the calendar has none. */
export function getEventBorderColor(color: string | null | undefined): string {
	return color ?? 'var(--color-c-neutral-2)';
}

/** The tinted background of a calendar event, empty when the calendar has no colour. */
export function getEventBackgroundColor(color: string | null | undefined): string {
	return color ? `color-mix(in srgb, ${color} 25%, var(--color-c-bg-elevated))` : '';
}
