<script lang="ts">
	import type { CheckInTracker, SportId } from '$lib/types/check_in';
	import { DEFAULT_SPORTS, SPORT_ID, SPORT_BY_ID } from '$lib/types/check_in';
	import DailyCheckInIcon from './DailyCheckInIcon.svelte';
	import GoalProgressLine from '$lib/components/check-in/daily/GoalProgressLine.svelte';
	import type { GoalLine } from '$lib/types/goal';

	let { tracker, label, currentValue, onChange, selectedSports = DEFAULT_SPORTS, goalLine = null }: {
		tracker: CheckInTracker;
		label: string;
		currentValue?: number | null;
		onChange: (tracker: CheckInTracker, value: number | null) => void;
		selectedSports?: SportId[];
		goalLine?: GoalLine | null;
	} = $props();

	let selected = $derived<number | null>(currentValue ?? null);

	const displaySports = $derived.by((): SportId[] => {
		if (tracker.type !== 'sport' || currentValue == null) return selectedSports;
		const storedSport = SPORT_BY_ID[currentValue];
		if (!storedSport || selectedSports.includes(storedSport)) return selectedSports;
		return [...selectedSports, storedSport];
	});

	function toValue(index: number): number {
		return tracker.type === 'sport' ? SPORT_ID[displaySports[index - 1]] : index;
	}

	function onSelect(index: number): void {
		const value = toValue(index);
		if (selected === value) {
			selected = null;
			onChange(tracker, null);
			return;
		}
		selected = value;
		onChange(tracker, value);
	}

	function isHighlighted(index: number): boolean {
		return selected === toValue(index);
	}
</script>

<div class="flex flex-col items-center justify-center space-x-2 md:flex-row lg:space-x-10">
	<div class="w-full pl-5 text-left md:w-40 md:pl-0">
		<div class="text-lg font-bold">{label}</div>
		{#if goalLine}
			<GoalProgressLine line={goalLine} />
		{/if}
	</div>
	<div class="flex w-full flex-row items-center justify-between gap-0 md:w-auto lg:gap-4">
		{#if tracker.type === 'sport'}
			{#each displaySports as sport, i (sport)}
				<DailyCheckInIcon type="sports" icon={null} index={i + 1} {onSelect} {isHighlighted} selectedSports={displaySports} />
			{/each}
		{:else}
			{#each [1, 2, 3, 4, 5] as index (index)}
				<DailyCheckInIcon type={tracker.key} icon={tracker.icon} {index} {onSelect} {isHighlighted} {selectedSports} />
			{/each}
		{/if}
	</div>
</div>
