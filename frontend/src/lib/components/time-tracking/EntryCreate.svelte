<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import DateInput from '$lib/components/forms/DateInput.svelte';
	import DateTimeInput from '$lib/components/forms/DateTimeInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconChevronDown from '$lib/icons/lucide/chevron-down.svelte';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import type { CreateTimeTrackingEntryRequest, TimeTrackingEntry } from '$lib/types/time_tracking';
	import { getUrlFormat } from '$lib/helpers/DateHelper';
	import {
		durationInMinutes,
		durationOnlyTimestamps,
		minutesBetween,
		splitDuration,
		toDateTimeInputValue,
		type DurationUnit
	} from '$lib/helpers/TimeTrackingHelper';

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

	const initialDuration = splitDuration(entry?.duration_minutes ?? 0);

	let description = $state<string>(entry?.description ?? '');
	let durationAmount = $state<number>(initialDuration.amount);
	let durationUnit = $state<DurationUnit>(initialDuration.unit);
	let date = $state<string>(getUrlFormat(entry ? new Date(entry.started_at) : new Date()));
	let showExactTimes = $state<boolean>(!!entry?.has_exact_times);
	let startedAt = $state<string>(entry?.has_exact_times ? toDateTimeInputValue(entry.started_at) : '');
	let stoppedAt = $state<string>(entry?.has_exact_times && entry.stopped_at ? toDateTimeInputValue(entry.stopped_at) : '');
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

	let durationMinutes = $derived(hasExactTimes ? minutesBetween(startedAt, stoppedAt) : durationInMinutes(durationAmount, durationUnit));

	let isValid = $derived(!!projectId && durationMinutes > 0 && (!showExactTimes || hasExactTimes));

	function timestamps(): { started_at: string; stopped_at: string } {
		if (!hasExactTimes) return durationOnlyTimestamps(date, durationMinutes);
		return { started_at: new Date(startedAt).toISOString(), stopped_at: new Date(stoppedAt).toISOString() };
	}

	function toggleExactTimes(): void {
		showExactTimes = !showExactTimes;
	}

	async function onSave(): Promise<void> {
		if (!isValid) return;

		const request: CreateTimeTrackingEntryRequest = {
			description: description.trim() || null,
			...timestamps(),
			duration_minutes: durationMinutes,
			has_exact_times: hasExactTimes,
			project_id: projectId
		};

		loadingIndicator.start();
		try {
			if (entry) await tt.updateEntry(entry.id, request);
			else await tt.createEntry(request);
		} finally {
			loadingIndicator.stop();
		}
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
			onclick={toggleExactTimes}
		>
			<IconChevronDown class="size-3.5 transition-transform {showExactTimes ? 'rotate-180' : ''}" />
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
