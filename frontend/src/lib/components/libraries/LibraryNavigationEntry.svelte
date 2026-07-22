<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { LibraryType } from '$lib/types/library.js';

	let { type, title, url, icon, isActive, setActive } = $props<{
		type: LibraryType;
		title: string;
		url: string;
		icon: any;
		isActive: boolean;
		setActive: (type: LibraryType) => void;
	}>();
</script>

<button
	class="cursor-pointer border-r-2 p-4 transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
	class:border-c-border={!isActive}
	class:border-c-btn={isActive}
	onclick={() => {
		setActive(type);
		goto(resolve(url));
	}}
	{title}
>
	{@render icon({})}
</button>
