<script lang="ts">
	import type { AnyComponent } from './context';
	import { setAuth } from '$lib/state/Auth.svelte';
	import { setTranslation } from '$lib/state/Translation.svelte';
	import { setKeyManager } from '$lib/state/KeyManager.svelte';
	import { setTodos } from '$lib/state/Todos.svelte';
	import { setLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { setUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { setViewPoint } from '$lib/state/Viewpoint.svelte';
	import { setCookieConsent } from '$lib/state/CookieConsent.svelte';
	import { setDevRequests } from '$lib/state/DevRequests.svelte';
	import { setLoadedCovers } from '$lib/state/LoadedCovers.svelte';

	// Translation and Todos default to getAuth() in their constructors, so Auth is seeded first.
	const auth = setAuth();
	const ts = setTranslation();
	const keyManager = setKeyManager();
	const todos = setTodos();
	const loadingIndicator = setLoadingIndicator();
	const uiNotifications = setUiNotifications();
	const viewPoint = setViewPoint();
	const cookieConsent = setCookieConsent();
	const devRequests = setDevRequests();
	const loadedCovers = setLoadedCovers();

	let {
		component: ComponentToRender,
		props = {},
		stores = {},
		onReady,
		prepare
	}: {
		component: AnyComponent;
		props?: Record<string, unknown>;
		stores?: Record<string, Record<string, unknown>>;
		onReady?: (stores: Record<string, unknown>) => void;
		prepare?: (stores: Record<string, unknown>) => Record<string, unknown>;
	} = $props();

	const instances: Record<string, unknown> = {
		auth,
		ts,
		keyManager,
		todos,
		loadingIndicator,
		uiNotifications,
		viewPoint,
		cookieConsent,
		devRequests,
		loadedCovers
	};
	function setUp(): void {
		for (const [name, overrides] of Object.entries(stores)) {
			const instance = instances[name];
			if (instance) Object.assign(instance, overrides);
		}

		if (prepare) {
			const prepared = prepare(instances);
			if (prepared) props = prepared;
		}
	}

	setUp();

	$effect(() => {
		onReady?.(instances);
	});
</script>

<ComponentToRender {...props} />
