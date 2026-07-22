<script lang="ts">
	import type { CheckInType, SportId } from '$lib/types/check_in';
	import { DEFAULT_SPORTS, SPORT_ID, SPORT_BY_ID } from '$lib/types/check_in';
	import DailyCheckInIcon from './DailyCheckInIcon.svelte';

	let { type, label, currentValue, onChange, selectedSports = DEFAULT_SPORTS } = $props<{
		type: CheckInType;
		label: string;
		currentValue?: number | null;
		onChange: (type: CheckInType, value: number) => Promise<void>;
		selectedSports?: SportId[];
	}>();

	let selected = $state<number | null>(currentValue ?? null);

	$effect(() => {
		selected = currentValue ?? null;
	});

	const displaySports = $derived.by((): SportId[] => {
		if (type !== 'sports' || currentValue == null) return selectedSports;
		const storedSport = SPORT_BY_ID[currentValue];
		if (!storedSport || selectedSports.includes(storedSport)) return selectedSports;
		return [...selectedSports, storedSport];
	});

	function toValue(index: number): number {
		return type === 'sports' ? SPORT_ID[displaySports[index - 1]] : index;
	}

	function onSelect(index: number): void {
		const value = toValue(index);
		if (currentValue === value) {
			selected = null;
			onChange(type, null);
			return;
		}
		selected = value;
		onChange(type, value);
	}

	function isHighlighted(index: number): boolean {
		return selected === toValue(index);
	}
</script>

<div class="flex flex-col items-center justify-center space-x-2 md:flex-row lg:space-x-16">
	<div class="w-full pl-5 text-left text-xl font-bold md:w-48 md:pl-0">{label}</div>
	<div class="flex w-full flex-row items-center justify-between gap-0 md:w-auto lg:gap-4">
		{#if type === 'sports'}
			{#each displaySports as _, i}
				<DailyCheckInIcon {type} index={i + 1} {onSelect} {isHighlighted} selectedSports={displaySports} />
			{/each}
		{:else}
			<DailyCheckInIcon {type} index={1} {onSelect} {isHighlighted} {selectedSports} />
			<DailyCheckInIcon {type} index={2} {onSelect} {isHighlighted} {selectedSports} />
			<DailyCheckInIcon {type} index={3} {onSelect} {isHighlighted} {selectedSports} />
			<DailyCheckInIcon {type} index={4} {onSelect} {isHighlighted} {selectedSports} />
			<DailyCheckInIcon {type} index={5} {onSelect} {isHighlighted} {selectedSports} />
		{/if}
	</div>
</div>
