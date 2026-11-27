<script lang="ts">
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { noTodosYet }: { noTodosYet: boolean } = $props();

	const ts = getTranslation();
</script>

{#if noTodosYet}
	<EmptyState title={ts.get.todos.no_todos_yet} description={ts.get.todos.no_todos_yet_desc} py={2} />
{:else}
	<EmptyState title={ts.get.todos.no_todos} description={ts.get.todos.no_todos_desc} py={2} />
{/if}
