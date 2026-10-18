export type Platform = 'web' | 'mobile' | 'desktop';

export type UpdaterStatus =
	| { type: 'idle' }
	| { type: 'checking' }
	| { type: 'up-to-date' }
	| { type: 'available'; version: string }
	| { type: 'downloading'; percent: number }
	| { type: 'ready' }
	| { type: 'error' };

export interface ElectronAPI {
	minimize(): void;
	maximize(): void;
	close(): void;
	checkForUpdates(): Promise<void>;
	installUpdate(): void;
	onUpdaterStatus(callback: (status: UpdaterStatus) => void): () => void;
}
