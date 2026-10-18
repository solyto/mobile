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
	import { getLoadingIndicator, setLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager, setKeyManager } from '$lib/state/KeyManager.svelte';
	import { getUiNotifications, setUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import { setUserNotifications } from '$lib/state/UserNotifications.svelte';
	import { setCookieConsent } from '$lib/state/CookieConsent.svelte';
	import CookieBanner from '$lib/components/ui/CookieBanner.svelte';
	import { setPwaInstall } from '$lib/state/PwaInstall.svelte';
	import { setWelcomeTour } from '$lib/state/WelcomeTour.svelte';
	import WelcomeTour from '$lib/components/tour/WelcomeTour.svelte';
	import { setThemeState } from '$lib/state/Theme.svelte';
	import { getQuickAdd, setQuickAdd } from '$lib/state/QuickAdd.svelte';
	import { setIntegrations } from '$lib/state/Integrations.svelte';
	import QuickAddFab from '$lib/components/quick-add/QuickAddFab.svelte';
	import QuickAddModal from '$lib/components/quick-add/QuickAddModal.svelte';
	import TitleBar from '$lib/components/desktop/TitleBar.svelte';
	import UpdateRequiredScreen from '$lib/components/ui/UpdateRequiredScreen.svelte';
	import { setUpdateRequired } from '$lib/state/UpdateRequired.svelte';
	import { createNetworkErrorHandler } from '$lib/helpers/NetworkErrorHelper';
	import { getNavigation, setNavigation } from '$lib/state/Navigation.svelte';
	import { getPageFeature, isAuthRoute, isDashboard, isSetupRoute, showNavbar } from '$lib/helpers/NavHelper';
	import { featureConfig } from '$lib/config/features';
	import { IS_WEB, IS_DESKTOP, CLIENT_VERSION } from '$lib/config/platform';
	import { browser } from '$app/environment';
	import IconLoaderCircle from '@lucide/svelte/icons/loader-circle';

	let { children } = $props();

	setViewPoint();
	setAuth();
	setTranslation();
	setKeyManager();
	setLoadingIndicator();
	setUiNotifications();
	setUserNotifications();
	setNavigation();
	setCookieConsent();
	setPwaInstall();
	setWelcomeTour();
	setQuickAdd();
	setIntegrations();

	const theme = setThemeState();
	const updateRequired = setUpdateRequired();
	const viewPoint = getViewPoint();
	const auth = getAuth();
	const keyManager = getKeyManager();
	const ts = getTranslation();
	const notifications = getUiNotifications();
	const quickAdd = getQuickAdd();
	const nav = getNavigation();
	const loadingIndicator = getLoadingIndicator();

	const canAccessRoute = $derived(auth.loggedIn || isAuthRoute() || isSetupRoute());

	let innerHeight = $state<number>(0);

	function handleSessionExpired(): void {
		if (isAuthRoute() || isSetupRoute()) return;

		notifications.error(ts.get.auth.session_expired);

		if (featureConfig.firstStartupOptions) {
			goto(resolve(urls.setup));
		} else {
			goto(resolve(urls.login));
		}
	}

	function handleUpgradeRequired(minVersion: string | null): void {
		updateRequired.require(minVersion);
	}

	const handleUnhandledRejection = createNetworkErrorHandler(
		() => loadingIndicator.stop(),
		() => notifications.error(ts.get.layout.network_error)
	);

	auth.setSessionExpiredHandler(handleSessionExpired);
	auth.apiService.setUpgradeRequiredHandler(handleUpgradeRequired);

	onMount(async () => {
		theme.load();

		if (!canAccessRoute) {
			if (featureConfig.firstStartupOptions) {
				await goto(resolve(urls.setup));
			} else {
				await goto(resolve(urls.login));
			}
		}

		window.addEventListener('unhandledrejection', handleUnhandledRejection);

		const updateHeight = () => { innerHeight = window.innerHeight; };
		updateHeight();
		window.addEventListener('resize', updateHeight);

		ts.loadLanguage();

		if (!isSetupRoute()) checkServer();
	});

	async function checkServer(): Promise<void> {
		const serverVersion = await auth.apiService.checkServerVersion();
		if (!serverVersion) return;

		const outdatedVersion = auth.apiService.outdatedServerVersionToAnnounce(serverVersion);
		if (!outdatedVersion) return;

		notifications.add({
			type: 'warning',
			message: ts.get.update_required.server_outdated
				.replace('%server', outdatedVersion)
				.replace('%app', CLIENT_VERSION),
			timeout: 20000
		});
	}

	onDestroy(() => {
		auth.destroy();
		if (browser) window.removeEventListener('unhandledrejection', handleUnhandledRejection);
	});

	afterNavigate(() => {
		const feature = getPageFeature();
		if (feature) nav.addUsage(feature);
	});
</script>

<svelte:head>
	<title>solyto</title>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<div 
	class="flex w-screen flex-col overflow-hidden 2xl:flex-row bottom-nav:flex-col bg-c-bg page-container"
	class:pt-6={IS_DESKTOP}
	style="height: {innerHeight}px;"
>
	{#if IS_DESKTOP}
		<TitleBar />
	{/if}
	<LoadingIndicator />
	<Notifications />
	{#if updateRequired.required}
		<div class="min-h-0 w-full grow overflow-auto content-container">
			<UpdateRequiredScreen minVersion={updateRequired.minVersion} clientVersion={CLIENT_VERSION} />
		</div>
	{:else}
		{#if viewPoint.isDesktop && showNavbar() && (!browser || canAccessRoute)}
			<div class="z-[100] hidden h-full 2xl:block bottom-nav:order-last bottom-nav:h-auto">
				<DesktopNavbar />
			</div>
		{/if}
		<div class="min-h-0 w-full grow overflow-auto content-container">
			{#if !browser || canAccessRoute}
				{@render children?.()}
			{:else}
				<div class="flex h-full w-full items-center justify-center">
					<IconLoaderCircle class="size-6 animate-spin text-c-btn" />
				</div>
			{/if}
		</div>
		{#if !viewPoint.isDesktop && showNavbar() && (!browser || canAccessRoute)}
			<div class="z-[100] block h-16 w-full 2xl:hidden">
				<MobileNavbar />
			</div>
		{/if}
		<WelcomeTour />
	{/if}
	{#if IS_WEB && !isAuthRoute()}
		<CookieBanner />
	{/if}
	{#if !updateRequired.required && showNavbar() && isDashboard()}
		<QuickAddFab />
		{#if quickAdd.open}
			<QuickAddModal />
		{/if}
	{/if}
</div>

<!-- italic text-orange-500 text-green-300 c-warning bg-gradient-to-r from-c-success via-c-btn via-c-danger-hover via-c-action to-c-warning text-c-success text-c-btn-hover text-c-danger -->

<svelte:window
	bind:innerHeight
	onkeydown={(e) => keyManager.handleKeyDown(e)}
	onkeyup={(e) => keyManager.handleKeyUp(e)}
/>
