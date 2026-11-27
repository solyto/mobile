import { describe, it, expect } from 'vitest';
import { HoverExplanation } from '$lib/helpers/HoverExplanation.svelte';

function mouseAt(clientX: number, clientY: number): MouseEvent {
	return { clientX, clientY } as MouseEvent;
}

describe('HoverExplanation', () => {
	it('starts hidden at the origin', () => {
		const explanation = new HoverExplanation();

		expect(explanation.visible).toBe(false);
		expect([explanation.x, explanation.y]).toEqual([0, 0]);
	});

	it('shows on mouse over and focus, hides on mouse out and blur', () => {
		const explanation = new HoverExplanation();

		explanation.handlers.onmouseover();
		expect(explanation.visible).toBe(true);
		explanation.handlers.onmouseout();
		expect(explanation.visible).toBe(false);
		explanation.handlers.onfocus();
		expect(explanation.visible).toBe(true);
		explanation.handlers.onblur();
		expect(explanation.visible).toBe(false);
	});

	it('follows the mouse', () => {
		const explanation = new HoverExplanation();

		explanation.handlers.onmousemove(mouseAt(120, 45));

		expect([explanation.x, explanation.y]).toEqual([120, 45]);
	});

	it('hides on request', () => {
		const explanation = new HoverExplanation();
		explanation.show();
		explanation.hide();

		expect(explanation.visible).toBe(false);
	});
});
