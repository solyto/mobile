<script lang="ts">
	import { setCalendars } from '$lib/state/Calendars.svelte';
	import { setTodos } from '$lib/state/Todos.svelte';

	setCalendars();
	setTodos();

	let { children } = $props();
</script>

{@render children?.()}
