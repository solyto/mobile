<script lang="ts">
	import type { Todo } from '$lib/types/todo';

	let { todos } = $props<{ todos: Todo[] }>();
</script>

<div class="text-surface-300 ml-auto text-xs">
	{todos.length} Todos
</div>
