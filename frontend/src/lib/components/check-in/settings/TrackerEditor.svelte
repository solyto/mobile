<script lang="ts">
	import type { CheckInTracker, CustomCheckInTrackerType } from '$lib/types/check_in';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import { trackerLabel } from '$lib/helpers/CheckInHelper';
	import TrackerIcon from '$lib/components/check-in/TrackerIcon.svelte';
	import IconPicker from '$lib/components/check-in/settings/IconPicker.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import BackButton from '$lib/components/ui/buttons/BackButton.svelte';
	import OptionCard from '$lib/components/ui/OptionCard.svelte';

	let { tracker = null, onDone }: { tracker?: CheckInTracker | null; onDone: () => void } = $props();

	const checkInData = getCheckInData();
	const ts = getTranslation();
	const TYPES: CustomCheckInTrackerType[] = ['yes_no', 'count', 'scale'];

	const current = $derived(checkInData.trackers.find((t) => t.id === tracker?.id) ?? null);

	let name = $state<string>(tracker?.name ?? '');
	let type = $state<CustomCheckInTrackerType>('yes_no');
	let icon = $state<string | null>(tracker?.icon ?? null);
	let choosingIcon = $state<boolean>(false);
	let confirmingDelete = $state<boolean>(false);
	const saving = new SaveAction(() => ts.get.checkIn.save_error);

	const canSave = $derived(name.trim() !== '');
	const valueCount = $derived(current?.values_count ?? 0);

	function typeLabel(t: CustomCheckInTrackerType | 'sport'): string {
		const labels: Record<CustomCheckInTrackerType | 'sport', string> = {
			scale: ts.get.checkIn.type_scale,
			yes_no: ts.get.checkIn.type_yes_no,
			count: ts.get.checkIn.type_count,
			sport: ts.get.checkIn.sports
		};
		return labels[t];
	}

	function typeHint(t: CustomCheckInTrackerType): string {
		const hints: Record<CustomCheckInTrackerType, string> = {
			scale: ts.get.checkIn.type_scale_hint,
			yes_no: ts.get.checkIn.type_yes_no_hint,
			count: ts.get.checkIn.type_count_hint
		};
		return hints[t];
	}

	function deleteQuestion(tracker: CheckInTracker): string {
		const label = trackerLabel(tracker, ts.get.checkIn);
		return ts.get.checkIn.delete_tracker_question.replace('%s', label).replace('{n}', String(valueCount));
	}

	function chooseIcon(selected: string): void {
		icon = selected;
		choosingIcon = false;
	}

	async function create(): Promise<void> {
		if (!canSave) return;

		const created = await saving.runIfIdle(async () => {
			const tracker = await checkInData.createTracker({ name: name.trim(), type, icon });
			return tracker !== null;
		});
		if (created) onDone();
	}

	async function save(): Promise<void> {
		if (!current || !canSave) return;

		if (await saving.runIfIdle(() => checkInData.updateTracker(current, { name: name.trim(), icon }))) onDone();
	}

	async function remove(): Promise<void> {
		confirmingDelete = false;
		if (current && (await saving.runIfIdle(() => checkInData.deleteTracker(current)))) onDone();
	}
</script>

{#if choosingIcon}
	<div class="flex w-full flex-col gap-3">
		<BackButton title={ts.get.checkIn.choose_icon} onclick={() => (choosingIcon = false)} />
		<IconPicker selected={icon} onSelect={chooseIcon} />
	</div>
{:else}
	<div class="flex w-full flex-col gap-5">
		<div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					class="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-c-neutral-1 text-c-heading transition-all hover:bg-c-neutral dark:border-s-dark-3 dark:text-c-primary dark:hover:bg-s-dark-3"
					title={ts.get.checkIn.choose_icon}
					aria-label={ts.get.checkIn.choose_icon}
					onclick={() => (choosingIcon = true)}
				>
					<TrackerIcon name={icon} class="size-5" />
				</button>
				<TextInput bind:value={name} placeholder={ts.get.checkIn.tracker_name_hint} maxlength={50} />
			</div>
		</div>

		<div>
			{#if current}
				<p class="text-sm">{typeLabel(current.type)}</p>
			{:else}
				<div class="flex flex-col gap-2">
					{#each TYPES as option (option)}
						<OptionCard label={typeLabel(option)} hint={typeHint(option)} selected={type === option} onclick={() => (type = option)} />
					{/each}
				</div>
			{/if}
		</div>

		<div class="flex items-center justify-between gap-2">
			{#if current}
				<TextButton title={ts.get.checkIn.delete_tracker} type="plain" class="text-c-danger" onclick={() => (confirmingDelete = true)} />
				<TextButton title={ts.get.layout.save} disabled={!canSave || saving.busy} onclick={save} />
			{:else}
				<span></span>
				<TextButton title={ts.get.checkIn.add_tracker} disabled={!canSave || saving.busy} onclick={create} />
			{/if}
		</div>
	</div>
{/if}

{#if confirmingDelete && current}
	<ConfirmationModal
		type="confirm-delete"
		title={ts.get.checkIn.delete_tracker}
		description={deleteQuestion(current)}
		onConfirm={remove}
		onCancel={() => (confirmingDelete = false)}
	/>
{/if}
