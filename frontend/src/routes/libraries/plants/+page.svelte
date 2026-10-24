<script lang="ts">
	import Header from '$lib/components/libraries/shared/Header.svelte';
	import PlantCreate from '$lib/components/libraries/plants/PlantCreate.svelte';
	import PlantDetail from '$lib/components/libraries/plants/PlantDetail.svelte';
	import Entries from '$lib/components/libraries/shared/Entries.svelte';
	import { getPlantLibrary } from '$lib/state/PlantLibrary.svelte';

	const library = getPlantLibrary();
</script>

<div class="h-full max-h-full w-full overflow-y-auto p-4">
	<Header {library} />
	{#if library.createModalVisible}
		<PlantCreate />
	{/if}
	{#if library.detailModalVisible}
		<PlantDetail />
	{/if}
	<Entries {library} />
</div>
