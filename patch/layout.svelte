<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.ico';
	import DesktopNavbar from '$lib/components/ui/DesktopNavbar.svelte';
	import MobileNavbar from '$lib/components/ui/MobileNavbar.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import Notifications from '$lib/components/ui/Notifications.svelte';
	import { setViewPoint, getViewPoint } from '$lib/state/Viewpoint.svelte';
	import { setAuth, getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation, setTranslation } from '$lib/state/Translation.svelte';
	import { setLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager, setKeyManager } from '$lib/KeyManager.svelte';
	import { setUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import { setUserNotifications } from '$lib/state/UserNotifications.svelte';
	import { setPwaInstall } from '$lib/state/PwaInstall.svelte';
	import { setWelcomeTour } from '$lib/state/WelcomeTour.svelte';
	import WelcomeTour from '$lib/components/tour/WelcomeTour.svelte';
	import { setThemeState } from '$lib/state/Theme.svelte';
	import { getQuickAdd, setQuickAdd } from '$lib/state/QuickAdd.svelte';
	import QuickAddFab from '$lib/components/quick-add/QuickAddFab.svelte';
	import QuickAddModal from '$lib/components/quick-add/QuickAddModal.svelte';
	import { getCommandPalette, setCommandPalette } from '$lib/state/CommandPalette.svelte';
	import CommandPaletteModal from '$lib/components/command-palette/CommandPalette.svelte';
	import { registerCommands } from '$lib/components/command-palette/Commands.svelte';
	import { getNavigation, setNavigation } from '$lib/state/Navigation.svelte';
	import { getPageFeature, isAuthRoute, isDashboard, isSetupRoute, showNavbar } from '$lib/helpers/NavHelper';
	import { featureConfig } from '$lib/config/features';

	let { children } = $props();

	setViewPoint();
	setAuth();
	setTranslation();
	setKeyManager();
	setLoadingIndicator();
	setUiNotifications();
	setUserNotifications();
	setNavigation();
	setPwaInstall();
	setWelcomeTour();
	setQuickAdd();
	setCommandPalette();

	const theme = setThemeState();
	const viewPoint = getViewPoint();
	const auth = getAuth();
	const keyManager = getKeyManager();
	const ts = getTranslation();
	const quickAdd = getQuickAdd();
	const commandPalette = getCommandPalette();
	const nav = getNavigation();

	let innerHeight = $state<number>(0);

	onMount(async () => {
		theme.load();

		if (!auth.loggedIn && !isAuthRoute() && !isSetupRoute()) {
			if (featureConfig.firstStartupOptions) {
				await goto(resolve(urls.setup));
			} else {
				await goto(resolve(urls.login));
			}
		}

		const updateHeight = () => { innerHeight = window.innerHeight; };
		updateHeight();
		window.addEventListener('resize', updateHeight);

		ts.loadLanguage();

		if (viewPoint.isDesktop && !isAuthRoute()) {
			keyManager.registerKeyDown('Space', () => commandPalette.openPalette(), { priority: 0, withHelperKey: 'Control', preventOthers: true });
		}

		await registerCommands();
	});

	afterNavigate(() => {
		const feature = getPageFeature();
		if (feature) nav.addUsage(feature);
	});
</script>

<svelte:head>
	<title>s o l y t o</title>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<div class="flex w-screen flex-col overflow-hidden 2xl:flex-row bg-c-bg page-container" style="height: {innerHeight}px;">
	<LoadingIndicator />
	<Notifications />
	{#if viewPoint.isDesktop && showNavbar()}
		<div class="z-[100] hidden h-full 2xl:block">
			<DesktopNavbar />
		</div>
	{/if}
	<div class="min-h-0 w-full grow overflow-auto content-container">
		{@render children?.()}
	</div>
	{#if !viewPoint.isDesktop && showNavbar()}
		<div class="z-[100] block h-16 w-full 2xl:hidden">
			<MobileNavbar />
		</div>
	{/if}
	<WelcomeTour />
	{#if showNavbar() && isDashboard()}
		<QuickAddFab />
		{#if quickAdd.open}
			<QuickAddModal />
		{/if}
	{/if}
	{#if commandPalette.open}
		<CommandPaletteModal />
	{/if}
</div>

<!-- italic text-orange-500 text-green-300 c-warning bg-gradient-to-r from-c-success via-c-btn via-c-danger-hover via-c-action to-c-warning text-c-success text-c-btn-hover text-c-danger -->

<svelte:window
	bind:innerHeight
	onkeydown={(e) => keyManager.handleKeyDown(e)}
	onkeyup={(e) => keyManager.handleKeyUp(e)}
/>
