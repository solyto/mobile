<script lang="ts">
	import { scale, fade } from 'svelte/transition';
	import type { Component } from 'svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { ALL_CHECK_IN_TRACKERS, AVAILABLE_SPORTS, type CheckInType, type SportId } from '$lib/types/check_in';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import Toggle from '$lib/components/forms/Toggle.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import IconDumbbell from '@lucide/svelte/icons/dumbbell';
	import IconBike from '@lucide/svelte/icons/bike';
	import IconMountain from '@lucide/svelte/icons/mountain';
	import IconWavesLadder from '@lucide/svelte/icons/waves-ladder';
	import IconFootprints from '@lucide/svelte/icons/footprints';
	import IconYoga from '$lib/components/ui/icons/IconYoga.svelte';
	import HelpTooltip from '$lib/components/ui/HelpTooltip.svelte';
	import SelectedSportButton from '$lib/components/check-in/SelectedSportButton.svelte';
	import ReplacementSportButton from '$lib/components/check-in/ReplacementSportButton.svelte';

	let { onClose }: { onClose: () => void } = $props();

	const ts = getTranslation();
	const checkInData = getCheckInData();
	const loadingIndicator = getLoadingIndicator();

	let enabledMap = $state<Record<string, boolean>>(
		Object.fromEntries(
			ALL_CHECK_IN_TRACKERS.map((t) => [t, checkInData.settings.enabledTrackers.includes(t)])
		)
	);
	let scoredMap = $state<Record<string, boolean>>(
		Object.fromEntries(
			ALL_CHECK_IN_TRACKERS.map((t) => [t, checkInData.scoredTrackers.includes(t)])
		)
	);
	let selectedSports = $state<SportId[]>([...checkInData.settings.selectedSports]);
	let sportToReplace = $state<SportId | null>(null);

	async function onToggle(tracker: CheckInType): Promise<void> {
		const enabled = ALL_CHECK_IN_TRACKERS.filter((t) => enabledMap[t]);
		if (enabled.length === 0) {
			enabledMap[tracker] = true;
			return;
		}
		loadingIndicator.start();
		await checkInData.saveSettings({ enabledTrackers: enabled, selectedSports });
		loadingIndicator.stop();
	}

	function onScoredToggle(): void {
		const scored = ALL_CHECK_IN_TRACKERS.filter((t) => scoredMap[t]);
		checkInData.saveScoredTrackers(scored);
	}

	async function onSportClick(sportId: SportId): Promise<void> {
		const isSelected = selectedSports.includes(sportId);

		if (isSelected) {
			sportToReplace = sportToReplace === sportId ? null : sportId;
			return;
		}

		if (sportToReplace !== null) {
			const idx = selectedSports.indexOf(sportToReplace);
			const next = [...selectedSports];
			next[idx] = sportId;
			selectedSports = next;
			sportToReplace = null;
		} else if (selectedSports.length < 5) {
			selectedSports = [...selectedSports, sportId];
		} else {
			return;
		}

		loadingIndicator.start();
		await checkInData.saveSettings({ enabledTrackers: ALL_CHECK_IN_TRACKERS.filter((t) => enabledMap[t]), selectedSports });
		loadingIndicator.stop();
	}

	function sportLabel(sportId: SportId): string {
		const sport = AVAILABLE_SPORTS.find((s) => s.id === sportId)!;
		return ts.get.checkIn[sport.labelKey];
	}

	function close(): void {
		sportToReplace = null;
		onClose();
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

<ContentModal onClose={close} title={ts.get.checkIn.settings} rounded="2xl" p="4">
	<div class="flex w-full flex-col gap-2">
		<div class="mb-1 flex items-center justify-between md:hidden">
			<span class="text-lg font-bold text-c-heading dark:text-c-primary">{ts.get.checkIn.settings}</span>
			<CloseButton onClick={close} inModal={false} />
		</div>
		<div class="w-full flex items-center justify-between gap-2">
			<div></div>
			<div class="flex w-full items-center justify-between gap-4">
				<span class="ml-auto text-xs">
					<HelpTooltip label={ts.get.checkIn.score} description={ts.get.checkIn.score_description} />
				</span>
				<div class="w-9"></div>
			</div>
		</div>
		{#each ALL_CHECK_IN_TRACKERS as tracker (tracker)}
			<div class="flex w-full items-center justify-between gap-4">
				<span>{ts.get.checkIn[tracker]}</span>
				<div class="flex items-center gap-2">
					{#if tracker !== 'sports'}
						<div class="pt-2 mr-4" class:opacity-30={!enabledMap[tracker]} class:pointer-events-none={!enabledMap[tracker]}>
							<Checkbox
								isChecked={scoredMap[tracker]}
								onchange={() => {
									scoredMap[tracker] = !scoredMap[tracker];
									onScoredToggle();
								}}
							/>
						</div>
					{/if}
					<Toggle
						bind:checked={enabledMap[tracker]}
						onchange={() => onToggle(tracker)}
					/>
				</div>
			</div>
		{/each}
		{#if enabledMap['sports']}
			<div class="mt-2 border-t border-c-neutral-1 pt-3 dark:border-s-dark">
				<p class="mb-2 text-sm font-semibold text-c-neutral-5 dark:text-c-neutral-4">{ts.get.checkIn.sports}</p>
				<div class="flex gap-2">
					{#each selectedSports as sportId, i (sportId)}
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
				{#each AVAILABLE_SPORTS.filter((s) => !selectedSports.includes(s.id)) as sport (sport.id)}
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
