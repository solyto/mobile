<script lang="ts">
	import { resolve } from '$app/paths';
	import { daysSince } from '$lib/helpers/DateHelper';
	import { blur } from 'svelte/transition';
	import IconFolder from '$lib/icons/lucide/folder.svelte';
	import IconStar from '$lib/icons/lucide/star.svelte';
	import { getNotes } from '$lib/state/Notes.svelte';
	import type { Note } from '$lib/types/note';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { notePreview } from '$lib/helpers/NotePreviewHelper';
	import { urls } from '$lib/config/urls';

	const PREVIEW_TAG_COUNT = 3;

	const notes = getNotes();
	const ts = getTranslation();

	let { entries, title }: {
		entries: Note[];
		title: string;
	} = $props();

	function updatedLabel(note: Note): string {
		return ts.get.notes.updated_days_ago.replace('%d', daysSince(note.updated_at).toString());
	}
</script>

<div class="relative flex flex-col gap-4" in:blur>
	<Heading title={title} my={0} mt={4} />
	<div class="flex flex-row max-md:flex-col flex-wrap gap-4 pb-4 items-start">
		{#each entries as note (note.id)}
			<a
				href={resolve(urls.note, { id: note.id })}
				class="cursor-pointer text-left w-60 max-md:w-full"
			>
				<div
					class="relative flex md:min-h-[10rem] w-full flex-col gap-2 rounded-md bg-c-bg-surface p-3 shadow-sm transition-all hover:bg-c-neutral"
				>
					{#if note.is_favorite}
						<span class="absolute top-2 right-2 text-c-action">
							<IconStar size={13} fill="currentColor" />
						</span>
					{/if}
					<h3 class="pr-5 font-bold leading-tight">{note.title}</h3>
					{#if note.content}
						<p class="line-clamp-3 text-sm leading-relaxed text-c-neutral-5 dark:text-c-neutral-4">
							{notePreview(note.content)}
						</p>
					{/if}
					<div class="mt-auto flex flex-col gap-1.5">
						{#if note.tags.length > 0}
							<div class="flex flex-wrap gap-1">
								{#each note.tags.slice(0, PREVIEW_TAG_COUNT) as tag (tag.id)}
									<span
										class="rounded px-1.5 py-0.5 text-[0.62rem] font-medium text-white"
										style="background-color: {tag.color}">{tag.name}</span
									>
								{/each}
								{#if note.tags.length > PREVIEW_TAG_COUNT}
									<span class="self-center text-[0.62rem] text-c-neutral-5">+{note.tags.length - PREVIEW_TAG_COUNT}</span>
								{/if}
							</div>
						{/if}
						<div class="flex items-center justify-between gap-3 text-xs text-c-neutral-5 dark:text-c-neutral-4">
							{#if note.category_id}
								<span class="flex min-w-0 items-center gap-1.5">
									<IconFolder size={12} class="shrink-0" />
									<span class="truncate">{notes.getCategoryTitle(note.category_id)}</span>
								</span>
							{/if}
							<span class="ml-auto shrink-0">{updatedLabel(note)}</span>
						</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
