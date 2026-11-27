<script lang="ts">
	import { getFinances, setFinances } from '$lib/state/Finances.svelte';
	import FinanceNavigation from '$lib/components/finances/FinanceNavigation.svelte';
	import { onMount } from 'svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTags, setTags } from '$lib/state/Tags.svelte';

	let { children } = $props();

	setFinances();
	setTags();

	const loadingIndicator = getLoadingIndicator();
	const finances = getFinances();
	const tags = getTags();

	onMount(async () => {
		loadingIndicator.start();
		try {
			await Promise.all([finances.loadIncome(), finances.loadWealth(), tags.load()]);
		} finally {
			loadingIndicator.stop();
		}
	});
</script>

<div class="flex h-full w-full flex-row">
	<FinanceNavigation />
	<div class="max-h-full w-full overflow-y-auto p-4 lg:p-8">
		{@render children?.()}
	</div>
</div>
