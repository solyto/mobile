<script lang="ts">
	import { fade } from 'svelte/transition';

	let {
		sections,
		selected,
		onselect
	} = $props<{
		sections: { id: number; title: string }[];
		selected: number;
		onselect: (id: number) => void;
	}>();
</script>

<div
	in:fade
	class="hidden h-full max-h-screen w-full flex-col overflow-y-auto bg-c-bg p-2 drop-shadow-xl lg:relative lg:flex lg:w-32 2xl:w-60 2xl:p-4 dark:border-r-1 dark:border-s-dark-2 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
>
	<div class="p-2 pt-3 text-base font-bold 2xl:text-2xl 2xl:font-normal">Settings</div>
	<nav class="flex flex-col">
		{#each sections as section (section.id)}
			<button
				class="cursor-pointer rounded-lg px-2 py-1 text-left text-sm 2xl:text-base"
				class:bg-c-neutral-1={selected === section.id}
				class:dark:bg-s-dark-3={selected === section.id}
				class:hover:bg-c-neutral={selected !== section.id}
				class:dark:hover:bg-s-dark-3={selected !== section.id}
				onclick={() => onselect(section.id)}
			>
				{section.title}
			</button>
		{/each}
	</nav>
</div>
