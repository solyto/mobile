<script lang="ts">
	import type { CheckInType } from '$lib/types/check_in';
	import { getCheckInData } from '$lib/state/CheckInData.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import QuickSelectOverlay from '$lib/components/ui/QuickSelectOverlay.svelte';
	import CheckInIcon from '$lib/components/check-in/overview/CheckInIcon.svelte';

	let { type, date, value } = $props<{
		type: CheckInType;
		date: string;
		value: number | null;
	}>();

	const checkInData = getCheckInData();
	const loadingIndicator = getLoadingIndicator();

	let menuOpen = $state(false);

	async function select(v: number): Promise<void> {
		menuOpen = false;
		loadingIndicator.start();
		await checkInData.save({ date, [type]: v === value ? null : v });
		loadingIndicator.stop();
	}
</script>

<div class="group relative size-12 flex items-center justify-center">
	<button
		type="button"
		class="size-full flex items-center justify-center cursor-pointer"
		onclick={() => (menuOpen = !menuOpen)}
	>
		{#if value !== null}
			<span class="scale-75 cursor-pointer transition-opacity hover:opacity-60">
				<CheckInIcon {type} {value} />
			</span>
		{:else}
			<span class="text-xs text-c-neutral-3 dark:text-c-neutral-6 opacity-0 group-hover:opacity-100 transition-opacity">+</span>
		{/if}
	</button>

	{#if menuOpen}
		<QuickSelectOverlay onClose={() => (menuOpen = false)}>
			{#each [1, 2, 3, 4, 5] as v (v)}
				<button
					type="button"
					class="cursor-pointer rounded-full hover:bg-c-neutral dark:hover:bg-s-dark-3"
					class:bg-c-neutral-1={value === v}
					class:dark:bg-s-dark-3={value === v}
					onclick={() => select(v)}
				>
					<span class="scale-75 block">
						<CheckInIcon {type} value={v} />
					</span>
				</button>
			{/each}
		</QuickSelectOverlay>
	{/if}
</div>
