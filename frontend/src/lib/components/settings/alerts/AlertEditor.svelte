<script lang="ts">
	import type { Alert, TrackerAlertRule } from '$lib/types/alert';
	import type { CheckInTracker } from '$lib/types/check_in';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getAlerts } from '$lib/state/Alerts.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import { trackerLabel } from '$lib/helpers/CheckInHelper';
	import AlertService from '$lib/services/AlertService';
	import TrackerGlyph from '$lib/components/check-in/TrackerGlyph.svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';

	// Only alerts on a tracker are edited here; goal alerts belong to their goal.
	let { alert = null, onClose }: { alert?: Alert | null; onClose: () => void } = $props();

	const checkInData = getCheckInData();
	const alerts = getAlerts();
	const ts = getTranslation();
	const alertService = new AlertService();
	const SECTION_TITLE = 'mb-1 text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4';
	const title = alert ? ts.get.alerts.edit_alert : ts.get.alerts.new_alert;

	let trackerId = $state<number | null>(alert?.check_in_tracker_id ?? checkInData.activeTrackers[0]?.id ?? null);
	let rule = $state<TrackerAlertRule>(startingRule());
	let threshold = $state<number | null>(alert?.threshold ?? null);
	let days = $state<number | null>(alert?.days ?? 7);
	let confirmingDelete = $state<boolean>(false);
	const saving = new SaveAction(() => ts.get.alerts.save_error);

	const tracker = $derived<CheckInTracker | null>(checkInData.trackers.find((t) => t.id === trackerId) ?? null);
	const bounds = $derived(tracker ? alertService.thresholdBounds(tracker.type) : null);
	const canSave = $derived(tracker !== null && alertService.isValid(tracker.type, rule, threshold, days));

	function startingRule(): TrackerAlertRule {
		if (alert) return alert.rule as TrackerAlertRule;

		const firstTracker = checkInData.activeTrackers[0];
		return firstTracker ? alertService.rules(firstTracker.type)[0] : 'average_below';
	}

	function trackerOptions(): { label: string; value: string }[] {
		return checkInData.activeTrackers.map((t) => ({ label: trackerLabel(t, ts.get.checkIn), value: String(t.id) }));
	}

	function ruleOptions(): { label: string; value: string }[] {
		const labels: Record<TrackerAlertRule, string> = {
			average_below: ts.get.alerts.rule_average_below,
			average_above: ts.get.alerts.rule_average_above,
			no_entry_days: ts.get.alerts.rule_no_entry_days,
			entry_days: ts.get.alerts.rule_entry_days
		};
		return tracker ? alertService.rules(tracker.type).map((r) => ({ label: labels[r], value: r })) : [];
	}

	function chooseTracker(value: string): void {
		trackerId = Number(value);
		if (!tracker) return;

		const rules = alertService.rules(tracker.type);
		if (!rules.includes(rule)) rule = rules[0];
	}

	async function run(action: () => Promise<boolean>): Promise<void> {
		if (await saving.runIfIdle(action)) onClose();
	}

	function save(): void {
		if (!canSave || tracker === null || days === null) return;

		const request = { rule, threshold: alertService.isAverage(rule) ? threshold : null, days };
		void run(() =>
			alert
				? alerts.update(alert, request)
				: alerts.create({ ...request, source: 'check_in_tracker', check_in_tracker_id: tracker.id })
		);
	}

	function remove(): void {
		confirmingDelete = false;
		if (alert) void run(() => alerts.delete(alert));
	}
</script>

<ContentModal {onClose} {title} rounded="2xl" p="4">
	<div class="flex w-full flex-col gap-5">
		<div>
			<p class={SECTION_TITLE}>{ts.get.alerts.tracker}</p>
			{#if alert && tracker}
				<div class="flex items-center gap-2">
					<TrackerGlyph {tracker} class="size-4 text-c-neutral-4 dark:text-c-neutral-5" />
					<span>{trackerLabel(tracker, ts.get.checkIn)}</span>
				</div>
			{:else}
				<Select value={String(trackerId)} options={trackerOptions()} onchange={chooseTracker} ariaLabel={ts.get.alerts.tracker} />
			{/if}
		</div>

		{#if tracker && bounds}
			<div>
				<p class={SECTION_TITLE}>{ts.get.alerts.rule}</p>
				<div class="flex flex-wrap items-center gap-2">
					<div class="w-48">
						<Select value={rule} options={ruleOptions()} onchange={(value) => (rule = value as TrackerAlertRule)} ariaLabel={ts.get.alerts.rule} />
					</div>
					{#if alertService.isAverage(rule)}
						<div class="w-20">
							<NumberInput bind:value={threshold} min={bounds.min} max={bounds.max} step={bounds.step} placeholder={ts.get.alerts.threshold} class="h-10" />
						</div>
						<span class="text-sm">{ts.get.alerts.over}</span>
					{/if}
					<div class="w-20"><NumberInput bind:value={days} min={1} max={AlertService.MAX_DAYS} step={1} class="h-10" /></div>
					<span class="text-sm">{ts.get.alerts.days}</span>
				</div>
			</div>
		{/if}

		<div class="flex items-center justify-between gap-2">
			{#if alert}
				<TextButton title={ts.get.alerts.delete_alert} type="plain" class="text-c-danger" onclick={() => (confirmingDelete = true)} />
			{:else}
				<span></span>
			{/if}
			<TextButton title={alert ? ts.get.layout.save : ts.get.alerts.new_alert} disabled={!canSave || saving.busy} onclick={save} />
		</div>
	</div>
</ContentModal>

{#if confirmingDelete}
	<ConfirmationModal
		type="confirm-delete"
		title={ts.get.alerts.delete_alert}
		description={ts.get.alerts.delete_alert_question}
		onConfirm={remove}
		onCancel={() => (confirmingDelete = false)}
	/>
{/if}
