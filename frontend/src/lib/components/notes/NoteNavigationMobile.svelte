<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { getNotes } from '$lib/state/Notes.svelte';
	import type { NoteCategory } from '$lib/types/note';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconChevronRight from '@lucide/svelte/icons/chevron-right';
	import IconArrowLeft from '@lucide/svelte/icons/arrow-left';
	import AddNoteButton from '$lib/components/notes/AddNoteButton.svelte';
	import AddFolderButton from '$lib/components/notes/AddFolderButton.svelte';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import FunnelButton from '$lib/components/ui/buttons/FunnelButton.svelte';

	const notes = getNotes();
	const ts = getTranslation();

	let open = $state(false);
	let stack = $state<NoteCategory[]>([]);
	let direction = $state<'forward' | 'back'>('forward');
	let favorites = $derived(notes.getFavorites());

	let current = $derived(stack.length > 0 ? stack[stack.length - 1] : null);

	function close(): void {
		open = false;
	}

	function handleNoteSelect(): void {
		close();
	}

	function selectCategory(category: NoteCategory): void {
		direction = 'forward';
		stack = [...stack, category];
	}

	function goBack(): void {
		direction = 'back';
		stack = stack.slice(0, -1);
	}
</script>

<FunnelButton onclick={() => (open = true)} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex flex-col bg-c-bg sm:hidden dark:bg-s-dark-1"
		transition:fade={{ duration: 150 }}
	>
		<div class="relative flex-1 overflow-hidden">
			{#key current?.id ?? 'root'}
				<div
					class="absolute inset-0 flex flex-col"
					in:fly={{ x: direction === 'forward' ? window.innerWidth : -window.innerWidth, duration: 250, opacity: 1 }}
					out:fly={{ x: direction === 'forward' ? -window.innerWidth : window.innerWidth, duration: 250, opacity: 1 }}
				>
					{#if current === null}
						<!-- Level 1: root -->
						<div class="flex shrink-0 items-center justify-between border-b border-c-neutral-2 p-4 dark:border-s-dark-3">
							<span class="text-2xl font-bold">{ts.get.notes.notebook}</span>
							<div class="flex gap-1">
								<AddNoteButton onClick={() => notes.openModal('note')} />
								<AddFolderButton onClick={() => notes.openModal('category')} />
								<CloseButton onClick={close} inModal={false} />
							</div>
						</div>
						<div class="flex-1 overflow-y-auto">
							{#if favorites.length > 0}
								<div class="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-c-neutral-4 dark:text-c-neutral-5">
									{ts.get.notes.favorites}
								</div>
								{#each favorites as note (note.id)}
									<a
										href={resolve(urls.note, { id: note.id })}
										onclick={() => { notes.selectNote(note.id); handleNoteSelect(); }}
										class="flex items-center border-b border-c-neutral-1 px-4 py-4 hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3 {notes.activeNote?.id === note.id ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}"
									>
										<span class="text-base">{note.title}</span>
									</a>
								{/each}
							{/if}
							{#each notes.categories as category (category.id)}
								<button
									class="flex w-full cursor-pointer items-center justify-between border-b border-c-neutral-1 px-4 py-4 text-left hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3"
									onclick={() => selectCategory(category)}
								>
									<span class="text-base">{category.title}</span>
									<IconChevronRight size={18} class="shrink-0 text-c-neutral-4" />
								</button>
							{/each}
							{#each notes.getNotesForCategory(null) as note (note.id)}
								<a
									href={resolve(urls.note, { id: note.id })}
									onclick={() => { notes.selectNote(note.id); handleNoteSelect(); }}
									class="flex items-center border-b border-c-neutral-1 px-4 py-4 hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3 {notes.activeNote?.id === note.id ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}"
								>
									<span class="text-base">{note.title}</span>
								</a>
							{/each}
							{#if notes.categories.length === 0 && notes.notes.length === 0}
								<div class="px-4 py-8 text-center text-c-neutral-4">{ts.get.notes.no_entries}</div>
							{/if}
						</div>
					{:else}
						<!-- Level N: category detail -->
						<div class="flex shrink-0 items-center justify-between border-b border-c-neutral-2 p-4 dark:border-s-dark-3">
							<div class="flex items-center gap-3">
								<button
									class="cursor-pointer text-c-neutral-5 hover:text-c-neutral-7 dark:text-c-neutral-4 dark:hover:text-c-neutral-2"
									onclick={goBack}
								>
									<IconArrowLeft size={22} />
								</button>
								<span class="text-xl font-semibold">{current.title}</span>
							</div>
							<div class="flex gap-1">
								<AddNoteButton onClick={() => notes.openModal('note')} />
								<CloseButton onClick={close} inModal={false} />
							</div>
						</div>
						<div class="flex-1 overflow-y-auto">
							{#each current.children as child (child.id)}
								<button
									class="flex w-full cursor-pointer items-center justify-between border-b border-c-neutral-1 px-4 py-4 text-left hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3"
									onclick={() => selectCategory(child)}
								>
									<span class="text-base">{child.title}</span>
									<IconChevronRight size={18} class="shrink-0 text-c-neutral-4" />
								</button>
							{/each}
							{#each notes.getNotesForCategory(current.id) as note (note.id)}
								<a
									href={resolve(urls.note, { id: note.id })}
									onclick={() => { notes.selectNote(note.id); handleNoteSelect(); }}
									class="flex items-center border-b border-c-neutral-1 px-4 py-4 hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3 {notes.activeNote?.id === note.id ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}"
								>
									<span class="text-base">{note.title}</span>
								</a>
							{/each}
							{#if current.children.length === 0 && notes.getNotesForCategory(current.id).length === 0}
								<div class="px-4 py-8 text-center text-c-neutral-4">{ts.get.notes.no_entries}</div>
							{/if}
						</div>
					{/if}
				</div>
			{/key}
		</div>
	</div>
{/if}
