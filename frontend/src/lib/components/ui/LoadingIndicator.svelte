<script lang="ts">
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';

	const loadingIndicator = getLoadingIndicator();

	let active = $derived(loadingIndicator.active);
	let progress = $derived(loadingIndicator.progress);
	let colorClass = 'bg-c-btn';
</script>

<div class="pointer-events-none fixed top-0 right-0 left-0 z-[200] w-full">
	{#if active}
		<div class="relative h-[3px]">
			{#if progress === null}
				<div class="absolute inset-0 overflow-hidden h-full">
					<div class="absolute inset-0 h-full opacity-20 bg-gradient-to-r from-c-neutral to-c-action"></div>
					<div class="absolute top-0 h-full indeterminate bg-gradient-to-l from-c-action to-c-neutral"></div>
				</div>
			{:else}
				<div
					class="h-full transition-all duration-300 ease-out {colorClass}"
					style={`width: ${Math.min(100, Math.max(0, progress * 100)).toFixed(1)}%`}
				></div>
			{/if}
		</div>
	{/if}
</div>

<style>
    .indeterminate {
        width: 30%;
        left: -30%;
        animation: loading-bar 1.4s cubic-bezier(0.4, 0.0, 0.6, 1) infinite;
    }

    @keyframes loading-bar {
        0% {
            left: -30%;
            width: 30%;
        }
        60% {
            left: 60%;
            width: 50%;
        }
        100% {
            left: 110%;
            width: 30%;
        }
    }
</style>
