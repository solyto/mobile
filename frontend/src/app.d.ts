// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { ElectronAPI } from '$lib/types/platform';

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		electronAPI?: ElectronAPI;
		Capacitor?: { isNativePlatform?: () => boolean };
	}
}

export {};
