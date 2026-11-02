<script lang="ts">
	import type { Snippet } from 'svelte';
	let { label, children }: {
		label: string;
		children: Snippet;
	} = $props();
</script>

<div class="flex w-full flex-row items-center gap-2">
	<span class="w-1/3 shrink-0 text-sm font-bold">{label}</span>
	<div class="min-w-0 flex-1">
		{@render children?.()}
	</div>
</div>
