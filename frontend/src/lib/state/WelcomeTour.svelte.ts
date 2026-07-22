import { getContext, setContext } from 'svelte';
import { urls } from '$lib/config/urls';
import type { FeatureType } from '$lib/config/navigation';

export interface TourStep {
	key: string
	route: string
	selector: string | null
}

interface StepDef {
	key: string
	route: string
	always?: boolean
}

const FEATURE_STEPS: StepDef[] = [
	{ key: 'home', route: urls.home, always: true },
	{ key: 'calendar', route: urls.calendar },
	{ key: 'todos', route: urls.todos },
	{ key: 'notes', route: urls.notes },
	{ key: 'libraries', route: urls.libraries },
	{ key: 'contacts', route: urls.contacts },
	{ key: 'checkIn', route: urls.checkIn },
	{ key: 'finances', route: urls.finances },
	{ key: 'timeTracking', route: urls.timeTracking },
	{ key: 'feeds', route: urls.feeds },
	{ key: 'clipboard', route: urls.clipboard },
	{ key: 'profile', route: urls.profile, always: true },
	{ key: 'settings', route: urls.settings, always: true },
	{ key: 'dev_requests', route: urls.devRequests }
]

export class WelcomeTour {
	active = $state(false)
	currentStepIndex = $state(0)
	steps = $state<TourStep[]>([])

	start(features: Record<FeatureType, boolean>): void {
		const featureSteps: TourStep[] = FEATURE_STEPS
			.filter(s => s.always || features[s.key as FeatureType])
			.map(s => ({
				key: s.key,
				route: s.route,
				selector: `[data-tour="${s.key}"]`
			}))

		this.steps = [
			{ key: 'intro', route: urls.home, selector: null },
			...featureSteps,
			{ key: 'outro', route: urls.home, selector: null }
		]
		this.currentStepIndex = 0
		this.active = true
	}

	next(): void {
		if (this.currentStepIndex < this.steps.length - 1) {
			this.currentStepIndex++
		} else {
			this.finish()
		}
	}

	prev(): void {
		if (this.currentStepIndex > 0) this.currentStepIndex--
	}

	finish(): void {
		this.active = false
		this.currentStepIndex = 0
		this.steps = []
	}

	get currentStep(): TourStep | null {
		return this.steps[this.currentStepIndex] ?? null
	}

	get isFirst(): boolean {
		return this.currentStepIndex === 0
	}

	get isLast(): boolean {
		return this.currentStepIndex === this.steps.length - 1
	}

	get totalSteps(): number {
		return this.steps.length
	}
}

const TOUR_KEY = Symbol('SOLYTO_WELCOME_TOUR')

export function setWelcomeTour(): WelcomeTour {
	return setContext(TOUR_KEY, new WelcomeTour())
}

export function getWelcomeTour(): WelcomeTour {
	return getContext<WelcomeTour>(TOUR_KEY)
}
