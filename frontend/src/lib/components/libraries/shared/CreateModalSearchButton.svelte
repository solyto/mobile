<script lang="ts">
	import IconButton from '$lib/components/ui/buttons/IconButton.svelte';
	import IconSearch from '@lucide/svelte/icons/search';
	import type { Library } from '$lib/types/library';
	import type { Translation } from '$lib/state/Translation.svelte';

	let { library, ts } = $props<{
		library: Library;
		ts: Translation }
	>();
</script>

<IconButton type="plain" onclick={() => library.openExternalSearchModal()}>
	<IconSearch class="size-4" />
	{ts.get.libraries.search}
</IconButton>