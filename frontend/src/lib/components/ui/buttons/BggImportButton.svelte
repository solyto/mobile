<script lang="ts">
	import Dices from '@lucide/svelte/icons/dices';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let { onClick, loading } = $props<{
		onClick: () => void;
		loading: boolean;
	}>();
</script>

<button
	class="group mt-1 mb-1 flex cursor-pointer items-center gap-3 rounded-lg border-1 border-c-neutral p-2 text-sm font-bold shadow-sm transition-all hover:ring-2 hover:ring-[#FF5100] dark:border-s-dark-3"
	class:animate-pulse={loading}
	onclick={onClick}
>
	<Dices class="size-6 text-[#FF5100]" />
	<span class="max-md:hidden">{ts.get.libraries.games.bgg_import}</span>
</button>
