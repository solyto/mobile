<script lang="ts">
	import type { DevRequest, DevRequestPriority } from '$lib/types/dev_request';
	import { getDevRequests } from '$lib/state/DevRequests.svelte';

	let { entry, editable = true }: { entry: DevRequest; editable?: boolean } = $props();

	const devRequests = getDevRequests();

	const NEXT_PRIORITY: Record<DevRequestPriority, DevRequestPriority> = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 1 };

	async function changePriority() {
		if (!editable) return;
		const res = await devRequests.update(entry, {
			priority: entry.priority === null ? 1 : NEXT_PRIORITY[entry.priority]
		});
		if (res) await devRequests.load();
	}
</script>

<button
	onclick={changePriority}
	class="size-8 shrink-0 rounded-full"
	class:cursor-pointer={editable}
	class:bg-c-neutral-2={entry.priority === 1}
	class:bg-c-btn={entry.priority === 2}
	class:bg-c-warning={entry.priority === 3}
	class:bg-c-action={entry.priority === 4}
	class:bg-c-danger={entry.priority === 5}
	aria-label="Change Priority"
></button>
