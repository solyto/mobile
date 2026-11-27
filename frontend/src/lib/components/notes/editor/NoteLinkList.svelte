<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import NoteResultRow from '$lib/components/notes/NoteResultRow.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { getNotes } from '$lib/state/Notes.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { NotePicker } from '$lib/helpers/NotePicker.svelte';
	import type { Note } from '$lib/types/note';

	let { picker, onpick, class: customClass = '' }: {
		picker: NotePicker;
		onpick: (note: Note) => void;
		class?: string;
	} = $props();

	const keyManager = getKeyManager();
	const notes = getNotes();
	const ts = getTranslation();

	let keyHandlers: { [key: string]: string | null } = { ArrowUp: null, ArrowDown: null, Enter: null };

	onMount(() => {
		keyHandlers.ArrowUp = keyManager.registerKeyDown('ArrowUp', selectPrevious, { priority: 0 });
		keyHandlers.ArrowDown = keyManager.registerKeyDown('ArrowDown', selectNext, { priority: 0 });
		keyHandlers.Enter = keyManager.registerKeyDown('Enter', pickSelected, { priority: 0 });
	});

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	function selectPrevious(event: KeyboardEvent): void {
		picker.move(-1);
	}

	function selectNext(event: KeyboardEvent): void {
		picker.move(1);
	}

	function pickSelected(event: KeyboardEvent): void {
		const note = picker.selected();
		if (note) onpick(note);
	}

	function categoryOf(note: Note): string | null {
		return note.category_id === null ? null : notes.getCategoryTitle(note.category_id);
	}
</script>

<ul class="flex flex-col {customClass}">
	{#each picker.results as note, index (note.id)}
		<NoteResultRow {note} category={categoryOf(note)} active={index === picker.index} {onpick} />
	{:else}
		<li class="px-3 py-2 text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.notes.no_search_results}</li>
	{/each}
</ul>
