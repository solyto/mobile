<script lang="ts">
	import { scale, fade } from 'svelte/transition';
	import type { Component } from 'svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import { AVAILABLE_SPORTS, type CheckInTracker, type SportId } from '$lib/types/check_in';
	import { trackerLabel } from '$lib/helpers/CheckInHelper';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import TrackerGlyph from '$lib/components/check-in/TrackerGlyph.svelte';
	import TrackerEditor from '$lib/components/check-in/settings/TrackerEditor.svelte';
	import IconDumbbell from '$lib/icons/lucide/dumbbell.svelte';
	import IconBike from '$lib/icons/lucide/bike.svelte';
	import IconMountain from '$lib/icons/lucide/mountain.svelte';
	import IconWavesLadder from '$lib/icons/lucide/waves-ladder.svelte';
	import IconFootprints from '$lib/icons/lucide/footprints.svelte';
	import IconChevronUp from '$lib/icons/lucide/chevron-up.svelte';
	import IconChevronDown from '$lib/icons/lucide/chevron-down.svelte';
	import BackButton from '$lib/components/ui/buttons/BackButton.svelte';
	import GhostIconButton from '$lib/components/ui/buttons/GhostIconButton.svelte';
	import IconPencil from '$lib/icons/lucide/pencil.svelte';
	import IconPlus from '$lib/icons/lucide/plus.svelte';
	import IconYoga from '$lib/components/ui/icons/IconYoga.svelte';
	import HelpTooltip from '$lib/components/ui/HelpTooltip.svelte';
	import SelectedSportButton from '$lib/components/check-in/SelectedSportButton.svelte';
	import ReplacementSportButton from '$lib/components/check-in/ReplacementSportButton.svelte';

	let { onClose, startWithNewTracker = false }: { onClose: () => void; startWithNewTracker?: boolean } = $props();

	const ts = getTranslation();
	const checkInData = getCheckInData();
	const saving = new SaveAction(() => ts.get.checkIn.save_error);
	const trackerGroups = $derived([
		checkInData.trackers.filter((t) => checkInData.trackerService.isRating(t)),
		checkInData.trackers.filter((t) => !checkInData.trackerService.isRating(t))
	]);

	let editing = $state<CheckInTracker | 'new' | 'sports' | null>(startWithNewTracker ? 'new' : null);
	let sportToReplace = $state<SportId | null>(null);

	function move(tracker: CheckInTracker, offset: -1 | 1): void {
		void saving.run(() => checkInData.moveTracker(tracker, offset));
	}

	// At least one tracker stays on, so the daily page never ends up empty.
	function isLastEnabled(tracker: CheckInTracker): boolean {
		return tracker.enabled && checkInData.activeTrackers.length === 1;
	}

	async function onSportClick(sportId: SportId): Promise<void> {
		const selected = checkInData.selectedSports;

		if (selected.includes(sportId)) {
			sportToReplace = sportToReplace === sportId ? null : sportId;
			return;
		}

		let next: SportId[];
		if (sportToReplace !== null) {
			next = selected.map((id) => (id === sportToReplace ? sportId : id));
			sportToReplace = null;
		} else if (selected.length < 5) {
			next = [...selected, sportId];
		} else {
			return;
		}

		await saving.run(() => checkInData.saveSelectedSports(next));
	}

	function sportLabel(sportId: SportId): string {
		const sport = AVAILABLE_SPORTS.find((s) => s.id === sportId)!;
		return ts.get.checkIn[sport.labelKey];
	}

	function modalTitle(): string {
		if (editing === null) return ts.get.checkIn.settings;
		if (editing === 'new') return ts.get.checkIn.add_tracker;
		return ts.get.checkIn.edit_tracker;
	}

	function separatesGroups(groupIndex: number, group: CheckInTracker[]): boolean {
		return groupIndex === 1 && trackerGroups[0].length > 0 && group.length > 0;
	}

	function isEditable(tracker: CheckInTracker): boolean {
		return tracker.key === null || tracker.type === 'sport';
	}

	function edit(tracker: CheckInTracker): void {
		editing = tracker.type === 'sport' ? 'sports' : tracker;
	}

	function close(): void {
		sportToReplace = null;
		onClose();
	}

	function closeEditor(): void {
		if (startWithNewTracker) onClose();
		else editing = null;
	}

	const sportIcons: Record<SportId, Component> = {
		dumbbell: IconDumbbell,
		bike: IconBike,
		mountain: IconMountain,
		footprints: IconFootprints,
		waves_ladder: IconWavesLadder,
		yoga: IconYoga
	};
</script>

<ContentModal onClose={close} title={modalTitle()} rounded="2xl" p="4">
	<div class="flex w-full flex-col gap-2">
		{#if editing === 'sports'}
			<div class="flex w-full flex-col gap-3">
				<BackButton title={ts.get.checkIn.sports} onclick={() => (editing = null)} />
				<div class="flex gap-2">
					{#each checkInData.selectedSports as sportId, i (sportId)}
						<SelectedSportButton
							title={sportLabel(sportId)}
							position={i + 1}
							replacing={sportToReplace === sportId}
							icon={sportIcons[sportId]}
							onClick={() => onSportClick(sportId)}
						/>
					{/each}
				</div>
			</div>
		{:else if editing !== null}
			<TrackerEditor tracker={editing === 'new' ? null : editing} onDone={closeEditor} />
		{:else}
			<!-- Same columns as the rows below: centred over the checkboxes, then the toggle's width. -->
			<div class="flex w-full items-center justify-end gap-1">
				<span class="flex w-9 justify-center text-xs whitespace-nowrap">
					<HelpTooltip label={ts.get.checkIn.score} description={ts.get.checkIn.score_description} />
				</span>
				<span class="w-11" aria-hidden="true"></span>
			</div>
			{#each trackerGroups as group, g (g)}
				{#if separatesGroups(g, group)}
					<div class="my-1 border-t border-dashed border-c-neutral-3" aria-hidden="true"></div>
				{/if}
				{#each group as tracker, i (tracker.id)}
					<div class="flex w-full items-center justify-between gap-3">
						<div class="flex min-w-0 items-center gap-2" class:opacity-50={!tracker.enabled}>
							<TrackerGlyph {tracker} class="size-4 shrink-0 text-c-heading dark:text-c-primary" />
							<span class="truncate">{trackerLabel(tracker, ts.get.checkIn)}</span>
						</div>
						<div class="flex shrink-0 items-center gap-1">
							{#if isEditable(tracker)}
								<GhostIconButton label={ts.get.checkIn.edit_tracker} onclick={() => edit(tracker)}>
									<IconPencil class="size-4" />
								</GhostIconButton>
							{/if}
							<GhostIconButton label={ts.get.checkIn.move_up} disabled={i === 0} onclick={() => move(tracker, -1)}>
								<IconChevronUp class="size-4" />
							</GhostIconButton>
							<GhostIconButton label={ts.get.checkIn.move_down} disabled={i === group.length - 1} onclick={() => move(tracker, 1)}>
								<IconChevronDown class="size-4" />
							</GhostIconButton>
							<div class="flex w-9 items-center justify-center" class:opacity-30={!tracker.enabled} class:pointer-events-none={!tracker.enabled}>
								{#if tracker.type === 'scale'}
									<Checkbox isChecked={tracker.scored} onchange={() => saving.run(() => checkInData.updateTracker(tracker, { scored: !tracker.scored }))} />
								{/if}
							</div>
							<div class:pointer-events-none={isLastEnabled(tracker)} class:opacity-50={isLastEnabled(tracker)}>
								<Toggle checked={tracker.enabled} onchange={() => saving.run(() => checkInData.updateTracker(tracker, { enabled: !tracker.enabled }))} />
							</div>
						</div>
					</div>
				{/each}
			{/each}

			<button type="button" class="mt-2 flex cursor-pointer items-center gap-1 self-start text-sm font-semibold text-c-heading dark:text-c-primary" onclick={() => (editing = 'new')}>
				<IconPlus class="size-4" />
				{ts.get.checkIn.add_tracker}
			</button>
		{/if}
	</div>
</ContentModal>

{#if sportToReplace !== null}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs"
		transition:fade={{ duration: 150 }}
		onclick={() => (sportToReplace = null)}
		role="presentation"
	>
		<div
			class="rounded-2xl bg-c-bg-surface p-4 shadow-lg"
			transition:scale={{ start: 0.9, duration: 150 }}
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>
			<p class="mb-3 text-sm font-semibold text-c-neutral-5 dark:text-c-neutral-4">{ts.get.checkIn.sport_replace_with}</p>
			<div class="flex gap-2">
				{#each AVAILABLE_SPORTS.filter((s) => !checkInData.selectedSports.includes(s.id)) as sport (sport.id)}
					<ReplacementSportButton
						title={ts.get.checkIn[sport.labelKey]}
						icon={sportIcons[sport.id]}
						onClick={() => onSportClick(sport.id)}
					/>
				{/each}
			</div>
		</div>
	</div>
{/if}
