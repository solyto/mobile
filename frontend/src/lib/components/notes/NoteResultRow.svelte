<script lang="ts">
	import type { Note } from '$lib/types/note';

	let { note, category, active, onpick }: {
		note: Note;
		category: string | null;
		active: boolean;
		onpick: (note: Note) => void;
	} = $props();

	function keepFocus(event: MouseEvent): void {
		event.preventDefault();
	}
</script>

<li>
	<button
		class="flex w-full cursor-pointer items-baseline justify-between gap-4 rounded-lg px-3 py-2 text-left hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
		class:bg-c-neutral-1={active}
		class:dark:bg-s-dark-3={active}
		onmousedown={keepFocus}
		onclick={() => onpick(note)}
	>
		<span class="truncate">{note.title}</span>
		{#if category !== null}
			<span class="shrink-0 text-sm text-c-neutral-5 dark:text-c-neutral-4">{category}</span>
		{/if}
	</button>
</li>
