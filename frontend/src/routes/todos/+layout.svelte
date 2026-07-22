<script lang="ts">
	import { setTodos } from '$lib/state/Todos.svelte';
	import { setTags } from '$lib/state/Tags.svelte';

	setTodos();
	setTags();

	let { children } = $props();
</script>

{@render children?.()}
