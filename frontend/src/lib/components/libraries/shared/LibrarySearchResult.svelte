<script lang="ts">
	import IconLoaderCircle from '@lucide/svelte/icons/loader-circle';
	import type { Snippet } from 'svelte';
	import type { NormalizedSearchResult } from '$lib/components/libraries/shared/LibrarySearchModal.svelte';

	let {
		result,
		importing,
		disabled,
		onSelect,
		resultRow
	}: {
		result: NormalizedSearchResult;
		importing: boolean;
		disabled: boolean;
		onSelect: () => Promise<void>;
		resultRow?: Snippet<[NormalizedSearchResult, boolean, () => Promise<void>]>;
	} = $props();
</script>

{#if resultRow}
	{@render resultRow(result, importing, onSelect)}
{:else}
	<button
		onclick={onSelect}
		{disabled}
		class="flex items-center gap-3 rounded-lg p-2 text-left hover:bg-c-neutral-1 disabled:opacity-50 dark:hover:bg-s-dark-3 cursor-pointer"
	>
		{#if importing}
			<div class="flex size-10 shrink-0 items-center justify-center rounded">
				<IconLoaderCircle class="size-5 animate-spin text-c-neutral-5" />
			</div>
		{:else if result.image}
			<img src={result.image} alt={result.title} class="size-10 shrink-0 rounded object-cover" />
		{:else}
			<div class="size-10 shrink-0 rounded bg-c-neutral-2 dark:bg-s-dark-3"></div>
		{/if}
		<div class="min-w-0">
			<p class="truncate text-sm font-bold dark:text-white">{result.title}</p>
			{#if result.subtitle}
				<p class="truncate text-xs text-c-neutral-5 dark:text-c-neutral-4">{result.subtitle}</p>
			{/if}
		</div>
	</button>
{/if}
