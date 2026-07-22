<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	const w = 56;
	const h = 71;
	const x = 7;
	const y = 9;

	let tiles = $state<number[]>([]);

	let { path = null } = $props<{ path?: string | null }>();

	onMount(() => {
		for (let i = 0; i < x * y; i++) {
			setTimeout(() => {
				tiles = [...tiles, i];
			}, i * 5);
		}
	});

	function getTilePosition(index: number) {
		const i = Math.floor(index / x);
		const j = index % x;
		return { i, j };
	}
</script>

<div class="flex flex-wrap gap-0" style="width: {x * 8}px;">
	{#each tiles as tile (tile)}
		{@const pos = getTilePosition(tile)}
		<div
			style="width: 8px; height: 8px; background-image: url('{path
				? path
				: './'}logo_cut_small.png'); background-position: -{pos.j * 8}px -{pos.i * 8}px;"
			in:fly={{ x: pos.j < pos.i ? -200 : 200, y: pos.j > pos.i ? -200 : 200, duration: 300 }}
		></div>
	{/each}
</div>
