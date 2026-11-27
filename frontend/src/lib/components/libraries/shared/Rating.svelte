<script lang="ts">
	import IconStar from '$lib/icons/lucide/star.svelte';

	let { startRating = 0, onchange }: {
		startRating?: number;
		onchange?: (rating: number) => void | Promise<void>;
	} = $props();

	const STARS = [1, 2, 3, 4, 5];

	let rating = $state<number>(startRating);

	function select(i: number): void {
		rating = i;
		startRating = i;
		onchange?.(i);
	}

	function highlight(i: number): void {
		rating = i;
	}

	function resetHighlight(): void {
		rating = startRating;
	}

	function starColor(i: number): string {
		return rating >= i ? 'text-c-warning' : 'text-s-gray-200';
	}
</script>

<div class="flex flex-row gap-0">
	{#each STARS as i (i)}
		<IconStar
			class="cursor-pointer pr-1 transition-all hover:text-c-warning {starColor(i)}"
			onmouseenter={() => highlight(i)}
			onmouseleave={resetHighlight}
			onclick={() => select(i)}
		/>
	{/each}
</div>
