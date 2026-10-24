<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	let {
		label = null,
		icon: Icon = null,
		children
	}: {
		label?: string | null;
		icon?: Component<{ class?: string }> | null;
		children?: Snippet;
	} = $props();
</script>

<div
	class="relative h-auto rounded-md shadow-sm transition-all dark:shadow-s-dark-shadow md:dark:bg-s-dark-2 px-6 py-4 hover:bg-c-neutral dark:hover:bg-s-dark-3"
>
	{#if label !== null}
		<div
			class="flex flex-row items-center justify-between w-full gap-4 pb-2 text-xl leading-loose tracking-wide text-c-heading dark:text-c-primary"
			class:gap-2={!Icon}
			class:mt-[-10px]={!Icon}
			class:mb-2={children !== undefined}
			class:pb-2={children !== undefined}
		>
			<span>{label}</span>
			{#if Icon !== null}
				<Icon class="w-6 h-6" />
			{/if}
		</div>
	{/if}
	{#if children !== undefined}
		{@render children?.()}
	{/if}
</div>