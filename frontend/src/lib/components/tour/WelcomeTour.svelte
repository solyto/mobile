<script lang="ts">
	import { getWelcomeTour, type TourStep } from '$lib/state/WelcomeTour.svelte'
	import { getTranslation } from '$lib/state/Translation.svelte'
	import { getViewPoint } from '$lib/state/Viewpoint.svelte'
	import { goto } from '$app/navigation'
	import { tick, untrack } from 'svelte'
	import { page } from '$app/state'
	import { scale } from 'svelte/transition'
	import IconChevronLeft from '@lucide/svelte/icons/chevron-left'
	import IconChevronRight from '@lucide/svelte/icons/chevron-right'
	import IconX from '@lucide/svelte/icons/x'
	import IconCheck from '@lucide/svelte/icons/check'

	const tour = getWelcomeTour()
	const ts = getTranslation()
	const viewPoint = getViewPoint()

	const PADDING = 8

	let targetRect = $state<DOMRect | null>(null)
	let transitioning = $state(false)

	$effect(() => {
		if (!tour.active) return
		const step = tour.currentStep
		untrack(() => void handleStep(step))
	})

	async function handleStep(step: TourStep | null): Promise<void> {
		if (!step || transitioning) return
		transitioning = true
		targetRect = null

		if (page.url.pathname !== step.route) {
			await goto(step.route)
		}

		await tick()
		await new Promise<void>((r) => requestAnimationFrame(() => r()))

		if (step.selector) {
			const el = document.querySelector(step.selector)
			targetRect = el ? el.getBoundingClientRect() : null
		} else {
			targetRect = null
		}

		transitioning = false
	}

	interface StepContent {
		title: string
		description: string
		tips: string[]
	}

	function getStepContent(step: TourStep | null): StepContent | null {
		if (!step) return null
		if (step.key === 'intro') {
			return {
				title: ts.get.welcome_tour.tour_intro_title,
				description: ts.get.welcome_tour.tour_intro_description,
				tips: []
			}
		}
		if (step.key === 'outro') {
			return {
				title: ts.get.welcome_tour.tour_outro_title,
				description: ts.get.welcome_tour.tour_outro_description,
				tips: []
			}
		}
		const section = ts.get.welcome_tour.steps[step.key]
		if (!section) return null
		const tips = Object.entries(section)
			.filter(([key]) => key.endsWith('_tip'))
			.map(([, value]) => value)
		return { title: section.title, description: section.description, tips }
	}

	let content = $derived(getStepContent(tour.currentStep))

	let spotlightStyle = $derived.by(() => {
		if (!targetRect) return ''
		return [
			`left:${targetRect.left - PADDING}px`,
			`top:${targetRect.top - PADDING}px`,
			`width:${targetRect.width + PADDING * 2}px`,
			`height:${targetRect.height + PADDING * 2}px`
		].join(';')
	})

	let tooltipStyle = $derived.by(() => {
		if (!targetRect) {
			return 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%)'
		}
		if (viewPoint.isDesktop) {
			const left = targetRect.right + PADDING + 16
			const vh = typeof window !== 'undefined' ? window.innerHeight : 800
			const tooltipHeight = 360
			const idealTop = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
			const top = Math.min(Math.max(idealTop, 8), vh - tooltipHeight - 8)
			return `position:fixed;left:${left}px;top:${top}px`
		}
		const top = targetRect.top - 16
		return `position:fixed;left:50%;top:${top}px;transform:translate(-50%,-100%)`
	})

	let stepLabel = $derived(
		ts.get.welcome_tour.step_of
			.replace('%d', (tour.currentStepIndex + 1).toString())
			.replace('%d', tour.totalSteps.toString())
	)
</script>

{#if tour.active}
	<!-- Click blocker — always present to prevent page interaction -->
	<div class="fixed inset-0 z-[200]"></div>

	{#if targetRect}
		<!-- Spotlight: box-shadow creates darkness outside the highlighted element -->
		<div
			class="pointer-events-none fixed z-[201] rounded-xl"
			style="{spotlightStyle};box-shadow:0 0 0 9999px rgba(0,0,0,0.65)"
		></div>
	{:else}
		<!-- Full dark backdrop: shown during transitions and for centered steps -->
		<div class="fixed inset-0 z-[201] bg-black/65"></div>
	{/if}

	{#if !transitioning && content}
		<div
			class="z-[202] w-80 overflow-hidden rounded-2xl bg-c-bg-modal shadow-2xl max-md:w-[88vw]"
			style={tooltipStyle}
			transition:scale={{ start: 0.95, duration: 200 }}
		>
			<div class="flex items-start justify-between p-5 pb-3">
				<div class="flex-1">
					<p class="mb-0.5 text-xs text-c-neutral-4 dark:text-c-neutral-5">{stepLabel}</p>
					<h3 class="text-base font-bold text-c-neutral-9 dark:text-white">{content.title}</h3>
				</div>
				<button
					class="ml-2 shrink-0 cursor-pointer rounded-lg p-1 text-c-neutral-4 transition-colors hover:bg-c-neutral-1 hover:text-c-neutral-6 dark:hover:bg-s-dark-3 dark:hover:text-c-neutral-3"
					onclick={() => tour.finish()}
				>
					<IconX class="size-4" />
				</button>
			</div>

			<p class="px-5 pb-3 text-sm leading-relaxed text-c-neutral-6 dark:text-c-neutral-4">
				{content.description}
			</p>

			{#if content.tips.length > 0}
				<ul class="mx-5 mb-4 space-y-1.5 border-t border-c-neutral-1 pt-3 dark:border-s-dark-3">
					{#each content.tips as tip}
						<li class="flex items-start gap-2 text-xs text-c-neutral-5 dark:text-c-neutral-4">
							<IconCheck class="mt-0.5 size-3.5 shrink-0 text-c-primary" />
							{tip}
						</li>
					{/each}
				</ul>
			{/if}

			<div
				class="flex items-center justify-between border-t border-c-neutral-1 px-5 py-3 dark:border-s-dark-3"
			>
				<button
					class="cursor-pointer text-xs text-c-neutral-4 transition-colors hover:text-c-neutral-6 dark:hover:text-c-neutral-3"
					onclick={() => tour.finish()}
				>
					{ts.get.welcome_tour.skip}
				</button>
				<div class="flex items-center gap-2">
					{#if !tour.isFirst}
						<button
							class="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-c-neutral-6 transition-colors hover:bg-c-neutral-1 dark:text-c-neutral-4 dark:hover:bg-s-dark-3"
							onclick={() => tour.prev()}
						>
							<IconChevronLeft class="size-3.5" />
							{ts.get.welcome_tour.back}
						</button>
					{/if}
					<button
						class="flex cursor-pointer items-center gap-1 rounded-lg bg-c-btn px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-c-btn/80"
						onclick={() => tour.next()}
					>
						{tour.isLast ? ts.get.welcome_tour.finish : ts.get.welcome_tour.next}
						{#if !tour.isLast}
							<IconChevronRight class="size-3.5" />
						{/if}
					</button>
				</div>
			</div>
		</div>
	{/if}
{/if}
