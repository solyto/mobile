<script lang="ts">
	import IconActivity from '@lucide/svelte/icons/activity';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getMeanValue, getTotalMeanValue } from '$lib/helpers/CheckInHelper';
	import type { CheckInType } from '$lib/types/check_in';
	import IconSmile from '@lucide/svelte/icons/smile';
	import IconBedSingle from '@lucide/svelte/icons/bed-single';
	import IconSparkles from '@lucide/svelte/icons/sparkles';
	import IconBriefcaseBusiness from '@lucide/svelte/icons/briefcase-business';
	import IconApple from '@lucide/svelte/icons/apple';
	import IconPizza from '@lucide/svelte/icons/pizza';
	import IconDroplets from '@lucide/svelte/icons/droplets';
	import IconDroplet from '@lucide/svelte/icons/droplet';
	import IconWine from '@lucide/svelte/icons/wine';
	import IconCigarette from '@lucide/svelte/icons/cigarette';
	import IconUsersRound from '@lucide/svelte/icons/users-round';
	import { onMount, tick } from 'svelte';
	import CheckInWidgetRow from '$lib/components/dashboard/widgets/CheckInWidgetRow.svelte';

	const checkInData = getCheckInData();
	const entries = $derived(checkInData.activeTrackers.filter((t) => t !== 'sports' && checkInData.scoredTrackers.includes(t)));
	const totalMean = $derived(getTotalMeanValue(checkInData.data, entries));

	let { ts } = $props();

	let loaded = $state(false);

	onMount(async () => {
		await checkInData.load();
		await tick();
		loaded = true;
	});

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
</script>

{#if loaded}
	<div>
		<div class="mb-3 flex items-center gap-2">
			<IconActivity size={15} class="text-c-heading dark:text-c-primary" />
			<span class="text-xs font-semibold tracking-wider text-c-heading uppercase dark:text-c-primary">
				{ts.get.nav.checkIn}
			</span>
		</div>
		<div class="flex flex-col gap-2.5">
			{#each entries as entry (entry)}
				<CheckInWidgetRow
					label={ts.get.checkIn[entry]}
					value={getMeanValue(checkInData.data, entry)}
					icon={getIcon(entry)}
				/>
			{/each}
			<div class="mt-1 border-t border-c-neutral-1 pt-2 dark:border-s-dark-3">
				<div class="flex items-center gap-2.5">
					<span class="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-xs font-bold text-c-primary">∑</span>
					<div class="min-w-0 flex-1">
						<div class="mb-0.5 flex items-center justify-between">
							<span class="text-xs font-medium text-c-neutral-7 dark:text-c-neutral-3">
								{ts.get.checkIn.total}
							</span>
							<span class="text-xs font-semibold text-c-primary">
								{#if isNaN(totalMean)}
									-
								{:else}
									{totalMean.toFixed(2)}
								{/if}
							</span>
						</div>
						<div class="h-1 overflow-hidden rounded-full bg-c-neutral-1 dark:bg-s-dark-3">
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
{/if}