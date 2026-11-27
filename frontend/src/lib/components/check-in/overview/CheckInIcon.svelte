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
	import type { CheckInTracker } from '$lib/types/check_in';
	import { SPORT_BY_ID } from '$lib/types/check_in';

	let { tracker, value }: {
		tracker: CheckInTracker;
		value: number | null;
	} = $props();

	const type = $derived(tracker.key);

	const sportId = $derived(type === 'sports' && value !== null ? SPORT_BY_ID[value] : undefined);

	function getFill(value: number): 0 | 25 | 50 | 75 | 100 {
		switch (value) {
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

	function getColor(value: number): string {
		switch (value) {
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
</script>

{#if value !== null && tracker.type === 'count'}
	<span class="flex size-10 items-center justify-center text-sm font-bold tabular-nums">{value}</span>
{:else if value !== null && tracker.type === 'yes_no'}
	<span class="flex size-10 items-center justify-center text-c-neutral-5 dark:text-c-neutral-4">
		<TrackerIcon name={tracker.icon} class="size-6" />
	</span>
{:else if value !== null}
	<button class="group size-10 text-{type === 'sports' ? 'c-primary' : getColor(value)}">
		{#if type === null}
			<TrackerIcon name={tracker.icon} class="size-full" />
		{:else if type === 'water'}
			<IconWater fill={getFill(value)} />
		{:else if type === 'sleep'}
			<IconBedSingle class="size-full" />
		{:else if type === 'dreams'}
			<IconSparkles class="size-full" />
		{:else if type === 'work'}
			<IconBriefcaseBusiness class="size-full" />
		{:else if type === 'food_quality'}
			<IconApple class="size-full" />
		{:else if type === 'food_amount'}
			<div class="mt-[-8px] ml-[-5px] scale-60">
				<IconPlate fill={getFill(value)} />
			</div>
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
			<IconDropletFill fill={getFill(value)} />
		{:else if type === 'alcohol'}
			<IconWine class="size-full" />
		{:else if type === 'smoking'}
			<IconCigarette class="size-full" />
		{:else if type === 'social_life'}
			<IconUsersRound class="size-full" />
		{:else if value === 1}
			<IconAngry class="size-full" />
		{:else if value === 2}
			<IconFrown class="size-full" />
		{:else if value === 3}
			<IconMeh class="size-full" />
		{:else if value === 4}
			<IconSmile class="size-full" />
		{:else if value === 5}
			<IconLaugh class="size-full" />
		{/if}
	</button>
{/if}
