<script lang="ts">
	import type { Component } from 'svelte';
	import type { CheckInTracker, CheckInType } from '$lib/types/check_in';
	import TrackerIcon from '$lib/components/check-in/TrackerIcon.svelte';
	import IconSmile from '$lib/icons/lucide/face-slightly-smiling.svelte';
	import IconBedSingle from '$lib/icons/lucide/bed-single.svelte';
	import IconSparkles from '$lib/icons/lucide/sparkles.svelte';
	import IconBriefcaseBusiness from '$lib/icons/lucide/briefcase-business.svelte';
	import IconApple from '$lib/icons/lucide/apple.svelte';
	import IconPizza from '$lib/icons/lucide/pizza.svelte';
	import IconDroplets from '$lib/icons/lucide/droplets.svelte';
	import IconDroplet from '$lib/icons/lucide/droplet.svelte';
	import IconWine from '$lib/icons/lucide/wine.svelte';
	import IconCigarette from '$lib/icons/lucide/cigarette.svelte';
	import IconUsersRound from '$lib/icons/lucide/users-round.svelte';
	import IconDumbbell from '$lib/icons/lucide/dumbbell.svelte';

	let { tracker, class: customClass = '' }: { tracker: CheckInTracker; class?: string } = $props();

	const BUILT_IN_ICONS: Record<CheckInType, Component<{ class?: string }>> = {
		mood: IconSmile,
		sleep: IconBedSingle,
		dreams: IconSparkles,
		work: IconBriefcaseBusiness,
		food_quality: IconApple,
		food_amount: IconPizza,
		water: IconDroplets,
		sports: IconDumbbell,
		menstruation: IconDroplet,
		alcohol: IconWine,
		smoking: IconCigarette,
		social_life: IconUsersRound
	};

	const BuiltInIcon = $derived(tracker.key !== null ? BUILT_IN_ICONS[tracker.key] : null);
</script>

{#if BuiltInIcon}
	<BuiltInIcon class={customClass} />
{:else}
	<TrackerIcon name={tracker.icon} class={customClass} />
{/if}
