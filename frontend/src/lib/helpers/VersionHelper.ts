import type { VersionParts } from '$lib/types/version';

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

export type FixedInState = 'web' | 'included' | 'pending' | 'unknown';

export function fixedInState(isWeb: boolean, clientVersion: string, fixedInVersion: string): FixedInState {
	if (isWeb) return 'web';

	const comparison = compareVersions(clientVersion, fixedInVersion);
	if (comparison === null) return 'unknown';

	return comparison >= 0 ? 'included' : 'pending';
}

export function parseVersion(version: string | null): VersionParts {
	const [major, minor, patch] = (version ?? '').split('.').map((part) => (/^\d+$/.test(part) ? Number(part) : null));
	return { major: major ?? null, minor: minor ?? null, patch: patch ?? null };
}

export function buildVersion(parts: VersionParts): string | null {
	const values = [parts.major, parts.minor, parts.patch];
	if (values.every((value) => value === null)) return null;

	return values.map((value) => Math.max(0, Math.trunc(value ?? 0))).join('.');
}
