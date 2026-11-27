declare module 'virtual:licenses' {
	import type { OpenSourceLicense } from '$lib/types/license';
	const licenses: OpenSourceLicense[];
	export default licenses;
}
