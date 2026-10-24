<script lang="ts">
	import NavIndicator from '$lib/components/ui/NavIndicator.svelte';
	import type { Component } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { LibraryType } from '$lib/types/library.js';

	let { type, title, url, icon: Icon, isActive, setActive }: {
		type: LibraryType;
		title: string;
		url: `/libraries/${LibraryType}`;
		icon: Component;
		isActive: boolean;
		setActive: (type: LibraryType) => void;
	} = $props();
</script>

<button
	class="relative flex w-full cursor-pointer justify-center p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
	onclick={() => {
		setActive(type);
		goto(resolve(url));
	}}
	{title}
>
	<Icon />
	<NavIndicator active={isActive} />
</button>
