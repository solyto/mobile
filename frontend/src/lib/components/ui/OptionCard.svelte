<script lang="ts">
	let {
		label,
		hint = null,
		selected = null,
		stripeColor = null,
		onclick
	}: {
		label: string;
		hint?: string | null;
		// null: a plain choice without a selected state.
		selected?: boolean | null;
		// A fixed CSS colour for the stripe; without one the stripe shows the selected state.
		stripeColor?: string | null;
		onclick: () => void;
	} = $props();

	const isSelected = $derived(selected === true);
</script>

<button
	type="button"
	class="relative w-full cursor-pointer rounded-lg border-1 border-c-neutral-1 bg-c-bg-surface text-left shadow-sm transition-all hover:bg-c-neutral dark:border-s-dark-2 dark:hover:bg-s-dark-3"
	class:bg-c-neutral={isSelected}
	class:dark:bg-s-dark-3={isSelected}
	aria-pressed={selected ?? undefined}
	{onclick}
>
	<div
		class="absolute top-2 bottom-2 left-3 w-1 rounded-lg"
		class:bg-c-btn={stripeColor === null && isSelected}
		class:bg-c-neutral-2={stripeColor === null && !isSelected}
		class:dark:bg-s-dark-2={stripeColor === null && !isSelected}
		style:background-color={stripeColor}
	></div>
	<div class="ml-4 px-4 py-2">
		<span class="block">{label}</span>
		{#if hint}
			<span class="block text-xs text-c-neutral-5 dark:text-c-neutral-4">{hint}</span>
		{/if}
	</div>
</button>
