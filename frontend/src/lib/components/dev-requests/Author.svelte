<script lang="ts">
	import type { DevRequest } from '$lib/types/dev_request';

	let { entry }: { entry: DevRequest } = $props();
</script>

{#if entry.created_by_user}
	<span class="text-sm">{entry.created_by_user.name}</span>
{/if}
