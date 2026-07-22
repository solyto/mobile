import { tick } from 'svelte';

interface SwipeNavigateOptions {
	onLeft: () => void | Promise<void>;
	onRight: () => void | Promise<void>;
	threshold?: number;
	duration?: number;
}

export class SwipeNavigate {
	#dragX = $state(0);
	#animating = $state(false);
	#isDragging = false;
	#startX = 0;
	#target: HTMLElement | null = null;
	#onLeft: () => void | Promise<void>;
	#onRight: () => void | Promise<void>;
	#threshold: number;
	#duration: number;

	constructor({ onLeft, onRight, threshold = 60, duration = 200 }: SwipeNavigateOptions) {
		this.#onLeft = onLeft;
		this.#onRight = onRight;
		this.#threshold = threshold;
		this.#duration = duration;
	}

	readonly style = $derived.by(() =>
		this.#animating
			? `transform: translateX(${this.#dragX}px); transition: transform ${this.#duration}ms cubic-bezier(0.25, 1, 0.5, 1);`
			: `transform: translateX(${this.#dragX}px);`
	);

	setTarget(el: HTMLElement): void {
		this.#target = el;
	}

	readonly handlers = {
		onpointerdown: (e: PointerEvent) => {
			if (this.#animating) return;
			this.#isDragging = true;
			this.#startX = e.clientX;
			this.#dragX = 0;
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		},
		onpointermove: (e: PointerEvent) => {
			if (!this.#isDragging || this.#animating) return;
			this.#dragX = e.clientX - this.#startX;
		},
		onpointerup: async () => {
			if (!this.#isDragging) return;
			this.#isDragging = false;

			if (Math.abs(this.#dragX) < 5) {
				this.#dragX = 0;
				return;
			}

			const w = this.#target?.offsetWidth ?? 0;

			if (Math.abs(this.#dragX) >= this.#threshold) {
				const goLeft = this.#dragX < 0;
				this.#animating = true;

				// Animate only the remaining distance proportionally
				const remaining = w - Math.abs(this.#dragX);
				const slideOutDuration = Math.round((remaining / w) * this.#duration);
				this.#dragX = goLeft ? -w : w;
				await new Promise<void>((r) => setTimeout(r, slideOutDuration));

				if (goLeft) await this.#onLeft();
				else await this.#onRight();

				// Teleport to opposite side without transition
				this.#animating = false;
				this.#dragX = goLeft ? w : -w;
				await tick();
				if (this.#target) void this.#target.offsetWidth;

				// Slide in
				this.#animating = true;
				this.#dragX = 0;
				await new Promise<void>((r) => setTimeout(r, this.#duration));

				this.#animating = false;
			} else {
				// Snap back
				this.#animating = true;
				this.#dragX = 0;
				await new Promise<void>((r) => setTimeout(r, this.#duration));
				this.#animating = false;
			}
		},
		onpointercancel: () => {
			if (!this.#isDragging) return;
			this.#isDragging = false;
			this.#animating = true;
			this.#dragX = 0;
			setTimeout(() => {
				this.#animating = false;
			}, this.#duration);
		}
	};
}
