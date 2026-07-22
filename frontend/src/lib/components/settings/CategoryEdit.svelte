<script lang="ts">
	import type { TodoCategory } from '$lib/types/todo';
	import { fade } from 'svelte/transition';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();

	let { category } = $props<{ category: TodoCategory }>();

	async function onDelete(category: TodoCategory): Promise<void> {
		loadingIndicator.start();
		await todos.deleteCategory(category);
		loadingIndicator.stop();
	}
</script>

<div
	class="lg:text-md flex cursor-pointer items-center gap-1 border-1 border-c-neutral-2 px-4 py-2 text-sm font-semibold dark:border-0 dark:border-s-dark-3 dark:bg-s-dark-2"
	in:fade
>
	<span>/{category.title}</span>
	<div class="ml-2">
		<DeleteButton onClick={() => onDelete(category)} inModal={false} buttonStyle="minimal" />
	</div>
</div>
