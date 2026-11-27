<script lang="ts">
	import IconFrown from '$lib/icons/lucide/face-slightly-frowning.svelte';
	import IconAngry from '$lib/icons/lucide/face-angry.svelte';
	import IconMeh from '$lib/icons/lucide/face-neutral.svelte';
	import IconSmile from '$lib/icons/lucide/face-slightly-smiling.svelte';
	import IconLaugh from '$lib/icons/lucide/face-grinning.svelte';
	import IconDumbbell from '$lib/icons/lucide/dumbbell.svelte';
	import IconBike from '$lib/icons/lucide/bike.svelte';
	import IconMountain from '$lib/icons/lucide/mountain.svelte';
	import IconWavesLadder from '$lib/icons/lucide/waves-ladder.svelte';
	import IconFootprints from '$lib/icons/lucide/footprints.svelte';
	import IconSparkles from '$lib/icons/lucide/sparkles.svelte';
	import IconBedSingle from '$lib/icons/lucide/bed-single.svelte';
	import IconApple from '$lib/icons/lucide/apple.svelte';
	import IconBriefcaseBusiness from '$lib/icons/lucide/briefcase-business.svelte';
	import IconWater from '$lib/components/ui/icons/IconWater.svelte';
	import IconPlate from '$lib/components/ui/icons/IconPlate.svelte';
	import IconYoga from '$lib/components/ui/icons/IconYoga.svelte';
	import IconDropletFill from '$lib/components/ui/icons/IconDropletFill.svelte';
	import IconWine from '$lib/icons/lucide/wine.svelte';
	import IconCigarette from '$lib/icons/lucide/cigarette.svelte';
	import IconUsersRound from '$lib/icons/lucide/users-round.svelte';
	import TrackerIcon from '$lib/components/check-in/TrackerIcon.svelte';
	import type { CheckInType, SportId } from '$lib/types/check_in';
	import { DEFAULT_SPORTS } from '$lib/types/check_in';

	let { type, icon, index, onSelect, isHighlighted, selectedSports = DEFAULT_SPORTS }: {
		type: CheckInType | null;
		icon: string | null;
		index: number;
		onSelect: (index: number) => void;
		isHighlighted: (index: number) => boolean;
		selectedSports?: SportId[];
	} = $props();

	const sportId = $derived(type === 'sports' ? selectedSports[index - 1] : undefined);

	function getFillForIndex(index: number): 0 | 25 | 50 | 75 | 100 {
		switch (index) {
			case 1:
			default:
				return 0;
			case 2:
				return 25;
			case 3:
				return 50;
			case 4:
				return 75;
			case 5:
				return 100;
		}
	}

	function getColor(index: number): string {
		switch (index) {
			case 1:
			default:
				return 'red-500';
			case 2:
				return 'orange-500';
			case 3:
				return 'blue-500';
			case 4:
				return 'green-300';
			case 5:
				return 'green-500';
		}
	}

	function getColorForType(): string {
		if (type === 'sports') return 'c-primary';
		if (type === 'menstruation') return 'rose-400';
		return getColor(index);
	}

	const color = getColorForType(),
		fill = getFillForIndex(index);
</script>

<button
	class="group size-19 cursor-pointer rounded-lg p-3.5 text-{color} flex items-center justify-center border-3 border-c-neutral-1 shadow-xs transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
	class:bg-c-neutral={isHighlighted(index)}
	class:border-transparent={!isHighlighted(index)}
	class:dark:bg-s-dark-3={isHighlighted(index)}
	class:p-0!={type === 'food_amount'}
	onclick={() => onSelect(index)}
>
	{#if type === null}
		<TrackerIcon name={icon} class="size-full" />
	{:else if type === 'water'}
		<IconWater {fill} />
	{:else if type === 'sleep'}
		<IconBedSingle class="size-full" />
	{:else if type === 'dreams'}
		<IconSparkles class="size-full" />
	{:else if type === 'work'}
		<IconBriefcaseBusiness class="size-full" />
	{:else if type === 'food_quality'}
		<IconApple class="size-full" />
	{:else if type === 'food_amount'}
		<IconPlate {fill} />
	{:else if type === 'sports'}
		{#if sportId === 'dumbbell'}
			<IconDumbbell class="size-full" />
		{:else if sportId === 'bike'}
			<IconBike class="size-full" />
		{:else if sportId === 'mountain'}
			<IconMountain class="size-full" />
		{:else if sportId === 'footprints'}
			<IconFootprints class="size-full" />
		{:else if sportId === 'waves_ladder'}
			<IconWavesLadder class="size-full" />
		{:else if sportId === 'yoga'}
			<IconYoga class="size-full" />
		{/if}
	{:else if type === 'menstruation'}
		<IconDropletFill {fill} />
	{:else if type === 'alcohol'}
		<IconWine class="size-full" />
	{:else if type === 'smoking'}
		<IconCigarette class="size-full" />
	{:else if type === 'social_life'}
		<IconUsersRound class="size-full" />
	{:else if index === 1}
		<IconAngry class="size-full" />
	{:else if index === 2}
		<IconFrown class="size-full" />
	{:else if index === 3}
		<IconMeh class="size-full" />
	{:else if index === 4}
		<IconSmile class="size-full" />
	{:else if index === 5}
		<IconLaugh class="size-full" />
	{/if}
</button>

<!-- border-c-neutral-7 -->
