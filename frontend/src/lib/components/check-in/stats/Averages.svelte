<script lang="ts">
	import type { CheckIn, CheckInType } from '$lib/types/check_in';
	import { getMeanValue, getTotalMeanValue } from '$lib/helpers/CheckInHelper';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconBedSingle from '@lucide/svelte/icons/bed-single';
	import IconSparkles from '@lucide/svelte/icons/sparkles';
	import IconBriefcaseBusiness from '@lucide/svelte/icons/briefcase-business';
	import IconApple from '@lucide/svelte/icons/apple';
	import IconDroplets from '@lucide/svelte/icons/droplets';
	import IconDroplet from '@lucide/svelte/icons/droplet';
	import IconWine from '@lucide/svelte/icons/wine';
	import IconCigarette from '@lucide/svelte/icons/cigarette';
	import IconUsersRound from '@lucide/svelte/icons/users-round';
	import IconSmile from '@lucide/svelte/icons/smile';
	import IconPizza from '@lucide/svelte/icons/pizza';
	const ts = getTranslation();

	let { data, activeTrackers, scoredTrackers } = $props<{ data: CheckIn[]; activeTrackers: CheckInType[]; scoredTrackers: CheckInType[] }>();

	const entries = $derived(activeTrackers.filter((t: CheckInType) => t !== 'sports' && scoredTrackers.includes(t)));
	const totalMean = $derived(getTotalMeanValue(data, entries));


	function getIcon(type: CheckInType) {
		switch (type) {
			case 'mood':
				return IconSmile;
			case 'sleep':
				return IconBedSingle;
			case 'dreams':
				return IconSparkles;
			case 'work':
				return IconBriefcaseBusiness;
			case 'food_quality':
				return IconApple;
			case 'food_amount':
				return IconPizza;
			case 'water':
				return IconDroplets;
			case 'menstruation':
				return IconDroplet;
			case 'alcohol':
				return IconWine;
			case 'smoking':
				return IconCigarette;
			case 'social_life':
				return IconUsersRound;
			default:
				return null;
		}
	}

	function getBarColor(value: number): string {
		if (value >= 4) return 'bg-c-success';
		if (value >= 3) return 'bg-c-btn';
		if (value >= 2) return 'bg-c-warning';
		if (value >= 1.5) return 'bg-c-action';
		return 'bg-c-danger';
	}

	function getBarColorFood(value: number): string {
		if (value >= 3.5 && value < 4.5) return 'bg-c-success';
		if (value >= 3) return 'bg-c-btn';
		if (value >= 2) return 'bg-c-warning';
		if (value >= 1.5) return 'bg-c-action';
		return 'bg-c-danger';
	}

</script>

<div class="max-2xl:px-4 pb-8 border-c-neutral-1 dark:border-s-dark">
	<div class="flex flex-col gap-3">
		{#each entries as entry (entry)}
			{@const value = getMeanValue(data, entry)}
			{@const IconComponent = getIcon(entry)}
			<div class="flex items-center gap-3">
				{#if IconComponent}
					<div
						class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-c-neutral dark:bg-s-dark-3"
					>
						<IconComponent class="h-4 w-4 text-c-heading dark:text-c-primary" />
					</div>
				{:else}
					<div
						class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-c-neutral dark:bg-s-dark-3"
					>
						<span class="text-sm text-c-heading dark:text-c-primary"
							>#{entries.indexOf(entry) + 1}</span
						>
					</div>
				{/if}
				<div class="min-w-0 flex-1">
					<div class="mb-1 flex items-center justify-between">
						<p class="text-sm font-medium text-c-neutral-7 dark:text-c-neutral-3">
							{ts.get.checkIn[entry as keyof typeof ts.get.checkIn]}
						</p>
						<p class="text-sm font-semibold text-c-neutral-9 dark:text-white">
							{#if isNaN(value)}
								-
							{:else}
								{value.toFixed(2)}
							{/if}
						</p>
					</div>
					<div class="h-2 overflow-hidden rounded-full bg-c-neutral-1 dark:bg-s-dark-3">
						<div
							class="h-full rounded-full transition-all duration-300 {entry === 'food_amount'
								? getBarColorFood(value)
								: getBarColor(value)}"
							style="width: {isNaN(value) ? 0 : (value / 5) * 100}%"
						></div>
					</div>
				</div>
			</div>
		{/each}
		<div class="mt-1 border-t border-c-neutral-1 pt-3 dark:border-s-dark-3">
			<div class="flex items-center gap-3">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-c-primary/10 dark:bg-c-primary/20"
				>
					<span class="text-sm font-bold text-c-primary">∑</span>
				</div>
				<div class="min-w-0 flex-1">
					<div class="mb-1 flex items-center justify-between">
						<p class="text-base font-semibold text-c-neutral-9 dark:text-white">
							{ts.get.checkIn.total}
						</p>
						<p class="text-base font-bold text-c-primary">
							{#if isNaN(totalMean)}
								-
							{:else}
								{totalMean.toFixed(2)}
							{/if}
						</p>
					</div>
					<div class="h-2 overflow-hidden rounded-full bg-c-neutral-1 dark:bg-s-dark-3">
						<div
							class="h-full rounded-full bg-c-primary transition-all duration-300"
							style="width: {isNaN(totalMean) ? 0 : (totalMean / 5) * 100}%"
						></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
