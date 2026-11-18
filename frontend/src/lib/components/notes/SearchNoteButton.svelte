<script lang="ts">
	import IconSearch from '@lucide/svelte/icons/search';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { onClick }: {
		onClick: () => void;
	} = $props();

	const ts = getTranslation();
</script>

<button
	class="z-40 cursor-pointer rounded-full bg-c-btn p-[7px] text-white drop-shadow-md transition-all hover:text-c-heading hover:drop-shadow-xl"
	onclick={onClick}
	title={ts.get.notes.search_shortcut_hint}
>
	<IconSearch class="size-5" />
</button>
