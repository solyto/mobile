<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLibraryNavigation, navigationItems } from '$lib/state/LibraryNavigation.svelte';
	import type { LibraryType } from '$lib/types/library.js';
	import LibraryNavigationEntry from '$lib/components/libraries/LibraryNavigationEntry.svelte';

	const ts = getTranslation();
	const navigation = getLibraryNavigation();
	const setActiveLibrary = (type: LibraryType) => (navigation.activeLibrary = type);
</script>

<div
	class="absolute z-20 hidden h-full max-h-screen w-16 flex-col items-center gap-0 overflow-y-auto bg-c-bg py-2 text-sm drop-shadow-xl transition-all lg:relative lg:flex dark:border-r-1 dark:border-s-dark-2 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
	in:fade
>
	{#each navigationItems as item (item.type)}
		<LibraryNavigationEntry
			type={item.type}
			title={ts.get.libraries.navigation[item.type]}
			url={item.url}
			icon={item.icon}
			isActive={navigation.activeLibrary === item.type}
			setActive={(type: LibraryType) => setActiveLibrary(type)}
		/>
	{/each}
</div>
