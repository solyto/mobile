<script lang="ts">
	import type { GoalLine } from '$lib/types/goal';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconCheck from '$lib/icons/lucide/check.svelte';

	let { line }: { line: GoalLine } = $props();

	const ts = getTranslation();
</script>

<div class="flex items-center gap-1 text-xs text-c-neutral-5 dark:text-c-neutral-4">
	<span>{line.text}</span>
	{#if line.met}
		<IconCheck class="size-3.5 text-c-success" aria-label={ts.get.checkIn.goal_met} />
	{/if}
</div>
