<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getQuickAdd } from '$lib/state/QuickAdd.svelte';

	const quickAdd = getQuickAdd();

	onMount(async () => {
		const isNative = typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();
		if (!isNative) {
			goto(resolve(urls.home));
			return;
		}

		const q = page.url.searchParams.get('q');
		if (!q) {
			goto(resolve(urls.home));
			return;
		}

		quickAdd.content = q;
		await quickAdd.detect();

		if (quickAdd.needsConfirmation) {
			quickAdd.open = true;
		}

		goto(resolve(urls.home));
	});
</script>
