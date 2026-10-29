<script lang="ts">
	import type { DevRequest } from '$lib/types/dev_request';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { entry }: { entry: DevRequest } = $props();

	const ts = getTranslation();
</script>

<span class="bg-c-neutral-1 px-2 py-1 text-xs dark:bg-c-neutral-7 dark:text-white">
	{entry.type === 'feature' ? ts.get.dev.requests.feature : ts.get.dev.requests.bug}
</span>
