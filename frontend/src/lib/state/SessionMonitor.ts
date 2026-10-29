import { browser } from '$app/environment';

const SESSION_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export class SessionMonitor {
	private check: () => void;
	private interval: ReturnType<typeof setInterval> | null = null;
	private cleanup: (() => void)[] = [];

	constructor(check: () => void) {
		this.check = check;

		if (browser) {
			this.initialize();
		}
	}

	private initialize(): void {
		const visibilityHandler = () => {
			if (document.hidden) {
				this.stopInterval();
			} else {
				this.check();
				this.startInterval();
			}
		};
		document.addEventListener('visibilitychange', visibilityHandler);
		this.cleanup.push(() => document.removeEventListener('visibilitychange', visibilityHandler));

		const onlineHandler = () => this.check();
		window.addEventListener('online', onlineHandler);
		this.cleanup.push(() => window.removeEventListener('online', onlineHandler));

		this.cleanup.push(() => this.stopInterval());

		if (!document.hidden) this.startInterval();
	}

	private startInterval(): void {
		this.stopInterval();
		this.interval = setInterval(() => this.check(), SESSION_CHECK_INTERVAL_MS);
	}

	private stopInterval(): void {
		if (this.interval !== null) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}

	destroy(): void {
		this.cleanup.forEach((fn) => fn());
		this.cleanup = [];
	}
}
