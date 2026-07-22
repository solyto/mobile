<script lang="ts">
	let { selected, onSelect } = $props<{
		selected: string;
		onSelect: (key: string) => void;
	}>();
</script>

{#snippet entry(key: string, label: string)}
	<button
		class="cursor-pointer border-b-2 pb-2 transition-all"
		class:border-transparent={selected !== key}
		class:border-black={selected === key}
		onclick={() => onSelect(key)}
	>
		{label}
	</button>
{/snippet}

<div class="flex w-full justify-center gap-4 text-2xl">
	{@render entry('chords', 'Chords')}
	{@render entry('fretboard', 'Fretboard')}
	{@render entry('chord-builder', 'Chord Builder')}
</div>
