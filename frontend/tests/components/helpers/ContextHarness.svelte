<script lang="ts">
	import type { AnyComponent } from './context';
	import { setAuth } from '$lib/state/Auth.svelte';
	import { setTranslation } from '$lib/state/Translation.svelte';
	import { setKeyManager } from '$lib/KeyManager.svelte';
	import { setTodos } from '$lib/state/Todos.svelte';
	import { setLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { setUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { setViewPoint } from '$lib/state/Viewpoint.svelte';
	import { setCookieConsent } from '$lib/state/CookieConsent.svelte';

	// Order matters: Translation reads getAuth() at field initialisation, and
	// Todos defaults to getAuth() in its constructor, so Auth is seeded first.
	const auth = setAuth();
	const ts = setTranslation();
	const keyManager = setKeyManager();
	const todos = setTodos();
	const loadingIndicator = setLoadingIndicator();
	const uiNotifications = setUiNotifications();
	const viewPoint = setViewPoint();
	const cookieConsent = setCookieConsent();

	let {
		component,
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

	// Apply per-test store overrides onto the freshly created instances
	const instances: Record<string, unknown> = {
		auth,
		ts,
		keyManager,
		todos,
		loadingIndicator,
		uiNotifications,
		viewPoint,
		cookieConsent
	};
	for (const [name, overrides] of Object.entries(stores)) {
		const instance = instances[name];
		if (instance) Object.assign(instance, overrides);
	}

	// Let the test pass the created instances (e.g. ts/auth) into the props
	if (prepare) {
		const prepared = prepare(instances);
		if (prepared) props = prepared;
	}

	$effect(() => {
		onReady?.(instances);
	});

	const ComponentToRender = component;
</script>

<ComponentToRender {...props} />
