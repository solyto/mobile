<script lang="ts">
	import { setTodos } from '$lib/state/Todos.svelte';
	import { setTags } from '$lib/state/Tags.svelte';
	import TodoEditModal from '$lib/components/todos/TodoEditModal.svelte';

	setTodos();
	setTags();

	let { children } = $props();
</script>

{@render children?.()}
<TodoEditModal />
