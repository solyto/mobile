<script lang="ts">
	import type { Tag } from '$lib/types/tag';
	import IconX from '@lucide/svelte/icons/x';

	let { tags, onRemove } = $props<{
		tags: Tag[];
		onRemove?: (tag: Tag) => void | Promise<void>;
	}>();
</script>

<div class="flex flex-row gap-1">
	{#each tags as tag (tag.id)}
		<div
			class="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-c-neutral-7"
			style="background-color: {tag.color !== null ? tag.color : 'var(--color-c-neutral-1)'};"
		>
			#{tag.name}
			{#if onRemove}
				<IconX class="size-4 cursor-pointer text-red-800" onclick={() => onRemove(tag)} />
			{/if}
		</div>
	{/each}
</div>
