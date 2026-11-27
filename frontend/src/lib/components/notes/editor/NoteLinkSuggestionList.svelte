<script lang="ts">
	import { onMount } from 'svelte';
	import EditorPopover from './EditorPopover.svelte';
	import NoteLinkList from './NoteLinkList.svelte';
	import type { NotePicker } from '$lib/helpers/NotePicker.svelte';
	import type { SuggestionMount, SuggestionPositionData } from '@tiptap/suggestion';
	import type { Note } from '$lib/types/note';

	let { picker, mount, onpick }: {
		picker: NotePicker;
		mount: SuggestionMount;
		onpick: (note: Note) => void;
	} = $props();

	let root = $state<HTMLDivElement | null>(null);

	onMount(() => {
		if (!root) return;

		const node = root;
		return mount(node, { onPosition: (position) => place(node, position) });
	});

	function place(node: HTMLElement, { x, y, strategy }: SuggestionPositionData): void {
		Object.assign(node.style, { position: strategy, left: `${x}px`, top: `${y}px`, zIndex: '60' });
	}
</script>

<EditorPopover bind:root class="w-72 p-1">
	<NoteLinkList {picker} {onpick} />
</EditorPopover>
