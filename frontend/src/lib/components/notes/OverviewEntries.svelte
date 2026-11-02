<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { daysSince } from '$lib/helpers/DateHelper';
	import { blur } from 'svelte/transition';
	import IconFolder from '@lucide/svelte/icons/folder';
	import IconStar from '@lucide/svelte/icons/star';
	import { getNotes } from '$lib/state/Notes.svelte';
	import type { Note } from '$lib/types/note';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';

	const notes = getNotes();
	const ts = getTranslation();

	let { entries, title }: {
		entries: Note[];
		title: string;
	} = $props();

	function getContentPreview(content: string): string {
		const stripped = content
			.replace(/<[^>]*>/g, ' ')
			.replace(/#{1,6}\s+/g, '')
			.replace(/(\*\*|__)(.*?)\1/g, '$2')
			.replace(/(\*|_)(.*?)\1/g, '$2')
			.replace(/`{1,3}[^`]*`{1,3}/g, '')
			.replace(/^\s*[-*+]\s+/gm, '')
			.replace(/^\s*\d+\.\s+/gm, '')
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			.replace(/[>~]/g, '')
			.replace(/\s+/g, ' ')
			.trim();
		return stripped;
	}
</script>

<div class="relative flex flex-col gap-4" in:blur>
	<Heading title={title} my={0} mt={4} />
	<div class="flex flex-row max-md:flex-col flex-wrap gap-4 pb-4 items-start">
		{#each entries as note (note.id)}
			<button
				class="cursor-pointer text-left w-60 max-md:w-full"
				onclick={() => {
					notes.selectNote(note.id);
					goto(resolve(`/notes/${note.id}`));
				}}
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
							{getContentPreview(note.content)}
						</p>
					{/if}
					<div class="mt-auto flex flex-col gap-1.5">
						{#if note.tags.length > 0}
							<div class="flex flex-wrap gap-1">
								{#each note.tags.slice(0, 3) as tag (tag.id)}
									<span
										class="rounded px-1.5 py-0.5 text-[0.62rem] font-medium text-white"
										style="background-color: {tag.color}">{tag.name}</span
									>
								{/each}
								{#if note.tags.length > 3}
									<span class="self-center text-[0.62rem] text-c-neutral-5"
										>+{note.tags.length - 3}</span
									>
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
							<span class="ml-auto shrink-0">{ts.get.notes.updated_days_ago.replace('%d', daysSince(note.updated_at).toString())}</span>
						</div>
					</div>
				</div>
			</button>
		{/each}
	</div>
</div>
