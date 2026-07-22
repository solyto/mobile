<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { LibraryType } from '$lib/types/library';
	import { goto } from '$app/navigation';
	import { getLibraryNavigation, navigationItems } from '$lib/state/LibraryNavigation.svelte';

	const ts = getTranslation();
	const navigation = getLibraryNavigation();
	const setActiveLibrary = (type: LibraryType) => (navigation.activeLibrary = type);
</script>

<div class="flex w-full flex-wrap content-start items-start justify-start gap-4 p-4">
	{#each navigationItems as item (item.type)}
		<button
			class="w-44 cursor-pointer max-sm:w-full"
			onclick={() => {
				setActiveLibrary(item.type);
				goto(item.url);
			}}
		>
			<Card
				label={ts.get.libraries.navigation[item.type]}
				fixedWidth={false}
				icon={item.icon}
			/>
		</button>
	{/each}
</div>
