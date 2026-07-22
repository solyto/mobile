<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import DateTimeInput from '$lib/components/forms/DateTimeInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconChevronDown from '@lucide/svelte/icons/chevron-down';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import type { TimeTrackingEntry, UpdateTimeTrackingEntryRequest } from '$lib/types/time_tracking';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let { entry, onClose } = $props<{
		entry: TimeTrackingEntry;
		onClose: () => void;
	}>();

	type DurationUnit = 'minutes' | 'hours';

	const initialMinutes = entry.duration_minutes;
	const initialUnit: DurationUnit = initialMinutes % 60 === 0 && initialMinutes >= 60 ? 'hours' : 'minutes';
	const initialAmount = initialUnit === 'hours' ? initialMinutes / 60 : initialMinutes;

	let description = $state<string>(entry.description ?? '');
	let durationAmount = $state<number>(initialAmount);
	let durationUnit = $state<DurationUnit>(initialUnit);
	let projectId = $state<string>(entry.project?.id ?? (tt.projects.length > 0 ? tt.projects[0].id : ''));
	let showExactTimes = $state<boolean>(false);
	let startedAt = $state<string>(entry.started_at.slice(0, 16));
	let stoppedAt = $state<string>(entry.stopped_at ? entry.stopped_at.slice(0, 16) : '');
	let startInput = $state<HTMLInputElement | null>(null);
	let stopInput = $state<HTMLInputElement | null>(null);

	let projectOptions = $derived(
		tt.projects.map((p) => ({ label: p.title, value: p.id }))
	);

	let unitOptions: { label: string; value: DurationUnit }[] = [
		{ label: ts.get.timeTracking.minutes, value: 'minutes' },
		{ label: ts.get.timeTracking.hours, value: 'hours' }
	];

	let durationMinutes = $derived(
		durationUnit === 'hours' ? Math.round(durationAmount * 60) : Math.round(durationAmount)
	);

	function computeDurationFromTimes(): void {
		if (startedAt && stoppedAt) {
			const start = new Date(startedAt).getTime();
			const stop = new Date(stoppedAt).getTime();
			if (stop > start) {
				const mins = Math.round((stop - start) / 60000);
				durationUnit = 'minutes';
				durationAmount = mins;
			}
		}
	}

	async function onSave(): Promise<void> {
		if (!projectId || durationMinutes <= 0) return;

		loadingIndicator.start();

		const request: UpdateTimeTrackingEntryRequest = {
			description: description || null,
			duration_minutes: durationMinutes,
			project_id: projectId
		};

		if (showExactTimes && startedAt && stoppedAt) {
			request.started_at = new Date(startedAt).toISOString();
			request.stopped_at = new Date(stoppedAt).toISOString();
		}

		const res = await tt.updateEntry(entry.id, request);
		if (res) onClose();

		loadingIndicator.stop();
	}
</script>

<ContentModal title={ts.get.timeTracking.edit_entry} rounded="2xl" p="8" {onClose}>
	<div class="flex flex-col gap-3">
		<div class="flex flex-col gap-1">
			<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.timeTracking.project}
			</span>
			<Select bind:value={projectId} options={projectOptions} />
		</div>
		<div class="flex flex-col gap-1">
			<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.timeTracking.description}
			</span>
			<TextInput bind:value={description} placeholder={ts.get.timeTracking.description} />
		</div>
		<div class="flex flex-col gap-1">
			<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.timeTracking.duration}
			</span>
			<div class="flex flex-row gap-2">
				<input
					type="number"
					bind:value={durationAmount}
					min="0"
					step="any"
					placeholder="0"
					class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary"
				/>
				<Select bind:value={durationUnit} options={unitOptions} />
			</div>
		</div>
		<button
			class="flex cursor-pointer flex-row items-center gap-1 text-xs text-c-neutral-4 transition-colors hover:text-c-neutral-6 dark:hover:text-c-neutral-3"
			onclick={() => (showExactTimes = !showExactTimes)}
		>
			<IconChevronDown class="size-3.5 transition-transform {showExactTimes ? 'rotate-180' : ''}" />
			{ts.get.timeTracking.started_at} / {ts.get.timeTracking.stopped_at}
		</button>
		{#if showExactTimes}
			<div class="flex flex-col gap-3">
				<div class="flex flex-col gap-1">
					<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
						{ts.get.timeTracking.started_at}
					</span>
					<DateTimeInput bind:input={startInput} bind:value={startedAt} oninput={computeDurationFromTimes} />
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
						{ts.get.timeTracking.stopped_at}
					</span>
					<DateTimeInput bind:input={stopInput} bind:value={stoppedAt} oninput={computeDurationFromTimes} />
				</div>
			</div>
		{/if}
		<div class="mt-4 flex w-full justify-end">
			<TextButton title={ts.get.layout.save} onclick={onSave} />
		</div>
	</div>
</ContentModal>
