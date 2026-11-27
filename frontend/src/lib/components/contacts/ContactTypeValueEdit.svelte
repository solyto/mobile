<script lang="ts">
	import type { Component } from 'svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import IconCardSim from '$lib/icons/lucide/card-sim.svelte';
	import IconHouse from '$lib/icons/lucide/house.svelte';
	import IconBriefcaseBusiness from '$lib/icons/lucide/briefcase-business.svelte';

	type TypeIcon = Component<{ class?: string }>;

	const TYPE_ICONS: Record<string, TypeIcon> = {
		cell: IconCardSim,
		home: IconHouse,
		work: IconBriefcaseBusiness
	};

	let { value = $bindable(), type = $bindable(), placeholder, types, otherIcon }: {
		value: string;
		type: string;
		placeholder: string;
		types: string[];
		otherIcon: TypeIcon;
	} = $props();

	let menuOpen = $state<boolean>(false);

	function iconFor(t: string): TypeIcon {
		return TYPE_ICONS[t] ?? otherIcon;
	}

	function toggleMenu(): void {
		menuOpen = !menuOpen;
	}

	function choose(t: string): void {
		type = t;
		menuOpen = false;
	}
</script>

{#snippet typeIcon(Icon: TypeIcon)}
	<Icon class="size-4 text-c-btn" />
{/snippet}

<div class="relative flex items-center gap-1">
	<TextInput bind:value {placeholder} />
	<button
		type="button"
		class="flex h-full cursor-pointer items-center rounded-lg border-1 border-c-neutral-2 p-2 shadow-xs hover:bg-c-neutral dark:border-s-dark-2 dark:hover:bg-s-dark-2"
		onclick={toggleMenu}
	>
		{@render typeIcon(iconFor(type))}
	</button>
	{#if menuOpen}
		<div class="absolute top-0 right-[-10px] z-60 flex flex-col rounded-lg bg-c-bg-modal p-2 shadow-lg">
			{#each types as t (t)}
				<button class="cursor-pointer rounded-lg p-2 hover:bg-c-neutral dark:hover:bg-s-dark-2" onclick={() => choose(t)}>
					{@render typeIcon(iconFor(t))}
				</button>
			{/each}
		</div>
	{/if}
</div>
