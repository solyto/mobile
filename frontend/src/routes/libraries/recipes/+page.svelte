<script lang="ts">
	import Entries from '$lib/components/libraries/shared/Entries.svelte';
	import RecipeCreate from '$lib/components/libraries/recipes/RecipeCreate.svelte';
	import RecipeDetail from '$lib/components/libraries/recipes/RecipeDetail.svelte';
	import Header from '$lib/components/libraries/shared/Header.svelte';
	import { getRecipeLibrary } from '$lib/state/RecipeLibrary.svelte';

	const library = getRecipeLibrary();
</script>

<div class="h-full max-h-full w-full overflow-y-auto p-4">
	<Header {library} />
	{#if library.createModalVisible}
		<RecipeCreate />
	{/if}
	{#if library.detailModalVisible}
		<RecipeDetail />
	{/if}
	<Entries {library} />
</div>
