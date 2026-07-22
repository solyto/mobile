<script lang="ts">
	import type { DevRequest } from '$lib/types/dev_request';
	import { getDevRequests } from '$lib/state/DevRequests.svelte';

	let { entry, editable = true } = $props<{ entry: DevRequest; editable?: boolean }>();

	const devRequests = getDevRequests();

	async function changePriority() {
		if (!editable) return;
		const res = await devRequests.update(entry, {
			priority: entry.priority < 5 ? entry.priority + 1 : 1
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
