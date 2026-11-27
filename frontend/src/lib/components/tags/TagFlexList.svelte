<script lang="ts">
	import type { Tag } from '$lib/types/tag';
	import IconX from '$lib/icons/lucide/x.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let { tags, onRemove }: {
		tags: Tag[];
		onRemove?: (tag: Tag) => void | Promise<void>;
	} = $props();
</script>

<div class="flex flex-row flex-wrap gap-1">
	{#each tags as tag (tag.id)}
		<div
			class="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-c-neutral-7"
			style="background-color: {tag.color !== null ? tag.color : 'var(--color-c-neutral-1)'};"
		>
			#{tag.name}
			{#if onRemove}
				<button type="button" class="cursor-pointer text-red-800" aria-label={ts.get.layout.remove} onclick={() => onRemove(tag)}>
					<IconX class="size-4" />
				</button>
			{/if}
		</div>
	{/each}
</div>
