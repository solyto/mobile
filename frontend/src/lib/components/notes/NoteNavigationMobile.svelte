<script lang="ts">
	import { fly } from 'svelte/transition';
	import { getNotes } from '$lib/state/Notes.svelte';
	import type { NoteCategory } from '$lib/types/note';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getDateMinusDays, getUrlFormat } from '$lib/helpers/DateHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import IconChevronRight from '@lucide/svelte/icons/chevron-right';
	import IconArrowLeft from '@lucide/svelte/icons/arrow-left';
	import AddNoteButton from '$lib/components/notes/AddNoteButton.svelte';
	import AddFolderButton from '$lib/components/notes/AddFolderButton.svelte';
	import JournalArchivePicker from '$lib/components/notes/journal/JournalArchivePicker.svelte';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import HamburgerButton from '$lib/components/ui/buttons/HamburgerButton.svelte';

	const notes = getNotes();
	const ts = getTranslation();
	const auth = getAuth();

	let open = $state<boolean>(false);
	let stack = $state<(NoteCategory | 'journal' | 'favorites')[]>([]);
	let direction = $state<'forward' | 'back'>('forward');
	let favorites = $derived(notes.getFavorites());
	let otherOpen = $state<boolean>(false);

	const todayKey = getUrlFormat(new Date());
	const yesterdayKey = getUrlFormat(getDateMinusDays(new Date(), 1));

	let activeKey = $derived.by(() => {
		const date = page.params.date;
		return date && notes.journalService.isEntryTitle(date) ? date : null;
	});

	function isOtherActive(): boolean {
		return otherOpen || (activeKey !== null && activeKey !== todayKey && activeKey !== yesterdayKey);
	}

	function openOtherDate(date: Date): void {
		otherOpen = false;
		close();
		goto(resolve(urls.journalDate, { date: getUrlFormat(date) }));
	}

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

	function selectSection(section: 'journal' | 'favorites'): void {
		direction = 'forward';
		stack = [...stack, section];
	}

	function goBack(): void {
		direction = 'back';
		stack = stack.slice(0, -1);
	}
</script>

<HamburgerButton onclick={() => (open = true)} />

{#if open}
	<div
		class="secondary-nav-mobile-container-sm fixed inset-0 z-50 flex flex-col bg-c-bg sm:hidden dark:bg-s-dark-1"
		transition:fly={{ x: -400, duration: 200 }}
	>
		<div class="relative flex-1 overflow-hidden">
			{#key current ?? 'root'}
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
								<AddNoteButton onClick={() => notes.openCreateNoteModal(null)} />
								<AddFolderButton onClick={() => notes.openModal('category')} />
								<CloseButton onClick={close} inModal={false} />
							</div>
						</div>
						<div class="flex-1 overflow-y-auto">
							{#if auth.user?.settings?.journal_enabled}
								<button
									class="flex w-full cursor-pointer items-center justify-between border-b border-c-neutral-1 px-4 py-4 text-left hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3"
									onclick={() => selectSection('journal')}
								>
									<span class="text-base">{ts.get.notes.journal}</span>
									<IconChevronRight size={18} class="shrink-0 text-c-neutral-4" />
								</button>
							{/if}
							{#if favorites.length > 0}
								<button
									class="flex w-full cursor-pointer items-center justify-between border-b border-c-neutral-1 px-4 py-4 text-left hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3"
									onclick={() => selectSection('favorites')}
								>
									<span class="text-base">{ts.get.notes.favorites}</span>
									<IconChevronRight size={18} class="shrink-0 text-c-neutral-4" />
								</button>
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
							{#if notes.categories.length === 0 && notes.getVisibleNotes().length === 0}
								<div class="px-4 py-8 text-center text-c-neutral-4">{ts.get.notes.no_entries}</div>
							{/if}
						</div>
					{:else if current === 'journal'}
						<!-- Level N: journal -->
						<div class="flex shrink-0 items-center justify-between border-b border-c-neutral-2 p-4 dark:border-s-dark-3">
							<div class="flex items-center gap-3">
								<button
									class="cursor-pointer text-c-neutral-5 hover:text-c-neutral-7 dark:text-c-neutral-4 dark:hover:text-c-neutral-2"
									onclick={goBack}
								>
									<IconArrowLeft size={22} />
								</button>
								<span class="text-xl font-semibold">{ts.get.notes.journal}</span>
							</div>
							<CloseButton onClick={close} inModal={false} />
						</div>
						<div class="flex-1 overflow-y-auto">
							<a
								href={resolve(urls.journalDate, { date: todayKey })}
								onclick={close}
								class="flex items-center border-b border-c-neutral-1 px-4 py-4 hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3 {activeKey === todayKey ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}"
							>
								<span class="text-base">{ts.get.notes.today}</span>
							</a>
							<a
								href={resolve(urls.journalDate, { date: yesterdayKey })}
								onclick={close}
								class="flex items-center border-b border-c-neutral-1 px-4 py-4 hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3 {activeKey === yesterdayKey ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}"
							>
								<span class="text-base">{ts.get.notes.yesterday}</span>
							</a>
							<div class="relative">
								<button
									type="button"
									class="flex w-full cursor-pointer items-center border-b border-c-neutral-1 px-4 py-4 text-left hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3 {isOtherActive() ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}"
									onclick={() => (otherOpen = !otherOpen)}
								>
									<span class="text-base">{ts.get.notes.other}</span>
								</button>
								{#if otherOpen}
									<div class="absolute top-full left-0 z-30 rounded-lg bg-c-bg shadow-lg">
										<JournalArchivePicker
											selectedDate={notes.journalService.parseEntryTitle(page.params.date ?? '') ?? new Date()}
											markedDates={notes.getJournalEntryDates()}
											onSelect={openOtherDate}
										/>
									</div>
								{/if}
							</div>
						</div>
					{:else if current === 'favorites'}
						<!-- Level N: favorites -->
						<div class="flex shrink-0 items-center justify-between border-b border-c-neutral-2 p-4 dark:border-s-dark-3">
							<div class="flex items-center gap-3">
								<button
									class="cursor-pointer text-c-neutral-5 hover:text-c-neutral-7 dark:text-c-neutral-4 dark:hover:text-c-neutral-2"
									onclick={goBack}
								>
									<IconArrowLeft size={22} />
								</button>
								<span class="text-xl font-semibold">{ts.get.notes.favorites}</span>
							</div>
							<CloseButton onClick={close} inModal={false} />
						</div>
						<div class="flex-1 overflow-y-auto">
							{#each favorites as note (note.id)}
								<a
									href={resolve(urls.note, { id: note.id })}
									onclick={() => { notes.selectNote(note.id); handleNoteSelect(); }}
									class="flex items-center border-b border-c-neutral-1 px-4 py-4 hover:bg-c-neutral-1 dark:border-s-dark-3 dark:hover:bg-s-dark-3 {notes.activeNote?.id === note.id ? 'bg-c-neutral-1 dark:bg-s-dark-3' : ''}"
								>
									<span class="text-base">{note.title}</span>
								</a>
							{/each}
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
								<AddNoteButton onClick={() => notes.openCreateNoteModal(current.id)} />
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
