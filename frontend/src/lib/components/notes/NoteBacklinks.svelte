<script lang="ts">
	import { resolve } from '$app/paths';
	import { urls } from '$lib/config/urls';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { NoteBacklink } from '$lib/types/note';

	let { backlinks }: {
		backlinks: NoteBacklink[];
	} = $props();

	const ts = getTranslation();
</script>

<section class="mt-4 flex flex-col gap-1 border-t border-c-neutral-2 pt-3 dark:border-s-dark">
	<h2 class="text-xs text-c-neutral-5 dark:text-c-neutral-4">{ts.get.notes.linked_from}</h2>
	<ul class="flex flex-wrap gap-x-4 gap-y-1">
		{#each backlinks as link (link.id)}
			<li>
				<a
					href={resolve(urls.note, { id: link.id })}
					class="text-sm text-c-neutral-6 hover:text-c-text hover:underline dark:text-c-neutral-3"
				>
					{link.title}
				</a>
			</li>
		{/each}
	</ul>
</section>
