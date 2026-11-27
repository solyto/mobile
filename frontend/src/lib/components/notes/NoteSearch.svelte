<script lang="ts">
	import { fade } from 'svelte/transition';
	import IconCircleX from '$lib/icons/lucide/circle-x.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { getNotes } from '$lib/state/Notes.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { Note } from '$lib/types/note';
	import GhostIconButton from '$lib/components/ui/buttons/GhostIconButton.svelte';
	import NoteResultRow from '$lib/components/notes/NoteResultRow.svelte';

	const keyManager = getKeyManager();
	const notes = getNotes();
	const ts = getTranslation();

	const EXPAND_DELAY_MS = 50;
	const CLOSE_DELAY_MS = 200;

	let inputExpanded = $state<boolean>(false);
	let searchInput = $state<HTMLInputElement | null>(null);
	let expandTimer: ReturnType<typeof setTimeout> | undefined;
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	let keyHandlers: { [key: string]: string | null } = {
		Escape: null,
		ArrowUp: null,
		ArrowDown: null,
		Enter: null
	};

	onMount(() => {
		searchInput?.focus();
		expandTimer = setTimeout(() => (inputExpanded = true), EXPAND_DELAY_MS);
	});

	onDestroy(() => {
		clearTimeout(expandTimer);
		clearTimeout(closeTimer);
		keyManager.unregisterAll(keyHandlers);
	});

	// Registered on focus, not on mount: if focus never lands, the arrow keys must stay free for the caret.
	function registerKeys(): void {
		if (keyHandlers.Escape !== null) return;

		keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape, { priority: 0 });
		keyHandlers.ArrowUp = keyManager.registerKeyDown('ArrowUp', selectPrevious, { priority: 0 });
		keyHandlers.ArrowDown = keyManager.registerKeyDown('ArrowDown', selectNext, { priority: 0 });
		keyHandlers.Enter = keyManager.registerKeyDown('Enter', openSelected, { priority: 0 });
	}

	function closeSearch(): void {
		keyManager.unregisterAll(keyHandlers);
		inputExpanded = false;
		closeTimer = setTimeout(() => notes.closeSearch(), CLOSE_DELAY_MS);
	}

	// The search keys win over the editor and title input, so the search must not stay open once focus leaves it.
	function onfocusout(event: FocusEvent): void {
		const target = event.relatedTarget as Node | null;
		if (target !== null && (event.currentTarget as HTMLElement).contains(target)) return;

		closeSearch();
	}

	function handleEscape(event: KeyboardEvent): void {
		closeSearch();
	}

	function selectPrevious(event: KeyboardEvent): void {
		notes.moveSearchSelection(-1);
	}

	function selectNext(event: KeyboardEvent): void {
		notes.moveSearchSelection(1);
	}

	function openSelected(event: KeyboardEvent): void {
		notes.openSearchResult();
	}

	function openNote(note: Note): void {
		notes.openSearchResult(note);
	}

	function categoryOf(note: Note): string | null {
		return note.category_id === null ? null : notes.getCategoryTitle(note.category_id);
	}

	function hasTerm(): boolean {
		return notes.searchTerm.trim() !== '';
	}

	const oninput = () => notes.search();
</script>

<div class="pointer-events-none absolute inset-x-0 top-4 z-50 flex justify-center">
	<div class="flex flex-col" {onfocusout}>
		<div class="relative flex">
			<input
				type="text"
				class="pointer-events-auto w-0 rounded-xl border-1 border-c-neutral-2 focus:border-c-neutral-2 focus:ring-0 !bg-c-neutral/60 text-xl backdrop-blur-sm transition-all duration-300 dark:!bg-s-dark/80"
				class:w-72={inputExpanded}
				class:md:w-96={inputExpanded}
				class:rounded-b-none={hasTerm()}
				placeholder={ts.get.notes.search_placeholder}
				aria-label={ts.get.notes.search_placeholder}
				in:fade
				bind:this={searchInput}
				bind:value={notes.searchTerm}
				onfocus={registerKeys}
				{oninput}
			/>
			<GhostIconButton
				label={ts.get.layout.close}
				onclick={closeSearch}
				color="text-c-neutral-5 dark:text-c-neutral-3"
				class="pointer-events-auto absolute inset-y-0 right-1.5 z-20"
			>
				<IconCircleX />
			</GhostIconButton>
		</div>
		{#if hasTerm() && inputExpanded}
			<ul class="pointer-events-auto flex max-h-96 w-0 min-w-full flex-col overflow-y-auto rounded-b-xl border-1 border-t-0 border-c-neutral-2 bg-c-neutral/60 p-1 backdrop-blur-sm dark:bg-s-dark/80">
				{#each notes.searchResults as note, index (note.id)}
					<NoteResultRow {note} category={categoryOf(note)} active={index === notes.searchIndex} onpick={openNote} />
				{:else}
					<li class="px-3 py-2 text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.notes.no_search_results}</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
