<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { WealthField } from '$lib/types/finance';
	import IconTrash from '$lib/icons/lucide/trash.svelte';
	import IconPen from '$lib/icons/lucide/pen.svelte';
	import GhostIconButton from '$lib/components/ui/buttons/GhostIconButton.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getFinances } from '$lib/state/Finances.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';

	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const finances = getFinances();

	let { wealth, sectionTotal, onOpenHistory, valueFormatter }: {
		wealth: WealthField;
		sectionTotal: number;
		onOpenHistory: (wealth: WealthField) => void;
		valueFormatter: (value: number) => string;
	} = $props();

	let confirmingDelete = $state<boolean>(false);

	function openRowHistory(): void {
		onOpenHistory(wealth);
	}

	function openHistory(event?: MouseEvent): void {
		event?.stopPropagation();
		onOpenHistory(wealth);
	}

	function askDelete(event?: MouseEvent): void {
		event?.stopPropagation();
		confirmingDelete = true;
	}

	function cancelDelete(): void {
		confirmingDelete = false;
	}

	async function confirmDelete(): Promise<void> {
		confirmingDelete = false;
		loadingIndicator.start();
		try {
			await finances.deleteWealthField(wealth);
		} finally {
			loadingIndicator.stop();
		}
	}

	function editLabel(): string {
		return ts.get.finances.edit_item.replace('%s', wealth.title);
	}

	function deleteLabel(): string {
		return ts.get.finances.delete_item.replace('%s', wealth.title);
	}

	function getShare(): number {
		const value = wealth.currentValue?.value ?? 0;
		if (sectionTotal <= 0 || value <= 0) return 0;
		return (value / sectionTotal) * 100;
	}
</script>

<div
	class="group -mx-2 flex cursor-pointer flex-col rounded-md px-2 py-1 transition-all hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
	onclick={openRowHistory}
>
	<div class="flex w-full flex-row items-center justify-between">
		<div class="text-lg">{wealth.title}</div>
		<div class="flex items-center gap-4">
			<div class="hidden items-center gap-2 transition-all md:flex md:opacity-0 md:group-hover:opacity-100">
				<GhostIconButton label={editLabel()} onclick={openHistory} color="text-c-neutral-3" class="-my-1">
					<IconPen class="size-5" />
				</GhostIconButton>
				<GhostIconButton label={deleteLabel()} onclick={askDelete} color="text-c-neutral-3" class="-my-1">
					<IconTrash class="size-5" />
				</GhostIconButton>
			</div>
			<div class="text-lg tabular-nums">
				{valueFormatter(wealth.currentValue?.value ?? 0)}
			</div>
		</div>
	</div>
	<div
		class="mt-0.5 h-1 rounded-full bg-c-neutral-2 dark:bg-s-dark-3"
		style="width: {getShare()}%"
		in:slide|global={{ axis: 'x' }}
	></div>
</div>
{#if confirmingDelete}
	<ConfirmationModal
		title={deleteLabel()}
		description={ts.get.finances.delete_item_message.replace('%s', wealth.title)}
		type="confirm-delete"
		onConfirm={confirmDelete}
		onCancel={cancelDelete}
	/>
{/if}
