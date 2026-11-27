<script lang="ts">
	import type { Todo } from '$lib/types/todo';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { todos }: { todos: Todo[] } = $props();

	const ts = getTranslation();
</script>

<div class="text-surface-300 ml-auto text-xs">
	{ts.get.todos.todo_count.replace('{n}', String(todos.length))}
</div>
