<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { LibraryType } from '$lib/types/library';
	import { goto } from '$app/navigation';
	import { getLibraryNavigation, navigationItems } from '$lib/state/LibraryNavigation.svelte';

	const ts = getTranslation();
	const navigation = getLibraryNavigation();
	const setActiveLibrary = (type: LibraryType) => (navigation.activeLibrary = type);
</script>

<div class="grid w-full grid-cols-3 content-start gap-4 p-4 max-md:pb-12 md:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]">
	{#each navigationItems as item (item.type)}
		<button
			class="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md py-6 transition-colors hover:bg-c-neutral dark:hover:bg-s-dark-3"
			onclick={() => {
				setActiveLibrary(item.type);
				// eslint-disable-next-line svelte/no-navigation-without-resolve -- route from the navigation list, resolve() rejects a plain string
				goto(item.url);
			}}
		>
			<item.icon class="size-10 text-c-heading dark:text-c-primary" strokeWidth={1.5} />
			<span class="text-lg tracking-wide text-c-heading dark:text-c-primary">{ts.get.libraries.navigation[item.type]}</span>
		</button>
	{/each}
</div>
