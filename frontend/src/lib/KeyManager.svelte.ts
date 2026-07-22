import type {
	KeyDownHandler,
	HelperKey,
	SupportedKey,
	KeyDownOptionsRequest,
	CharacterKey,
	PrimaryKey,
	FunctionKey
} from '$lib/types/keydown';
import { setContext, getContext } from 'svelte';
import { v4 as uuid } from 'uuid';

export class KeyManager {
	handlers = $state<{
		Enter: KeyDownHandler[];
		Escape: KeyDownHandler[];
		Space: KeyDownHandler[];
		e: KeyDownHandler[];
		f: KeyDownHandler[];
		s: KeyDownHandler[];
		n: KeyDownHandler[];
		F1: KeyDownHandler[];
	}>({
		Enter: [],
		Escape: [],
		Space: [],
		e: [],
		f: [],
		s: [],
		n: [],
		F1: []
	});
	helperKeyState = $state<{
		Control: boolean;
		Shift: boolean;
		Alt: boolean;
	}>({
		Control: false,
		Shift: false,
		Alt: false
	});
	primaryKeys: PrimaryKey[] = ['Enter', 'Escape', 'Space'];
	characterKeys: CharacterKey[] = ['e', 'f', 's', 'n'];
	helperKeys: HelperKey[] = ['Shift', 'Alt', 'Control'];
	functionKeys: FunctionKey[] = ['F1'];
	helperKeyTimeouts = $state<{
		Control: ReturnType<typeof setTimeout> | null;
		Shift: ReturnType<typeof setTimeout> | null;
		Alt: ReturnType<typeof setTimeout> | null;
	}>({
		Control: null,
		Shift: null,
		Alt: null
	});
	handledKeys: string[] = [
		...this.primaryKeys,
		...this.characterKeys,
		...this.helperKeys,
		...this.functionKeys
	];

	registerKeyDown(
		key: SupportedKey,
		handlerFunction: (event: KeyboardEvent) => void | Promise<void>,
		options?: KeyDownOptionsRequest
	): string {
		const handler: KeyDownHandler = {
			id: uuid(),
			key,
			handlerFunction,
			options: {
				priority: 1,
				preventDefault: true,
				preventOthers: true,
				...options
			}
		};

		if (this.isPrimaryKey(handler.key)) {
			this.handlers[handler.key as PrimaryKey].push(handler);
			this.handlers[handler.key as PrimaryKey].sort(
				(a, b) => a.options.priority - b.options.priority
			);
		} else if (this.isCharacterKey(handler.key)) {
			this.handlers[handler.key as CharacterKey].push(handler);
			this.handlers[handler.key as CharacterKey].sort(
				(a, b) => a.options.priority - b.options.priority
			);
		} else if (this.isFunctionKey(handler.key)) {
			this.handlers[handler.key as FunctionKey].push(handler);
			this.handlers[handler.key as FunctionKey].sort(
				(a, b) => a.options.priority - b.options.priority
			);
		}

		return handler.id;
	}

	unregisterKeyDowns(ids: Array<string | null>): void {
		ids.forEach((id) => {
			if (id === null) return;
			this.unregisterKeyDown(id);
		});
	}

	unregisterAll(handlers: Record<string, string | null>) {
		Object.values(handlers).forEach((id) => {
			if (id === null) return;
			this.unregisterKeyDown(id);
		});
	}

	unregisterKeyDown(id: string | null): void {
		if (id === null) return;

		for (const key of this.primaryKeys) {
			this.handlers[key as PrimaryKey] = this.handlers[key as PrimaryKey].filter(
				(h) => h.id !== id
			);
		}
		for (const key of this.characterKeys) {
			this.handlers[key as CharacterKey] = this.handlers[key as CharacterKey].filter(
				(h) => h.id !== id
			);
		}
		for (const key of this.functionKeys) {
			this.handlers[key as FunctionKey] = this.handlers[key as FunctionKey].filter(
				(h) => h.id !== id
			);
		}
	}

	normalizeKey(key: string): string {
		return key === ' ' ? 'Space' : key;
	}

	handleKeyDown(event: KeyboardEvent): void {
		const key = this.normalizeKey(event.key);
		if (!this.handledKeys.includes(key)) return;

		if (this.isPrimaryKey(key)) this.handlePrimary(event);
		else if (this.isCharacterKey(key)) this.handleCharacter(event);
		else if (this.isFunctionKey(key)) this.handleFunction(event);
		else if (this.isHelperKey(key)) this.handleHelper(event);
	}

	handleKeyUp(event: KeyboardEvent): void {
		if (!this.handledKeys.includes(event.key)) return;

		if (this.isHelperKey(event.key)) this.helperKeyState[event.key] = false;
	}

	handlePrimary(event: KeyboardEvent): void {
		for (const handler of this.handlers[this.normalizeKey(event.key) as PrimaryKey]) {
			if (this.hasUnpressedHelperKeyRestriction(handler)) continue;
			if (handler.options.preventDefault) event.preventDefault();

			handler.handlerFunction(event);

			if (handler.options.preventOthers) break;
		}
	}

	handleCharacter(event: KeyboardEvent): void {
		const handlers: KeyDownHandler[] = this.handlers[event.key as CharacterKey];

		for (const handler of handlers) {
			if (this.hasUnpressedHelperKeyRestriction(handler)) continue;
			if (handler.options.preventDefault) event.preventDefault();

			handler.handlerFunction(event);

			if (handler.options.preventOthers) break;
		}
	}

	handleFunction(event: KeyboardEvent): void {
		const handlers: KeyDownHandler[] = this.handlers[event.key as FunctionKey];

		for (const handler of handlers) {
			if (handler.options.preventDefault) event.preventDefault();

			handler.handlerFunction(event);

			if (handler.options.preventOthers) break;
		}
	}

	handleHelper(event: KeyboardEvent): void {
		const key = event.key as HelperKey;
		this.helperKeyState[key] = true;

		if (this.helperKeyTimeouts[key] !== null) {
			clearTimeout(this.helperKeyTimeouts[key]!);
		}

		this.helperKeyTimeouts[key] = setTimeout(() => {
			this.helperKeyState[key] = false;
			this.helperKeyTimeouts[key] = null;
		}, 2000);
	}

	hasUnpressedHelperKeyRestriction(handler: KeyDownHandler): boolean {
		if (handler.options.withHelperKey !== null && handler.options.withHelperKey !== undefined) {
			if (!this.helperKeyState[handler.options.withHelperKey as HelperKey]) {
				return true;
			}
		}

		return false;
	}

	isKeyEnter(key: string): boolean {
		return key === 'Enter';
	}

	isKeyEscape(key: string): boolean {
		return key === 'Escape';
	}

	isPrimaryKey(key: string): key is PrimaryKey {
		return this.primaryKeys.includes(key as PrimaryKey);
	}

	isCharacterKey(key: string): key is CharacterKey {
		return this.characterKeys.includes(key as CharacterKey);
	}

	isHelperKey(key: string): key is HelperKey {
		return this.helperKeys.includes(key as HelperKey);
	}

	isFunctionKey(key: string): key is FunctionKey {
		return this.functionKeys.includes(key as FunctionKey);
	}
}

const KEY_MANAGER_KEY = Symbol('KEY_MANAGER_KEY');

export function setKeyManager(): KeyManager {
	return setContext(KEY_MANAGER_KEY, new KeyManager());
}

export function getKeyManager(): KeyManager {
	return getContext<ReturnType<typeof setKeyManager>>(KEY_MANAGER_KEY);
}
