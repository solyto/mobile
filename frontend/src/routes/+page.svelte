<script lang="ts">
	import { setTodos, getTodos } from '$lib/state/Todos.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { setCalendars } from '$lib/state/Calendars.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { setWeather } from '$lib/state/Weather.svelte';
	import { setCheckInData } from '$lib/state/CheckInData.svelte';
	import { setShortcuts } from '$lib/state/Shortcuts.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getNavigation } from '$lib/state/Navigation.svelte';
	import { getWelcomeTour } from '$lib/state/WelcomeTour.svelte';
	import { setTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { getQuickAdd } from '$lib/state/QuickAdd.svelte';
	import OnboardingModal from '$lib/components/dashboard/OnboardingModal.svelte';
	import YourDay from '$lib/components/dashboard/YourDay.svelte';
	import Inspiration from '$lib/components/dashboard/Inspiration.svelte';
	import QuickGlance from '$lib/components/dashboard/QuickGlance.svelte';

	setTodos();
	setCalendars();
	setWeather();
	setCheckInData();
	setShortcuts();
	setTimeTracking();

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const auth = getAuth();
	const nav = getNavigation();
	const tour = getWelcomeTour();
	const keyManager = getKeyManager();
	const quickAdd = getQuickAdd();

	let showOnboardingModal = $state<boolean>(false);
	let keyHandlers = $state<{ [key: string]: string | null }>({ Enter: null });

	onMount(async () => {
		loadingIndicator.start();
		await todos.load();
		loadingIndicator.stop();

		if (auth.user?.settings?.first_visit) {
			showOnboardingModal = true;
		}
	});

	onMount(() => {
		keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter, {
			preventOthers: false,
			preventDefault: false
		});
	});

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	function handleEnter(): void {
		const tag = document.activeElement?.tagName.toLowerCase();
		if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button') return;
		if (!quickAdd.open) quickAdd.openModal();
	}

	function handleOnboardingModalComplete(): void {
		showOnboardingModal = false;
		tour.start(nav.features);
	}
</script>

{#if showOnboardingModal}
	<OnboardingModal onComplete={handleOnboardingModalComplete} />
{/if}

<div class="h-full w-full p-8">
	<div class="flex w-full flex-col gap-6 md:flex-row md:gap-0">
		<div class="w-full md:w-3/12 md:pr-10 md:pb-8">
			<YourDay />
		</div>
		<div
			class="w-full border-t border-c-neutral-1 pt-6 md:w-5/12 md:border-x md:border-t-0 md:px-10 md:pt-0 md:pb-8 dark:border-s-dark-3"
		>
			<Inspiration />
		</div>
		<div
			class="w-full border-t border-c-neutral-1 pt-6 pb-6 md:w-4/12 md:border-t-0 md:pt-0 md:pb-8 md:pl-10 dark:border-s-dark-3"
		>
			<QuickGlance />
		</div>
	</div>
</div>
