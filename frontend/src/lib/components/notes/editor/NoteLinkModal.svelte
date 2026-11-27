<script lang="ts">
	import { onMount } from 'svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import NoteLinkList from './NoteLinkList.svelte';
	import { NotePicker } from '$lib/helpers/NotePicker.svelte';
	import { getNotes, NotesSvelte } from '$lib/state/Notes.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { Note } from '$lib/types/note';

	let { onpick, onCancel, initialName = null, currentNoteId = null }: {
		onpick: (note: Note, name: string | null) => void;
		onCancel: () => void;
		// Editing a link: its name stays editable and its current target comes first.
		initialName?: string | null;
		currentNoteId?: string | null;
	} = $props();

	const notes = getNotes();
	const ts = getTranslation();
	const picker = new NotePicker(search);

	let input = $state<HTMLInputElement | HTMLTextAreaElement | null>(null);
	// svelte-ignore state_referenced_locally
	let name = $state<string | null>(initialName);

	picker.search('');

	onMount(() => input?.focus());

	function search(term: string): Note[] {
		const results = notes.searchLinkableNotes(term, NotesSvelte.LINK_PICKER_LIMIT);
		const current = term === '' && currentNoteId !== null ? notes.findNote(currentNoteId) : null;
		if (!current) return results;

		return [current, ...results.filter((note) => note.id !== current.id)].slice(0, NotesSvelte.LINK_PICKER_LIMIT);
	}

	function pick(note: Note): void {
		onpick(note, name === null ? null : name.trim());
	}

	function pickSelected(): void {
		const note = picker.selected();
		if (note) pick(note);
	}
</script>

<ConfirmationModal title={ts.get.notes.link_to_note} onConfirm={pickSelected} {onCancel} width="w-112">
	<div class="flex flex-col gap-2">
		{#if name !== null}
			<span class="block text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.notes.insert_link_name}</span>
			<TextInput bind:value={name} placeholder={ts.get.notes.insert_link_name} />
			<span class="mt-1 block text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.notes.link_target}</span>
		{/if}
		<TextInput
			bind:input
			bind:value={picker.term}
			placeholder={ts.get.notes.search_placeholder}
			oninput={() => picker.search()}
			autocomplete="off"
		/>
		<NoteLinkList {picker} onpick={pick} class="max-h-72 overflow-y-auto" />
	</div>
</ConfirmationModal>
