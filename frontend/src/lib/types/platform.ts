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

export interface SolytoWidgetsBridge {
	postMessage(message: string): void;
	onmessage: ((event: { data: unknown }) => void) | null;
}

export type NativePushPermission = 'granted' | 'denied' | 'prompt';

export interface NativePushStatus {
	enabled: boolean;
	permission: NativePushPermission;
}

export type WidgetAppMessage =
	| { type: 'ready' }
	| { type: 'setToken'; token: string; expiresAt: string; apiUrl: string }
	| { type: 'clear' }
	| { type: 'refresh' }
	| { type: 'unsupported' }
	| { type: PushRequestType; id: string };

export type PushRequestType = 'getPushStatus' | 'enablePush' | 'disablePush';

export type WidgetNativeMessage =
	| { type: 'status'; needsToken: boolean }
	| { type: 'navigate'; key: string; id?: string }
	| { type: 'open'; path: string }
	| ({ type: 'pushStatus'; id: string } & NativePushStatus);
