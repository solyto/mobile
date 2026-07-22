<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import GoodreadsIcon from '$lib/assets/services/goodreads_icon.png';

	const ts = getTranslation();

	let { onClick, loading } = $props<{
		onClick: () => void;
		loading: boolean;
	}>();
</script>

<button
	class="group mt-2 mb-2 flex cursor-pointer items-center gap-3 rounded-lg border-1 border-c-neutral p-2 text-sm font-bold shadow-sm transition-all hover:ring-2 hover:ring-[#b9ad99] dark:border-s-dark-3"
	class:animate-pulse={loading}
	onclick={onClick}
>
	<img src={GoodreadsIcon} class="size-6" alt="Goodreads icon" />
	<span class="max-md:hidden">{ts.get.libraries.books.goodreads_import}</span>
</button>
