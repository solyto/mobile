import type { Options } from 'canvas-confetti';

type ConfettiEffectTypes = 'default';

interface ConfettiPosition {
	x: number;
	y: number;
}

const defaultEffect: Omit<Options, 'origin'> = {
	particleCount: 50,
	spread: 60,
	colors: ['#26a69a', '#00897b', '#00796b'],
	startVelocity: 20,
	scalar: 0.75,
	shapes: ['circle']
};

function getEffectOptions(effect: ConfettiEffectTypes): Omit<Options, 'origin'> {
	switch (effect) {
		case 'default':
			return defaultEffect;
		default:
			return defaultEffect;
	}
}

export function createConfettiOptions(
	position: ConfettiPosition,
	effect: ConfettiEffectTypes
): Options {
	return {
		...getEffectOptions(effect),
		origin: position
	};
}
