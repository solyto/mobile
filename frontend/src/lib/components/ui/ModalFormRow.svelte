<script lang="ts">
	import type { Snippet } from 'svelte';
	let { label, children }: {
		label: string;
		children: Snippet;
	} = $props();
</script>

<div class="flex w-full flex-row items-center gap-2">
	<span class="w-1/3 text-sm font-bold">{label}</span>
	<div class="w-2/3">
		{@render children?.()}
	</div>
</div>
