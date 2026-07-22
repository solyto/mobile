<script lang="ts">
	let { selected = false } = $props<{ selected: boolean }>();
</script>

{#snippet row()}
	<div class="flex h-1/3 w-full items-center justify-between gap-1">
		{@render column()}
		{@render column()}
		{@render column()}
		{@render column()}
	</div>
{/snippet}

{#snippet column()}
	<div
		class="size-1 w-1/4 rounded-sm"
		class:bg-c-neutral-3={!selected}
		class:bg-c-neutral-7={selected}
	></div>
{/snippet}

<div class="flex size-6 flex-col items-center justify-center gap-1">
	{@render row()}
	{@render row()}
	{@render row()}
</div>
