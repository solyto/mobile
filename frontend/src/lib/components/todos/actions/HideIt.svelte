<script lang="ts">
	import { getTodos } from '$lib/state/Todos.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();
	const todos = getTodos();

	let toggled = $derived<boolean>(todos.hideItActive);

	function toggleHideIt() {
		todos.toggleHideIt();
	}
</script>

<Toggle
	label={ts.get.todos.workspace_hide_it}
	bind:checked={toggled}
	onchange={() => toggleHideIt()}
/>
