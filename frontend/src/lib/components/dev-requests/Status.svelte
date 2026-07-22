<script lang="ts">
	import type { DevRequest, DevRequestStatus } from '$lib/types/dev_request';
	import { getDevRequests } from '$lib/state/DevRequests.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { entry, editable = true } = $props<{ entry: DevRequest; editable?: boolean }>();

	const devRequests = getDevRequests();
	const ts = getTranslation();

	async function changeStatus() {
		if (!editable) return;
		let newStatus = '';
		if (entry.status === 'backlog') newStatus = 'pending';
		if (entry.status === 'pending') newStatus = 'in-progress';
		if (entry.status === 'in-progress') newStatus = 'completed';
		if (entry.status === 'completed') newStatus = 'cancelled';
		if (entry.status === 'cancelled') newStatus = 'backlog';

		const res = await devRequests.update(entry, { status: newStatus as DevRequestStatus });
		if (res) await devRequests.load();
	}
</script>

<button
	onclick={changeStatus}
	class="w-36 rounded-full px-4 py-1 text-sm text-black md:py-2 md:text-base text-center"
	class:cursor-pointer={editable}
	class:bg-c-neutral-2={entry.status === 'backlog'}
	class:bg-c-action={entry.status === 'pending'}
	class:bg-c-success={entry.status === 'completed'}
	class:bg-c-btn-hover={entry.status === 'in-progress'}
	class:bg-c-danger={entry.status === 'cancelled'}
	aria-label="Change Status"
>
	<span class="md:hidden">
		{entry.status === 'in-progress' ? 'PROGRESS' : ts.get.dev.requests[('status_' + entry.status.replace('-', '_')) as keyof typeof ts.get.dev.requests].toUpperCase()}
	</span>
	<span class="hidden md:inline">
		{ts.get.dev.requests[('status_' + entry.status.replace('-', '_')) as keyof typeof ts.get.dev.requests].toUpperCase()}
	</span>
</button>
