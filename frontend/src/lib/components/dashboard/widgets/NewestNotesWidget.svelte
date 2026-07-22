<script lang="ts">
	import { blur } from 'svelte/transition';
	import { formatDate } from '$lib/helpers/DateHelper';
	import IconNotebookPen from '@lucide/svelte/icons/notebook-pen';
	import type { Note } from '$lib/types/note';
	import type { Translation } from '$lib/state/Translation.svelte';

	let { newestNotes, ts } = $props<{
		newestNotes: Note[];
		ts: Translation;
	}>();
</script>

<div in:blur>
	<div class="mb-2 flex items-center gap-2">
		<IconNotebookPen size={15} class="text-c-heading dark:text-c-primary" />
		<span class="text-xs font-semibold tracking-wider text-c-heading uppercase dark:text-c-primary">
			{ts.get.home.recent_notes}
		</span>
	</div>
	<div class="flex flex-col gap-1">
		{#each newestNotes as note (note.id)}
			<a
				href="/notes/{note.id}"
				class="group flex items-center gap-2 py-0.5 transition-colors"
			>
				<span class="truncate text-sm text-c-neutral-7 transition-colors group-hover:text-c-primary dark:text-c-neutral-3">
					{note.title}
				</span>
				<span class="ml-auto shrink-0 text-xs text-c-neutral-4 dark:text-c-neutral-5">
					{formatDate(new Date(note.updated_at) > new Date(note.created_at) ? note.updated_at : note.created_at)}
				</span>
			</a>
		{/each}
	</div>
</div>