<script lang="ts">
	import IconStar from '@lucide/svelte/icons/star';

	let { startRating = 0, onchange } = $props<{
		startRating?: number;
		onchange?: (rating: number) => void | Promise<void>;
	}>();

	let rating = $state<number>(startRating);

	function onclick(i: number) {
		rating = i;
		startRating = i;
		onchange?.(i);
	}
</script>

{#snippet renderStar(i: number)}
	<IconStar
		class="cursor-pointer pr-1 transition-all hover:text-c-warning {rating >= i
			? 'text-c-warning'
			: 'text-s-gray-200'}"
		onmouseenter={() => {
			rating = i;
		}}
		onmouseleave={() => {
			rating = startRating;
		}}
		onclick={() => {
			onclick(i);
		}}
	/>
{/snippet}

<div class="flex flex-row gap-0">
	{@render renderStar(1)}
	{@render renderStar(2)}
	{@render renderStar(3)}
	{@render renderStar(4)}
	{@render renderStar(5)}
</div>
