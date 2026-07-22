<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getBookLibrary } from '$lib/state/BookLibrary.svelte';

	const ts = getTranslation();
	const library = getBookLibrary();

	let { toggleMenu } = $props<{
		toggleMenu: () => void;
	}>();

	function filterByLent() {
		toggleMenu();
		library.filterByLent();
	}
</script>

<button
	class="flex cursor-pointer p-1 hover:bg-c-neutral dark:hover:bg-s-dark-3"
	class:bg-c-neutral-1={library.lentFilter}
	onclick={filterByLent}
>
	{ts.get.libraries.books.filter_lent}
</button>