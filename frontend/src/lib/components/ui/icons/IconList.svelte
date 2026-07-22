<script lang="ts">
	let { selected = false } = $props<{ selected: boolean }>();
</script>

{#snippet row()}
	<div class="flex h-full w-full flex-col items-center justify-between gap-1 py-1">
		<div
			class="h-1 w-full rounded-sm"
			class:bg-c-neutral-3={!selected}
			class:bg-c-neutral-7={selected}
		></div>
		{@render column()}
		{@render column()}
	</div>
{/snippet}

{#snippet column()}
	<div
		class="mr-1 ml-1 h-[1px] w-full rounded-sm"
		class:bg-c-neutral-3={!selected}
		class:bg-c-neutral-7={selected}
	></div>
{/snippet}

<div class="flex size-6 flex-col items-center justify-center gap-1">
	{@render row()}
</div>
