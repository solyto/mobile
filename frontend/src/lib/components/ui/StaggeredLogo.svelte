<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	const x = 7;
	const y = 9;

	let tiles = $state<number[]>([]);

	let { path = null }: { path?: string | null } = $props();

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

	function tileBackgroundImage(): string {
		return `url('${path || './'}logo_cut_small.png')`;
	}

	function tileBackgroundPosition(tile: number): string {
		const { i, j } = getTilePosition(tile);
		return `-${j * 8}px -${i * 8}px`;
	}

	function tileFly(tile: number) {
		const { i, j } = getTilePosition(tile);
		return { x: j < i ? -200 : 200, y: j > i ? -200 : 200, duration: 300 };
	}
</script>

<div class="flex flex-wrap gap-0" style="width: {x * 8}px;">
	{#each tiles as tile (tile)}
		<div
			style="
				width: 8px;
				height: 8px;
				background-image: {tileBackgroundImage()};
				background-position: {tileBackgroundPosition(tile)};
			"
			in:fly={tileFly(tile)}
		></div>
	{/each}
</div>
