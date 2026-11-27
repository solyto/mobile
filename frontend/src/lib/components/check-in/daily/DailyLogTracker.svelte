<script lang="ts">
	import type { CheckInTracker } from '$lib/types/check_in';
	import CheckInTrackerService from '$lib/services/CheckInTrackerService';
	import type { GoalLine } from '$lib/types/goal';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TrackerGlyph from '$lib/components/check-in/TrackerGlyph.svelte';
	import GoalProgressLine from '$lib/components/check-in/daily/GoalProgressLine.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import QuickSelectOverlay from '$lib/components/ui/QuickSelectOverlay.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconMinus from '$lib/icons/lucide/minus.svelte';
	import IconPlus from '$lib/icons/lucide/plus.svelte';

	let { tracker, label, value, goalLine = null, onSet }: {
		tracker: CheckInTracker;
		label: string;
		value: number | null;
		goalLine?: GoalLine | null;
		onSet: (value: number | null) => void;
	} = $props();

	const ts = getTranslation();
	// The app's "slight" icon button style (IconButton type="slight"), kept as a class for the aria labels.
	const STEP_BUTTON =
		'flex size-8 cursor-pointer items-center justify-center rounded-sm bg-c-neutral-1 text-c-neutral-7 transition-all hover:bg-c-neutral-3 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-s-dark-3 dark:text-white dark:hover:bg-s-dark-2';

	let panelOpen = $state<boolean>(false);
	let panelAnchor = $state<HTMLDivElement | null>(null);
	let amount = $state<number | null>(null);

	const total = $derived(value ?? 0);
	const amountValid = $derived(amount !== null && Number.isInteger(amount) && amount >= 0 && amount <= CheckInTrackerService.MAX_COUNT);

	function toggleDone(): void {
		onSet(value === null ? 1 : null);
	}

	function step(offset: 1 | -1): void {
		const next = Math.min(Math.max(total + offset, 0), CheckInTrackerService.MAX_COUNT);
		onSet(next === 0 ? null : next);
	}

	function openPanel(): void {
		amount = total;
		panelOpen = true;
	}

	function apply(event: SubmitEvent): void {
		event.preventDefault();
		if (!amountValid || amount === null) return;

		onSet(amount === 0 ? null : amount);
		panelOpen = false;
	}
</script>

<div class="flex flex-col">
	<div class="flex items-center justify-between gap-4 py-2 2xl:py-1.5">
		<div class="flex min-w-0 items-center gap-3">
			<TrackerGlyph {tracker} class="size-5 shrink-0 self-center text-c-neutral-5 2xl:size-4 dark:text-c-neutral-4" />
			<div class="min-w-0">
				<div class="line-clamp-2 text-lg font-bold break-words 2xl:text-sm 2xl:font-medium 2xl:text-c-neutral-7 dark:2xl:text-c-neutral-3">{label}</div>
				{#if goalLine}
					<GoalProgressLine line={goalLine} />
				{/if}
			</div>
		</div>

		{#if tracker.type === 'yes_no'}
			<!-- Lines up with the 32px − / + buttons of count rows; its border and shadow make it read larger, so it's a bit smaller. -->
			<Checkbox isChecked={value !== null} onchange={toggleDone} ariaLabel={label} boxSize="size-7" markSize="size-4" />
		{:else}
			<div class="relative flex shrink-0 items-center gap-1">
				<div class="absolute top-full right-0" bind:this={panelAnchor}></div>
				<button type="button" class={STEP_BUTTON} disabled={total === 0} aria-label={ts.get.checkIn.count_decrease} onclick={() => step(-1)}>
					<IconMinus class="size-4" />
				</button>
				<button
					type="button"
					class="h-8 min-w-12 cursor-pointer rounded-lg px-2 text-sm font-semibold tabular-nums transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
					aria-expanded={panelOpen}
					onclick={openPanel}
				>
					{total}
				</button>
				<button type="button" class={STEP_BUTTON} disabled={total >= CheckInTrackerService.MAX_COUNT} aria-label={ts.get.checkIn.count_increase} onclick={() => step(1)}>
					<IconPlus class="size-4" />
				</button>
			</div>
		{/if}
	</div>
</div>

{#if panelOpen && panelAnchor}
	<QuickSelectOverlay portal target={panelAnchor} onClose={() => (panelOpen = false)} class="mt-1 w-64 -translate-x-full">
		<form class="flex items-center gap-2" onsubmit={apply}>
			<div class="min-w-0 flex-1">
				<NumberInput bind:value={amount} min={0} max={CheckInTrackerService.MAX_COUNT} step={1} />
			</div>
			<TextButton title={ts.get.layout.save} disabled={!amountValid} />
		</form>
	</QuickSelectOverlay>
{/if}
