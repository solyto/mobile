// Compares dotted versions like 1.0.15 numerically. Returns null when either
// side is not a plain dotted version, so callers can skip the comparison.
export function compareVersions(a: string, b: string): number | null {
	const pattern = /^\d+(\.\d+)*$/;
	if (!pattern.test(a) || !pattern.test(b)) return null;

	const left = a.split('.').map(Number);
	const right = b.split('.').map(Number);

	for (let i = 0; i < Math.max(left.length, right.length); i++) {
		const diff = (left[i] ?? 0) - (right[i] ?? 0);
		if (diff !== 0) return Math.sign(diff);
	}

	return 0;
}

export function isOlderVersion(version: string, than: string): boolean {
	return compareVersions(version, than) === -1;
}

// Servers before this version reject X-Client-Version in their CORS preflight.
const MIN_SERVER_VERSION_FOR_CLIENT_HEADER = '1.1.0';

export function acceptsClientVersionHeader(serverVersion: string | null): boolean {
	if (!serverVersion) return false;

	const comparison = compareVersions(serverVersion, MIN_SERVER_VERSION_FOR_CLIENT_HEADER);
	return comparison !== null && comparison >= 0;
}
