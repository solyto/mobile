import { describe, it, expect } from 'vitest';
import { createConfettiOptions } from '$lib/effects/confetti';

describe('createConfettiOptions', () => {
	it('merges the default effect with the given origin', () => {
		const options = createConfettiOptions({ x: 0.5, y: 0.5 }, 'default');
		expect(options.origin).toEqual({ x: 0.5, y: 0.5 });
		expect(options.particleCount).toBe(50);
		expect(options.spread).toBe(60);
		expect(options.colors).toHaveLength(3);
		expect(options.startVelocity).toBe(20);
	});

	it('uses the default effect for any effect type', () => {
		const a = createConfettiOptions({ x: 0, y: 0 }, 'default');
		const b = createConfettiOptions({ x: 1, y: 1 }, 'default');
		expect(a.shapes).toEqual(['circle']);
		expect(b.shapes).toEqual(['circle']);
	});
});
