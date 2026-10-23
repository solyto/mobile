<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { Budget } from '$lib/types/finance';
	import { europeanFormat } from '$lib/helpers/NumberHelper.js';
	import IconTrash from '@lucide/svelte/icons/trash-2';
	import IconPen from '@lucide/svelte/icons/pen';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getFinances } from '$lib/state/Finances.svelte';

	const loadingIndicator = getLoadingIndicator();
	const finances = getFinances();

	let { budget, sectionTotal, onOpenHistory }: {
		budget: Budget;
		sectionTotal: number;
		onOpenHistory: (budget: Budget) => void | Promise<void>;
	} = $props();

	async function onDelete(budget: Budget): Promise<void> {
		loadingIndicator.start();
		await finances.deleteBudget(budget);
		loadingIndicator.stop();
	}

	function getShare(): number {
		if (sectionTotal <= 0) return 0;
		return (budget.value / sectionTotal) * 100;
	}
</script>

<div
	class="group -mx-2 flex cursor-pointer flex-col rounded-md px-2 py-1 transition-all hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
	onclick={() => onOpenHistory(budget)}
>
	<div class="flex w-full flex-row items-center justify-between">
		<div class="text-lg">{budget.title}</div>
		<div class="flex items-center gap-4">
			<div class="hidden items-center gap-2 transition-all md:flex md:opacity-0 md:group-hover:opacity-100">
				<button
					class="cursor-pointer"
					onclick={(e) => {
						e.stopPropagation();
						onOpenHistory(budget);
					}}
				>
					<IconPen class="size-5 text-c-neutral-3 transition-all hover:text-c-action" />
				</button>
				<button
					class="cursor-pointer"
					onclick={(e) => {
						e.stopPropagation();
						onDelete(budget);
					}}
				>
					<IconTrash class="size-5 text-c-neutral-3 transition-all hover:text-c-danger" />
				</button>
			</div>
			<div class="text-lg tabular-nums">
				{budget.type === 'income' ? '+ ' : '- '}{europeanFormat(budget.value)}
			</div>
		</div>
	</div>
	<div
		class="mt-0.5 h-1 rounded-full bg-c-neutral-2 dark:bg-s-dark-3"
		style="width: {getShare()}%"
		in:slide|global={{ axis: 'x' }}
	></div>
</div>
