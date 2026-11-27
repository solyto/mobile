<script lang="ts">
	import type { Goal, GoalComparison, GoalPeriod } from '$lib/types/goal';
	import type { CheckInTracker } from '$lib/types/check_in';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getGoals } from '$lib/state/Goals.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import { trackerLabel } from '$lib/helpers/CheckInHelper';
	import GoalService from '$lib/services/GoalService';
	import TrackerGlyph from '$lib/components/check-in/TrackerGlyph.svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';

	let { goal = null, onClose }: { goal?: Goal | null; onClose: () => void } = $props();

	const checkInData = getCheckInData();
	const goals = getGoals();
	const ts = getTranslation();
	const goalService = new GoalService();

	const available = checkInData.activeTrackers.filter((t) => goals.forTracker(t.id) === null);
	const title = goal ? ts.get.goals.edit_goal : ts.get.goals.new_goal;

	let trackerId = $state<number | null>(goal?.check_in_tracker_id ?? available[0]?.id ?? null);
	let comparison = $state<GoalComparison>(goal?.comparison ?? 'at_least');
	let target = $state<number | null>(goal?.target ?? null);
	let period = $state<GoalPeriod>(goal?.period ?? 'week');
	let notify = $state<boolean>(goal?.notify_when_reached ?? false);
	let confirmingDelete = $state<boolean>(false);
	const saving = new SaveAction(() => ts.get.goals.save_error);

	const tracker = $derived<CheckInTracker | null>(checkInData.trackers.find((t) => t.id === trackerId) ?? null);
	const bounds = $derived(tracker ? goalService.bounds(tracker.type, period) : null);
	const canSave = $derived(tracker !== null && goalService.isValidTarget(tracker.type, period, target));

	function trackerOptions(): { label: string; value: string }[] {
		return available.map((t) => ({ label: trackerLabel(t, ts.get.checkIn), value: String(t.id) }));
	}

	function comparisonOptions(): { label: string; value: string }[] {
		return [
			{ label: ts.get.goals.at_least, value: 'at_least' },
			{ label: ts.get.goals.at_most, value: 'at_most' }
		];
	}

	function periodOptions(): { label: string; value: string }[] {
		const labels = { day: ts.get.goals.per_day, week: ts.get.goals.per_week, month: ts.get.goals.per_month };
		return tracker ? goalService.periods(tracker.type).map((p) => ({ label: labels[p], value: p })) : [];
	}

	function chooseTracker(value: string): void {
		trackerId = Number(value);
		if (tracker && !goalService.periods(tracker.type).includes(period)) period = 'week';
	}

	async function run(action: () => Promise<boolean>): Promise<void> {
		if (await saving.runIfIdle(action)) onClose();
	}

	function save(): void {
		if (!canSave || tracker === null || target === null) return;

		const request = { period, comparison, target, notify_when_reached: notify };
		void run(() =>
			goal
				? goals.update(goal, request)
				: goals.create({ ...request, source: 'check_in_tracker', check_in_tracker_id: tracker.id })
		);
	}

	function remove(): void {
		confirmingDelete = false;
		if (goal) void run(() => goals.delete(goal));
	}
</script>

<ContentModal {onClose} {title} rounded="2xl" p="4">
	<div class="flex w-full flex-col gap-5">
		{#if !goal && available.length === 0}
			<p class="text-sm">{ts.get.goals.no_trackers_left}</p>
		{:else}
			<div>
				{#if goal && tracker}
					<div class="flex items-center gap-2">
						<TrackerGlyph {tracker} class="size-4 text-c-neutral-4 dark:text-c-neutral-5" />
						<span>{trackerLabel(tracker, ts.get.checkIn)}</span>
					</div>
				{:else}
					<Select value={String(trackerId)} options={trackerOptions()} onchange={chooseTracker} ariaLabel={ts.get.goals.tracker} />
				{/if}
			</div>

			{#if tracker && bounds}
				<div>
					<div class="flex flex-wrap items-center gap-2">
						<div class="w-32">
							<Select
								value={comparison}
								options={comparisonOptions()}
								onchange={(value) => (comparison = value as GoalComparison)}
								ariaLabel={ts.get.goals.target}
							/>
						</div>
						<div class="w-20"><NumberInput bind:value={target} min={bounds.min} max={bounds.max} step={bounds.step} class="h-10" /></div>
						{#if goalService.countsDays(tracker.type)}
							<span class="text-sm">{ts.get.goals.unit_days}</span>
						{:else if tracker.type === 'scale'}
							<span class="text-sm">{ts.get.goals.unit_average}</span>
						{/if}
						<div class="w-32">
							<Select value={period} options={periodOptions()} onchange={(value) => (period = value as GoalPeriod)} ariaLabel={ts.get.goals.target} />
						</div>
					</div>
				</div>

				<Toggle checked={notify} label={ts.get.goals.notify_when_reached} onchange={(value) => (notify = value)} />
			{/if}

			<div class="flex items-center justify-between gap-2">
				{#if goal}
					<TextButton title={ts.get.goals.delete_goal} type="plain" class="text-c-danger" onclick={() => (confirmingDelete = true)} />
				{:else}
					<span></span>
				{/if}
				<TextButton title={goal ? ts.get.layout.save : ts.get.goals.new_goal} disabled={!canSave || saving.busy} onclick={save} />
			</div>
		{/if}
	</div>
</ContentModal>

{#if confirmingDelete && tracker}
	<ConfirmationModal
		type="confirm-delete"
		title={ts.get.goals.delete_goal}
		description={ts.get.goals.delete_goal_question.replace('%s', trackerLabel(tracker, ts.get.checkIn))}
		onConfirm={remove}
		onCancel={() => (confirmingDelete = false)}
	/>
{/if}
