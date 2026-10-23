import { describe, it, expect } from 'vitest';
import { getSheetDragOffset, shouldCloseSheet } from '$lib/helpers/BottomSheetHelper';

describe('getSheetDragOffset', () => {
	it('is the distance dragged downwards', () => {
		expect(getSheetDragOffset(100, 180)).toBe(80);
	});

	it('is never negative when dragged upwards', () => {
		expect(getSheetDragOffset(100, 40)).toBe(0);
	});
});

describe('shouldCloseSheet', () => {
	it('closes when dragged down a quarter of the sheet height', () => {
		expect(shouldCloseSheet(100, 400, 0)).toBe(true);
	});

	it('snaps back when dragged down less than a quarter slowly', () => {
		expect(shouldCloseSheet(99, 400, 0.1)).toBe(false);
	});

	it('closes on a fast flick over a short distance', () => {
		expect(shouldCloseSheet(30, 400, 0.8)).toBe(true);
	});

	it('snaps back on a fast but tiny movement', () => {
		expect(shouldCloseSheet(10, 400, 2)).toBe(false);
	});

	it('snaps back when the finger stopped before release', () => {
		expect(shouldCloseSheet(60, 400, 0)).toBe(false);
	});
});
