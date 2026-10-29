<script lang="ts">
	import type { DevRequest, DevRequestStatus } from '$lib/types/dev_request';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { entry }: { entry: DevRequest } = $props();

	const ts = getTranslation();

	const DOT_COLORS: Record<DevRequestStatus, string> = {
		backlog: 'bg-c-neutral-4',
		pending: 'bg-c-action',
		'in-progress': 'bg-c-btn-hover',
		completed: 'bg-c-success',
		cancelled: 'bg-c-danger'
	};

	function getLabel(status: DevRequestStatus): string {
		const labels: Record<DevRequestStatus, string> = {
			backlog: ts.get.dev.requests.status_backlog,
			pending: ts.get.dev.requests.status_pending,
			'in-progress': ts.get.dev.requests.status_in_progress,
			completed: ts.get.dev.requests.status_completed,
			cancelled: ts.get.dev.requests.status_cancelled
		};
		return labels[status];
	}
</script>

<span class="flex items-center gap-1.5 text-sm 2xl:gap-2">
	<span class="size-2 shrink-0 rounded-full {DOT_COLORS[entry.status]}"></span>
	{getLabel(entry.status)}
</span>
