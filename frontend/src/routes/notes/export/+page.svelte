<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();
</script>

<div class="flex h-full w-full flex-col items-center justify-center">{ts.get.notes.export}</div>
