<script lang="ts">
	import { scale, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import IconChevronLeft from '@lucide/svelte/icons/chevron-left';
	import IconChevronRight from '@lucide/svelte/icons/chevron-right';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import OnboardingModalStepWelcome from './onboarding-modal/OnboardingModalStepWelcome.svelte';
	import OnboardingModalStepLocalization from './onboarding-modal/OnboardingModalStepLocalization.svelte';
	import OnboardingModalStepFeatures from './onboarding-modal/OnboardingModalStepFeatures.svelte';
	import OnboardingModalStepReady from './onboarding-modal/OnboardingModalStepReady.svelte';
	import { getNavigation } from '$lib/state/Navigation.svelte';

	const ts = getTranslation();
	const auth = getAuth();
	const nav = getNavigation();

	let { onComplete } = $props<{ onComplete: () => void }>();

	let visible = $state(false);
	let currentStep = $state(0);
	const totalSteps = 4;

	let selectedLanguage = $state(getDefaultLanguage());
	let selectedDateFormat = $state(getDefaultDateFormat());
	let selectedTimeFormat = $state(getDefaultTimeFormat());

	function getDefaultLanguage(): string {
		if (auth.user?.settings?.language) return auth.user.settings.language;
		const browserLang = navigator.language?.split('-')[0] || 'en';
		if (['en', 'de', 'fr', 'es'].includes(browserLang)) return browserLang;
		return 'en';
	}

	function getDefaultDateFormat(): string {
		if (auth.user?.settings?.date_format) return auth.user.settings.date_format;
		const locale = navigator.language || 'en-US';
		if (locale.startsWith('en-US')) return 'YYYY-mm-dd';
		return 'dd.mm.YYYY';
	}

	function getDefaultTimeFormat(): string {
		if (auth.user?.settings?.time_format) return auth.user.settings.time_format;
		const locale = navigator.language || 'en-US';
		if (locale.startsWith('en-US') || locale.startsWith('en-GB')) return 'g:i A';
		return 'H:i';
	}

	onMount(() => {
		setTimeout(() => (visible = true), 50);
	});

	async function nextStep(): Promise<void> {
		if (currentStep === 1) {
			await auth.updateDateFormat(selectedDateFormat);
			await auth.updateTimeFormat(selectedTimeFormat);
		} else if (currentStep === 2) {
			await nav.save();
		}

		if (currentStep < totalSteps - 1) {
			currentStep++;
		} else {
			await finishTour();
		}
	}

	function prevStep(): void {
		if (currentStep > 0) currentStep--;
	}

	async function skipTour(): Promise<void> {
		await finishTour();
	}

	async function finishTour(): Promise<void> {
		await auth.completeOnboarding();
		onComplete();
	}

	let stepIndicator = $derived(
		ts.get.welcome_tour.step_of
			.replace('%d', (currentStep + 1).toString())
			.replace('%d', totalSteps.toString())
	);
</script>

{#if visible}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div
			class="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-c-bg-modal shadow-2xl sm:rounded-3xl max-md:mt-[-30px]"
			style="max-height: calc(80vh)"
			transition:scale={{ start: 0.9, duration: 300 }}
		>
			<div class="absolute top-0 right-0 left-0 h-1 bg-c-neutral-2 dark:bg-s-dark-3">
				<div
					class="h-full bg-gradient-to-r from-c-btn to-c-success transition-all duration-500"
					style="width: {((currentStep + 1) / totalSteps) * 100}%"
				></div>
			</div>

			<div class="flex-1 overflow-y-auto p-6 pt-7 sm:p-8">
				{#if currentStep === 0}
					<OnboardingModalStepWelcome />
				{:else if currentStep === 1}
					<OnboardingModalStepLocalization
						bind:selectedLanguage
						bind:selectedDateFormat
						bind:selectedTimeFormat
					/>
				{:else if currentStep === 2}
					<OnboardingModalStepFeatures />
				{:else if currentStep === 3}
					<OnboardingModalStepReady />
				{/if}
			</div>

			<div class="flex items-center justify-between px-6 pb-6 sm:px-8 sm:pb-8">
				<div class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{stepIndicator}</div>
				<div class="flex items-center gap-3">
					{#if currentStep === 0}
						<button
							class="cursor-pointer px-4 py-2 text-sm text-c-neutral-5 transition-colors hover:text-c-neutral-7 dark:text-c-neutral-4 dark:hover:text-c-neutral-2"
							onclick={skipTour}
						>
							{ts.get.welcome_tour.skip}
						</button>
					{:else}
						<button
							class="flex cursor-pointer items-center gap-1 px-4 py-2 text-sm text-c-neutral-6 transition-colors hover:text-c-neutral-9 dark:text-c-neutral-4 dark:hover:text-white"
							onclick={prevStep}
						>
							<IconChevronLeft class="size-4" />
							{ts.get.welcome_tour.back}
						</button>
					{/if}
					<button
						class="flex cursor-pointer items-center gap-1 rounded-lg bg-gradient-to-r from-c-btn to-c-success px-6 py-2 font-medium text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
						onclick={nextStep}
					>
						{currentStep === totalSteps - 1
							? ts.get.welcome_tour.finish
							: ts.get.welcome_tour.next}
						{#if currentStep < totalSteps - 1}
							<IconChevronRight class="size-4" />
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
