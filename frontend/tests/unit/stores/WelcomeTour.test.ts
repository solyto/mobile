import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WelcomeTour } from '$lib/state/WelcomeTour.svelte';
import { resetStoreMocks } from '../setup/storeMocks';
import type { FeatureType } from '$lib/config/navigation';

function allFeatures(enabled: boolean): Record<FeatureType, boolean> {
	return {
		calendar: enabled,
		todos: enabled,
		notes: enabled,
		libraries: enabled,
		contacts: enabled,
		checkIn: enabled,
		finances: enabled,
		feeds: enabled,
		clipboard: enabled,
		dev_requests: enabled,
		timeTracking: enabled
	};
}

beforeEach(() => {
	resetStoreMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('WelcomeTour store', () => {
	it('starts with an intro, the enabled feature steps and an outro', () => {
		const s = new WelcomeTour();
		s.start(allFeatures(true));

		expect(s.active).toBe(true);
		expect(s.totalSteps).toBe(16); // intro + 14 steps + outro
		expect(s.currentStep?.key).toBe('intro');
		expect(s.currentStep?.selector).toBeNull();
		expect(s.steps[s.totalSteps - 1].key).toBe('outro');
	});

	it('only includes enabled features plus the always-visible steps', () => {
		const s = new WelcomeTour();
		s.start(allFeatures(false));

		expect(s.steps.map((step) => step.key)).toEqual([
			'intro',
			'home',
			'profile',
			'settings',
			'outro'
		]);
	});

	it('builds selectors from the step key', () => {
		const s = new WelcomeTour();
		s.start(allFeatures(true));
		const todos = s.steps.find((step) => step.key === 'todos');
		expect(todos?.selector).toBe('[data-tour="todos"]');
		expect(todos?.route).toBe('/todos');
	});

	describe('navigation', () => {
		it('next advances through the steps', () => {
			const s = new WelcomeTour();
			s.start(allFeatures(true));
			s.next();
			expect(s.currentStep?.key).toBe('home');
			expect(s.isFirst).toBe(false);
		});

		it('next finishes on the last step', () => {
			const s = new WelcomeTour();
			s.start(allFeatures(false));
			s.currentStepIndex = s.totalSteps - 1;
			s.next();
			expect(s.active).toBe(false);
			expect(s.steps).toEqual([]);
		});

		it('prev goes back but never before the first step', () => {
			const s = new WelcomeTour();
			s.start(allFeatures(false));
			s.currentStepIndex = 2;
			s.prev();
			expect(s.currentStepIndex).toBe(1);
			s.prev();
			expect(s.currentStepIndex).toBe(0);
			s.prev();
			expect(s.currentStepIndex).toBe(0);
		});

		it('isLast is true on the outro', () => {
			const s = new WelcomeTour();
			s.start(allFeatures(false));
			s.currentStepIndex = s.totalSteps - 1;
			expect(s.isLast).toBe(true);
		});

		it('finish resets the tour', () => {
			const s = new WelcomeTour();
			s.start(allFeatures(true));
			s.finish();
			expect(s.active).toBe(false);
			expect(s.currentStepIndex).toBe(0);
			expect(s.steps).toEqual([]);
		});
	});
});
