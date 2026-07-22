<script lang="ts">
	import { setTags } from '$lib/state/Tags.svelte';
	import { setTodos } from '$lib/state/Todos.svelte';

	setTags();
	setTodos();

	let { children } = $props();
</script>

{@render children?.()}
