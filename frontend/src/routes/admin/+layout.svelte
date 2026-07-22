<script lang="ts">
	import '../../app.css';
	import favicon from '$lib/assets/favicon.ico';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import Notifications from '$lib/components/ui/Notifications.svelte';
	import { setAuth, getAuth } from '$lib/state/Auth.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import { getKeyManager, setKeyManager } from '$lib/KeyManager.svelte';
	import { setLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { setUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { setStatistics } from '$lib/state/Statistics.svelte';
	import { setUserManagement } from '$lib/state/UserManagement.svelte';
	import { setTranslation } from '$lib/state/Translation.svelte';
	import AdminNavbar from '$lib/components/admin/AdminNavbar.svelte';

	let { children } = $props();

	setAuth();
	setLoadingIndicator();
	setUiNotifications();
	setKeyManager();
	setStatistics();
	setUserManagement();
	setTranslation();

	const auth = getAuth();
	const keyManager = getKeyManager();

	let innerHeight = $state<number>(0);

	onMount(() => {
		if (!auth.loggedIn) {
			goto(resolve(urls.login));
		}

		if (!auth.isAdmin()) {
			goto(resolve(urls.home));
		}
	});
</script>

<svelte:head>
	<title>s o l y t o</title>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<div class="flex w-screen flex-row overflow-hidden" style="height: {innerHeight}px;">
	<LoadingIndicator />
	<Notifications />
	<div class="h-full">
		<AdminNavbar />
	</div>
	<div class="h-full w-full grow overflow-auto bg-white dark:bg-s-dark">
		{@render children?.()}
	</div>
</div>
<!-- italic text-orange-500 text-green-300 c-warning bg-gradient-to-r from-c-success via-c-btn via-c-danger-hover via-c-action to-c-warning text-c-success text-c-btn-hover text-c-danger -->

<svelte:window
	bind:innerHeight
	onkeydown={(e) => keyManager.handleKeyDown(e)}
	onkeyup={(e) => keyManager.handleKeyUp(e)}
/>
