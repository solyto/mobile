<script lang="ts">
	import type { DevRequest } from '$lib/types/dev_request';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { entry }: { entry: DevRequest } = $props();

	const ts = getTranslation();
</script>

<span
	role="img"
	class="w-2 shrink-0 self-stretch rounded-l-lg"
	class:bg-c-success={entry.priority === 1}
	class:bg-c-btn={entry.priority === 2}
	class:bg-c-warning={entry.priority === 3}
	class:bg-c-action={entry.priority === 4}
	class:bg-c-danger={entry.priority === 5}
	aria-label={entry.priority ? ts.get.dev.requests[`priority_${entry.priority}`] : undefined}
></span>
