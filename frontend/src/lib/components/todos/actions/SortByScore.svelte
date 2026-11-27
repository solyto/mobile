<script lang="ts">
	import { getTodos } from '$lib/state/Todos.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();
	const todos = getTodos();

	let toggled = $state<boolean>(todos.sortByScore);

	function toggleSortByScore(value: boolean): void {
		todos.toggleSortByScore();
	}
</script>

<Toggle label={ts.get.todos.sort_by_score} bind:checked={toggled} onchange={toggleSortByScore} />
