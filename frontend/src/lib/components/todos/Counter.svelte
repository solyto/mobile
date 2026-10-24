<script lang="ts">
	import type { Todo } from '$lib/types/todo';

	let { todos }: { todos: Todo[] } = $props();
</script>

<div class="text-surface-300 ml-auto text-xs">
	{todos.length} Todos
</div>
