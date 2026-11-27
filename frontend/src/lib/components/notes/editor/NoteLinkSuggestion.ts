import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion, { type SuggestionProps } from '@tiptap/suggestion';
import type { Note } from '$lib/types/note';

export type NoteLinkSuggestionProps = SuggestionProps<Note, Note>;

export type NoteLinkSuggestionOptions = {
	hrefForNote: (note: Note) => string;
	onOpen: (props: NoteLinkSuggestionProps) => void;
	onClose: () => void;
	onKeyDown: (event: KeyboardEvent) => boolean;
};

export function createNoteLinkSuggestion(options: NoteLinkSuggestionOptions): Extension {
	return Extension.create({
		name: 'noteLinkSuggestion',

		addProseMirrorPlugins() {
			return [
				Suggestion<Note, Note>({
					editor: this.editor,
					pluginKey: new PluginKey('noteLinkSuggestion'),
					char: '[[',
					allowSpaces: true,
					allowedPrefixes: null,
					floatingUi: { strategy: 'fixed' },
					command: ({ editor, range, props: note }) => {
						editor
							.chain()
							.focus()
							.insertContentAt(range, [
								{ type: 'text', text: note.title, marks: [{ type: 'link', attrs: { href: options.hrefForNote(note) } }] },
								{ type: 'text', text: ' ' }
							])
							.run();
					},
					render: () => ({
						onStart: options.onOpen,
						onUpdate: options.onOpen,
						onExit: options.onClose,
						onKeyDown: ({ event }) => options.onKeyDown(event)
					})
				})
			];
		}
	});
}
