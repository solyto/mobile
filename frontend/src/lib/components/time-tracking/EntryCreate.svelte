<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import DateInput from '$lib/components/forms/DateInput.svelte';
	import DateTimeInput from '$lib/components/forms/DateTimeInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconChevronDown from '@lucide/svelte/icons/chevron-down';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import type {
		CreateTimeTrackingEntryRequest,
		TimeTrackingEntry,
		UpdateTimeTrackingEntryRequest
	} from '$lib/types/time_tracking';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let {
		onClose,
		projectId: initialProjectId = null,
		entry = null
	}: {
		onClose: () => void;
		projectId?: string | null;
		entry?: TimeTrackingEntry | null;
	} = $props();

	type DurationUnit = 'minutes' | 'hours';

	function toLocalDateValue(date: Date): string {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	function toLocalDateTimeValue(iso: string): string {
		const date = new Date(iso);
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		const h = String(date.getHours()).padStart(2, '0');
		const min = String(date.getMinutes()).padStart(2, '0');
		return `${y}-${m}-${d}T${h}:${min}`;
	}

	const initialMinutes = entry?.duration_minutes ?? 0;
	const initialUnit: DurationUnit =
		initialMinutes >= 60 && initialMinutes % 60 === 0 ? 'hours' : 'minutes';
	const initialAmount = initialUnit === 'hours' ? initialMinutes / 60 : initialMinutes;

	let description = $state<string>(entry?.description ?? '');
	let durationAmount = $state<number>(initialAmount);
	let durationUnit = $state<DurationUnit>(initialUnit);
	let date = $state<string>(
		entry ? toLocalDateValue(new Date(entry.started_at)) : toLocalDateValue(new Date())
	);
	let showExactTimes = $state<boolean>(!!entry?.has_exact_times);
	let startedAt = $state<string>(
		entry?.has_exact_times ? toLocalDateTimeValue(entry.started_at) : ''
	);
	let stoppedAt = $state<string>(
		entry?.has_exact_times && entry.stopped_at ? toLocalDateTimeValue(entry.stopped_at) : ''
	);
	// No silent default to the first project: the user must pick one.
	let projectId = $state<string>(entry?.project?.id ?? initialProjectId ?? '');

	let projectOptions = $derived([
		{ label: '—', value: '' },
		...tt.projects.map((p) => ({ label: p.title, value: p.id }))
	]);

	let unitOptions: { label: string; value: DurationUnit }[] = [
		{ label: ts.get.timeTracking.minutes, value: 'minutes' },
		{ label: ts.get.timeTracking.hours, value: 'hours' }
	];

	let hasExactTimes = $derived(showExactTimes && !!startedAt && !!stoppedAt);

	let durationMinutes = $derived.by(() => {
		if (hasExactTimes) {
			const start = new Date(startedAt).getTime();
			const stop = new Date(stoppedAt).getTime();
			if (stop > start) return Math.round((stop - start) / 60000);
			return 0;
		}
		return durationUnit === 'hours' ? Math.round(durationAmount * 60) : Math.round(durationAmount);
	});

	let isValid = $derived(
		!!projectId &&
			(showExactTimes
				? !!startedAt && !!stoppedAt && durationMinutes > 0
				: durationMinutes > 0)
	);

	function buildTimestamps(): { started_at: string; stopped_at: string } {
		if (hasExactTimes) {
			return {
				started_at: new Date(startedAt).toISOString(),
				stopped_at: new Date(stoppedAt).toISOString()
			};
		}
		// Duration-only entries are anchored to a defined local time (noon) on
		// the chosen day, so the entry always lands on the day the user picked
		// and never rolls into the previous calendar day.
		const [y, m, d] = date.split('-').map(Number);
		const start = new Date(y, m - 1, d, 12, 0, 0, 0);
		const stop = new Date(start.getTime() + durationMinutes * 60000);
		return { started_at: start.toISOString(), stopped_at: stop.toISOString() };
	}

	async function onSave(): Promise<void> {
		if (!isValid) return;

		loadingIndicator.start();

		const timestamps = buildTimestamps();
		const request: CreateTimeTrackingEntryRequest & UpdateTimeTrackingEntryRequest = {
			description: description.trim() || null,
			started_at: timestamps.started_at,
			stopped_at: timestamps.stopped_at,
			duration_minutes: durationMinutes,
			has_exact_times: hasExactTimes,
			project_id: projectId
		};

		if (entry) {
			await tt.updateEntry(entry.id, request);
		} else {
			await tt.createEntry(request as CreateTimeTrackingEntryRequest);
		}

		loadingIndicator.stop();
		onClose();
	}
</script>

<ContentModal
	title={entry ? ts.get.timeTracking.edit_entry : ts.get.timeTracking.manual_entry}
	rounded="2xl"
	p="8"
	{onClose}
>
	<div class="flex flex-col gap-3">
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.timeTracking.project}
			</span>
			<Select bind:value={projectId} options={projectOptions} />
		</label>
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.timeTracking.description}
			</span>
			<TextInput bind:value={description} placeholder={ts.get.timeTracking.description} />
		</label>
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.timeTracking.duration}
			</span>
			<div class="flex flex-row gap-2">
				<NumberInput bind:value={durationAmount} placeholder="0" min={0} step="any" />
				<Select bind:value={durationUnit} options={unitOptions} />
			</div>
		</label>
		{#if !showExactTimes}
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
					{ts.get.timeTracking.date_range}
				</span>
				<DateInput bind:value={date} />
			</label>
		{/if}
		<button
			class="flex cursor-pointer flex-row items-center gap-1 text-xs text-c-neutral-4 transition-colors hover:text-c-neutral-6 dark:hover:text-c-neutral-3"
			onclick={() => (showExactTimes = !showExactTimes)}
		>
			<IconChevronDown
				class="size-3.5 transition-transform {showExactTimes ? 'rotate-180' : ''}"
			/>
			{ts.get.timeTracking.started_at} / {ts.get.timeTracking.stopped_at}
		</button>
		{#if showExactTimes}
			<div class="flex flex-col gap-3">
				<label class="flex flex-col gap-1">
					<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
						{ts.get.timeTracking.started_at}
					</span>
					<DateTimeInput input={null} bind:value={startedAt} />
				</label>
				<label class="flex flex-col gap-1">
					<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
						{ts.get.timeTracking.stopped_at}
					</span>
					<DateTimeInput input={null} bind:value={stoppedAt} />
				</label>
			</div>
		{/if}
		<div class="mt-4 flex w-full justify-end">
			<TextButton title={ts.get.layout.save} onclick={onSave} disabled={!isValid} />
		</div>
	</div>
</ContentModal>
