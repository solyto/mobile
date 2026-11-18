<script lang="ts">
	import { fade } from 'svelte/transition';
	import IconCircleX from '@lucide/svelte/icons/circle-x';
	import { onDestroy, onMount, tick } from 'svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { getNotes } from '$lib/state/Notes.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { Note } from '$lib/types/note';

	const keyManager = getKeyManager();
	const notes = getNotes();
	const ts = getTranslation();

	let inputExpanded = $state<boolean>(false);
	let searchInput = $state<HTMLInputElement | null>(null);
	let keyHandlers: { [key: string]: string | null } = {
		Escape: null,
		ArrowUp: null,
		ArrowDown: null,
		Enter: null
	};

	onMount(() => {
		setTimeout(async () => {
			if (searchInput === null) return;

			inputExpanded = true;
			await tick();
			searchInput?.focus();
			registerKeys();
		}, 50);
	});
	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	function registerKeys(): void {
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', handleEscape, { priority: 0 });
		keyHandlers.ArrowUp = keyManager.registerKeyDown('ArrowUp', selectPrevious, { priority: 0 });
		keyHandlers.ArrowDown = keyManager.registerKeyDown('ArrowDown', selectNext, { priority: 0 });
		keyHandlers.Enter = keyManager.registerKeyDown('Enter', openSelected, { priority: 0 });
	}

	function closeSearch(): void {
		keyManager.unregisterAll(keyHandlers);
		inputExpanded = false;
		setTimeout(() => notes.closeSearch(), 200);
	}

	// The search keys win over the editor and title input, so the search must not stay open once focus leaves it.
	function onfocusout(event: FocusEvent): void {
		const target = event.relatedTarget as Node | null;
		if (target !== null && (event.currentTarget as HTMLElement).contains(target)) return;

		closeSearch();
	}

	function keepInputFocus(event: MouseEvent): void {
		event.preventDefault();
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
				in:fade
				bind:this={searchInput}
				bind:value={notes.searchTerm}
				{oninput}
			/>
			<button
				class="pointer-events-auto absolute inset-y-0 right-1.5 z-20 flex cursor-pointer items-center text-c-neutral-5 hover:text-c-neutral-7 dark:text-c-neutral-3 dark:hover:text-c-neutral-5"
				onclick={closeSearch}
			>
				<IconCircleX />
			</button>
		</div>
		{#if hasTerm() && inputExpanded}
			<ul class="pointer-events-auto flex max-h-96 w-0 min-w-full flex-col overflow-y-auto rounded-b-xl border-1 border-t-0 border-c-neutral-2 bg-c-neutral/60 p-1 backdrop-blur-sm dark:bg-s-dark/80">
				{#each notes.searchResults as note, index (note.id)}
					<li>
						<button
							class="flex w-full cursor-pointer items-baseline justify-between gap-4 rounded-lg px-3 py-2 text-left hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
							class:bg-c-neutral-1={index === notes.searchIndex}
							class:dark:bg-s-dark-3={index === notes.searchIndex}
							onmousedown={keepInputFocus}
							onclick={() => openNote(note)}
						>
							<span class="truncate">{note.title}</span>
							{#if note.category_id !== null}
								<span class="shrink-0 text-sm text-c-neutral-5 dark:text-c-neutral-4">{notes.getCategoryTitle(note.category_id)}</span>
							{/if}
						</button>
					</li>
				{:else}
					<li class="px-3 py-2 text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.notes.no_search_results}</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
