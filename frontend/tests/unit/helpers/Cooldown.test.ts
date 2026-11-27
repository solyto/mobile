import { describe, it, expect, vi, afterEach } from 'vitest';
import { Cooldown } from '$lib/helpers/Cooldown.svelte';

afterEach(() => {
	vi.useRealTimers();
});

describe('Cooldown', () => {
	it('is inactive until started', () => {
		const cooldown = new Cooldown(60);
		expect(cooldown.remaining).toBe(0);
		expect(cooldown.active).toBe(false);
	});

	it('counts down one per second and ends at zero', () => {
		vi.useFakeTimers();
		const cooldown = new Cooldown(3);
		cooldown.start();
		expect(cooldown.remaining).toBe(3);

		vi.advanceTimersByTime(1000);
		expect(cooldown.remaining).toBe(2);

		vi.advanceTimersByTime(2000);
		expect(cooldown.remaining).toBe(0);
		expect(cooldown.active).toBe(false);
		expect(vi.getTimerCount()).toBe(0);
	});

	it('stops counting once destroyed', () => {
		vi.useFakeTimers();
		const cooldown = new Cooldown(3);
		cooldown.start();
		cooldown.destroy();

		vi.advanceTimersByTime(3000);
		expect(cooldown.remaining).toBe(3);
		expect(vi.getTimerCount()).toBe(0);
	});
});
