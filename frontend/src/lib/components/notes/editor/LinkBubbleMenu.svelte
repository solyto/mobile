<script lang="ts">
	import type { Editor } from '@tiptap/core';
	import EditorPopover from './EditorPopover.svelte';
	import EditorPopoverDivider from './EditorPopoverDivider.svelte';
	import InsertLinkModal from './InsertLinkModal.svelte';
	import NoteLinkModal from './NoteLinkModal.svelte';
	import NoteLinkService from '$lib/services/NoteLinkService';
	import ArrowUpRight from '$lib/icons/lucide/arrow-up-right.svelte';
	import ExternalLink from '$lib/icons/lucide/external-link.svelte';
	import Pencil from '$lib/icons/lucide/pencil.svelte';
	import Unlink from '$lib/icons/lucide/unlink.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { hostnameOf, safeHref } from '$lib/helpers/UrlHelper';
	import type { Note } from '$lib/types/note';

	export type ActiveLink = {
		href: string;
		text: string;
	};

	let {
		editor,
		link,
		noteId,
		noteTitle,
		iconSize,
		buttonClass,
		root = $bindable<HTMLDivElement | null>(null),
		onopennote
	}: {
		editor: Editor | null;
		link: ActiveLink | null;
		noteId: string | null;
		noteTitle: string | null;
		iconSize: number;
		buttonClass: string;
		root: HTMLDivElement | null;
		onopennote: (noteId: string) => void;
	} = $props();

	const ts = getTranslation();
	const linkService = new NoteLinkService();

	let editModalOpen = $state<boolean>(false);
	let editedLink = $state<ActiveLink | null>(null);

	function isMissingNote(): boolean {
		return noteId !== null && noteTitle === null;
	}

	function label(): string {
		if (!link) return '';

		if (noteId !== null) return noteTitle ?? link.text;

		return hostnameOf(link.href) ?? link.href;
	}

	function externalHref(): string | undefined {
		return link ? safeHref(link.href) : undefined;
	}

	function openNote(): void {
		if (noteId !== null) onopennote(noteId);
	}

	function openEditModal(): void {
		editedLink = link;
		editModalOpen = true;
	}

	function confirmEdit(url: string, name: string): void {
		editor
			?.chain()
			.focus()
			.extendMarkRange('link')
			.insertContent({ type: 'text', text: name || url, marks: [{ type: 'link', attrs: { href: url } }] })
			.run();
		editModalOpen = false;
	}

	function confirmNoteEdit(note: Note, name: string | null): void {
		confirmEdit(linkService.hrefForNote(note), name || note.title);
	}

	function removeLink(): void {
		editor?.chain().focus().extendMarkRange('link').unsetLink().run();
	}
</script>

<EditorPopover bind:root position="absolute" class="flex items-center gap-0.5 px-1.5 py-1">
	<span
		class="max-w-48 truncate px-1.5 text-xs text-c-neutral-5 dark:text-c-neutral-4"
		class:italic={isMissingNote()}
	>
		{label()}
	</span>

	<EditorPopoverDivider />

	{#if noteId !== null}
		<button onclick={openNote} class="toolbar-btn {buttonClass}" title={ts.get.notes.link_open}>
			<ArrowUpRight size={iconSize} />
		</button>
	{:else if externalHref()}
		<a href={externalHref()} target="_blank" rel="external" class="toolbar-btn {buttonClass}" title={ts.get.notes.link_open}>
			<ExternalLink size={iconSize} />
		</a>
	{/if}
	<button onclick={openEditModal} class="toolbar-btn {buttonClass}" title={ts.get.notes.link_edit}>
		<Pencil size={iconSize} />
	</button>
	<button onclick={removeLink} class="toolbar-btn {buttonClass}" title={ts.get.notes.link_remove}>
		<Unlink size={iconSize} />
	</button>
</EditorPopover>

{#if editModalOpen && editedLink && noteId !== null}
	<NoteLinkModal
		onpick={confirmNoteEdit}
		onCancel={() => (editModalOpen = false)}
		initialName={editedLink.text}
		currentNoteId={noteId}
	/>
{:else if editModalOpen && editedLink}
	<InsertLinkModal
		onConfirm={confirmEdit}
		onCancel={() => (editModalOpen = false)}
		initialUrl={editedLink.href}
		initialName={editedLink.text}
	/>
{/if}
