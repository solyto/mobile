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

	const notes = getNotes();
	const ts = getTranslation();

	let { entries, title } = $props<{
		entries: Note[];
		title: string;
	}>();

	const ACCENT_COLORS = [
		'#1dbda5', '#4e1f90', '#14a5cd', '#fc9427', '#ec3a41', '#61d96a', '#992f8c', '#1c68c3'
	];

	function getAccentColor(categoryId: number | null): string {
		if (!categoryId) return '#9ca3af';
		return ACCENT_COLORS[categoryId % ACCENT_COLORS.length];
	}

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
		return stripped.length > 100 ? stripped.slice(0, 100) + '…' : stripped;
	}
</script>

<div class="relative flex flex-col gap-4" in:blur>
	<h1 class="mt-2 text-2xl font-bold text-c-heading md:mt-6 dark:text-c-primary">{title}</h1>
	<div class="flex flex-row max-md:flex-col gap-4 pb-4 items-start">
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
					style="border-left: 3px solid {getAccentColor(note.category_id)}"
				>
					{#if note.is_favorite}
						<span class="absolute top-2 right-2 text-c-action">
							<IconStar size={13} fill="currentColor" />
						</span>
					{/if}
					<h3 class="pr-5 font-bold leading-tight">{note.title}</h3>
					{#if note.content}
						<p class="text-xs leading-relaxed text-c-neutral-5 dark:text-c-neutral-4">
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
						<div class="flex flex-col gap-0.5 text-xs text-c-neutral-5 dark:text-c-neutral-4">
							<div class="flex items-center gap-1.5">
								<IconFolder size={12} />
								<span
									>{note.category_id
										? notes.getCategoryTitle(note.category_id)
										: '-'}</span
								>
							</div>
							<span
								>{ts.get.notes.updated_days_ago.replace(
									'%d',
									daysSince(note.updated_at).toString()
								)}</span
							>
						</div>
					</div>
				</div>
			</button>
		{/each}
	</div>
</div>
