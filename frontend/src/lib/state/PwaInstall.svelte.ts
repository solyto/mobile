import { getContext, setContext } from 'svelte';

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWA_KEY = Symbol('SOLYTO_PWA');

export class PwaInstall {
	deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
	installed = $state<boolean>(false);

	constructor() {
		if (typeof window !== 'undefined') {
			this.installed =
				window.matchMedia('(display-mode: standalone)').matches ||
				(navigator as Navigator & { standalone?: boolean }).standalone === true;

			const w = window as Window & { __pwaPrompt?: BeforeInstallPromptEvent | null };
			if (w.__pwaPrompt) {
				this.deferredPrompt = w.__pwaPrompt;
				w.__pwaPrompt = null;
			}

			window.addEventListener('beforeinstallprompt', (e) => this.captureEvent(e));
		}
	}

	get isIos(): boolean {
		if (typeof navigator === 'undefined') return false;
		return /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
	}

	get canInstall(): boolean {
		return !!this.deferredPrompt;
	}

	captureEvent(event: Event): void {
		event.preventDefault();
		this.deferredPrompt = event as BeforeInstallPromptEvent;
	}

	async install(): Promise<void> {
		if (!this.deferredPrompt) return;
		await this.deferredPrompt.prompt();
		const result = await this.deferredPrompt.userChoice;
		if (result.outcome === 'accepted') {
			this.installed = true;
		}
		this.deferredPrompt = null;
	}
}

export function setPwaInstall(): PwaInstall {
	return setContext(PWA_KEY, new PwaInstall());
}

export function getPwaInstall(): PwaInstall {
	return getContext<PwaInstall>(PWA_KEY);
}
