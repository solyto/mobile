const TICK_MS = 1000;

export class Cooldown {
	remaining = $state<number>(0);
	#seconds: number;
	#timer: ReturnType<typeof setInterval> | null = null;

	constructor(seconds: number) {
		this.#seconds = seconds;
	}

	get active(): boolean {
		return this.remaining > 0;
	}

	start(): void {
		this.destroy();
		this.remaining = this.#seconds;
		this.#timer = setInterval(() => {
			this.remaining--;
			if (this.remaining <= 0) this.destroy();
		}, TICK_MS);
	}

	destroy(): void {
		if (this.#timer) clearInterval(this.#timer);
		this.#timer = null;
	}
}
