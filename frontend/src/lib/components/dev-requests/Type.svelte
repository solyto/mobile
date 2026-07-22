<script lang="ts">
	import type { DevRequest } from '$lib/types/dev_request';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { entry } = $props<{ entry: DevRequest }>();

	const ts = getTranslation();
</script>

<button
	class="w-24 rounded-full px-4 py-1 text-sm text-white md:py-2 md:text-base text-center"
	class:bg-c-primary={entry.type === 'feature'}
	class:bg-c-danger-hover={entry.type === 'bug'}
>
	{entry.type === 'feature'
		? ts.get.dev.requests.feature.toUpperCase()
		: ts.get.dev.requests.bug.toUpperCase()}
</button>
