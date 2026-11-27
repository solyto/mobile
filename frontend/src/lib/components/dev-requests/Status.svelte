<script lang="ts">
	import type { DevRequest, DevRequestStatus } from '$lib/types/dev_request';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { devRequestStatusLabels } from '$lib/helpers/DevRequestHelper';

	let { entry }: { entry: DevRequest } = $props();

	const ts = getTranslation();

	const DOT_COLORS: Record<DevRequestStatus, string> = {
		backlog: 'bg-c-neutral-4',
		pending: 'bg-c-action',
		'in-progress': 'bg-c-btn-hover',
		'waiting-for-deployment': 'bg-c-warning',
		'waiting-for-user': 'bg-c-primary',
		completed: 'bg-c-success',
		cancelled: 'bg-c-danger'
	};

	function label(): string {
		return devRequestStatusLabels(ts.get.dev.requests)[entry.status];
	}
</script>

<span class="flex items-center gap-1.5 text-sm md:whitespace-nowrap 2xl:gap-2">
	<span class="size-2 shrink-0 rounded-full {DOT_COLORS[entry.status]}"></span>
	{label()}
</span>
