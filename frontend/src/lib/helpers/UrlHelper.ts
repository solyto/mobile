const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

// Browsers drop these before parsing a URL (WHATWG URL parser), so the check must too.
// eslint-disable-next-line no-control-regex -- matching C0 controls is the point
const OUTER_CONTROL_OR_SPACE = /^[\u0000-\u0020]+|[\u0000-\u0020]+$/g;
const TAB_OR_NEWLINE = /[\t\n\r]/g;

const HOST_WITHOUT_SCHEME = /^[\p{L}\p{N}-]+(\.[\p{L}\p{N}-]+)+(:\d+)?([/?#]|$)/u;

function normalize(url: string): string {
	return url.replace(OUTER_CONTROL_OR_SPACE, '').replace(TAB_OR_NEWLINE, '');
}

function isSameOriginPath(url: string): boolean {
	// Browsers read "//host" and "/\host" as a link to another host.
	return url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');
}

function isHostWithoutScheme(url: string): boolean {
	return HOST_WITHOUT_SCHEME.test(url) && !/\s/.test(url);
}

export function safeHref(url: string | null | undefined): string | undefined {
	if (!url) return undefined;
	const normalized = normalize(url);
	if (isSameOriginPath(normalized)) return normalized;
	const candidate = isHostWithoutScheme(normalized) ? `https://${normalized}` : normalized;
	try {
		return SAFE_PROTOCOLS.has(new URL(candidate).protocol) ? candidate : undefined;
	} catch {
		return undefined;
	}
}

export function hostnameOf(url: string): string | null {
	try {
		return new URL(url).hostname || null;
	} catch {
		return null;
	}
}
