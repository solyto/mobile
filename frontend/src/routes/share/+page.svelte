<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getQuickAdd } from '$lib/state/QuickAdd.svelte';

	const quickAdd = getQuickAdd();

	onMount(async () => {
		const isNative = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
		if (!isNative) {
			goto('/');
			return;
		}

		const q = page.url.searchParams.get('q');
		if (!q) {
			goto('/');
			return;
		}

		quickAdd.content = q;
		await quickAdd.detect();

		if (quickAdd.needsConfirmation) {
			quickAdd.open = true;
		}

		goto('/');
	});
</script>
