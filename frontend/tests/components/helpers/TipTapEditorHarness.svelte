<script lang="ts">
	import TipTapEditor from '$lib/components/notes/editor/TipTapEditor.svelte';
	import { setNotes, type NotesSvelte } from '$lib/state/Notes.svelte';
	import type { Note } from '$lib/types/note';

	let { note, onNotes }: { note: Note; onNotes?: (notes: NotesSvelte) => void } = $props();

	const notes = setNotes();
	// svelte-ignore state_referenced_locally
	notes.activeNote = note;
	// svelte-ignore state_referenced_locally
	onNotes?.(notes);
</script>

<TipTapEditor />
