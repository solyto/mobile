<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();
</script>

<div class="w-full px-8 text-left">
	<span class="text-2xl">{ts.get.todos.no_todos}</span>
	<br /><br />
	<div class="max-md:hidden">
		{ts.get.todos.no_todos_desc}
	</div>
</div>
