import type { UpdateRequiredRecords } from '$lib/types/translation';

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

export function outdatedServerMessage(serverVersion: string, appVersion: string, records: UpdateRequiredRecords): string {
	return records.server_outdated.replace('{server}', serverVersion).replace('{app}', appVersion);
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

export function isVersion(value: string): boolean {
	return /^\d+\.\d+\.\d+$/.test(value);
}
