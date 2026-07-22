<script lang="ts">
	import IconFrown from '@lucide/svelte/icons/frown';
	import IconAngry from '@lucide/svelte/icons/angry';
	import IconMeh from '@lucide/svelte/icons/meh';
	import IconSmile from '@lucide/svelte/icons/smile';
	import IconLaugh from '@lucide/svelte/icons/laugh';
	import IconDumbbell from '@lucide/svelte/icons/dumbbell';
	import IconBike from '@lucide/svelte/icons/bike';
	import IconMountain from '@lucide/svelte/icons/mountain';
	import IconWavesLadder from '@lucide/svelte/icons/waves-ladder';
	import IconFootprints from '@lucide/svelte/icons/footprints';
	import IconSparkles from '@lucide/svelte/icons/sparkles';
	import IconBedSingle from '@lucide/svelte/icons/bed-single';
	import IconApple from '@lucide/svelte/icons/apple';
	import IconBriefcaseBusiness from '@lucide/svelte/icons/briefcase-business';
	import IconWater from '$lib/components/ui/icons/IconWater.svelte';
	import IconPlate from '$lib/components/ui/icons/IconPlate.svelte';
	import IconYoga from '$lib/components/ui/icons/IconYoga.svelte';
	import IconDropletFill from '$lib/components/ui/icons/IconDropletFill.svelte';
	import IconWine from '@lucide/svelte/icons/wine';
	import IconCigarette from '@lucide/svelte/icons/cigarette';
	import IconUsersRound from '@lucide/svelte/icons/users-round';
	import type { CheckInType, SportId } from '$lib/types/check_in';
	import { DEFAULT_SPORTS } from '$lib/types/check_in';

	let { type, index, onSelect, isHighlighted, selectedSports = DEFAULT_SPORTS } = $props<{
		type: CheckInType;
		index: number;
		onSelect: (index: number) => void;
		isHighlighted: (index: number) => boolean;
		selectedSports?: SportId[];
	}>();

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
	class="group size-22 cursor-pointer rounded-lg p-4 text-{color} flex items-center justify-center border-3 border-c-neutral-1 shadow-xs transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
	class:bg-c-neutral={isHighlighted(index)}
	class:border-transparent={!isHighlighted(index)}
	class:dark:bg-s-dark-3={isHighlighted(index)}
	class:p-0!={type === 'food_amount'}
	onclick={() => onSelect(index)}
>
	{#if type === 'water'}
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
