<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { WealthField } from '$lib/types/finance';
	import { europeanFormat } from '$lib/helpers/NumberHelper.js';
	import IconTrash from '@lucide/svelte/icons/trash-2';
	import IconPen from '@lucide/svelte/icons/pen';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getFinances } from '$lib/state/Finances.svelte';

	const loadingIndicator = getLoadingIndicator();
	const finances = getFinances();

	let { wealth, sectionTotal, onOpenHistory }: {
		wealth: WealthField;
		sectionTotal: number;
		onOpenHistory: (wealth: WealthField) => void;
	} = $props();

	async function onDelete(wealth: WealthField): Promise<void> {
		loadingIndicator.start();
		await finances.deleteWealthField(wealth);
		loadingIndicator.stop();
	}

	function getShare(): number {
		const value = wealth.currentValue?.value ?? 0;
		if (sectionTotal <= 0 || value <= 0) return 0;
		return (value / sectionTotal) * 100;
	}
</script>

<div
	class="group -mx-2 flex cursor-pointer flex-col rounded-md px-2 py-1 transition-all hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
	onclick={() => onOpenHistory(wealth)}
>
	<div class="flex w-full flex-row items-center justify-between">
		<div class="text-lg">{wealth.title}</div>
		<div class="flex items-center gap-4">
			<div class="hidden items-center gap-2 transition-all md:flex md:opacity-0 md:group-hover:opacity-100">
				<button
					class="cursor-pointer"
					onclick={(e) => {
						e.stopPropagation();
						onOpenHistory(wealth);
					}}
				>
					<IconPen class="size-5 text-c-neutral-3 transition-all hover:text-c-action" />
				</button>
				<button
					class="cursor-pointer"
					onclick={(e) => {
						e.stopPropagation();
						onDelete(wealth);
					}}
				>
					<IconTrash class="size-5 text-c-neutral-3 transition-all hover:text-c-danger" />
				</button>
			</div>
			<div class="text-lg tabular-nums">
				{wealth.currentValue ? europeanFormat(wealth.currentValue.value) : 0}
			</div>
		</div>
	</div>
	<div
		class="mt-0.5 h-1 rounded-full bg-c-neutral-2 dark:bg-s-dark-3"
		style="width: {getShare()}%"
		in:slide|global={{ axis: 'x' }}
	></div>
</div>
