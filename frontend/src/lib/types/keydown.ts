export type KeyDownPriority = 0 | 1 | 2 | 3;
export type HelperKey = 'Control' | 'Alt' | 'Shift';
export type CharacterKey = 'e' | 'f' | 's' | 'n';
export type PrimaryKey = 'Enter' | 'Escape' | 'Space';
export type FunctionKey = 'F1';
export type SupportedKey = 'Enter' | 'Escape' | 'Space' | 'e' | 'f' | 's' | 'n' | 'F1';

export interface KeyDownOptionsRequest {
	priority?: KeyDownPriority;
	preventDefault?: boolean;
	preventOthers?: boolean;
	withHelperKey?: HelperKey;
}

export interface KeyDownOptions {
	priority: KeyDownPriority;
	preventDefault: boolean;
	preventOthers: boolean;
	withHelperKey?: HelperKey;
}

export interface KeyDownHandler {
	id: string;
	key: SupportedKey;
	handlerFunction: (event: KeyboardEvent) => void | Promise<void>;
	options: KeyDownOptions;
}
