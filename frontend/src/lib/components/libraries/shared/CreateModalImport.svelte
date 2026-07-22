<script lang="ts">
	import QuickSelectOverlay from '$lib/components/ui/QuickSelectOverlay.svelte';
	import IconButton from '$lib/components/ui/buttons/IconButton.svelte';
	import IconImport from '@lucide/svelte/icons/import';
	import IconChevronDown from '@lucide/svelte/icons/chevron-down';
	import { Translation } from '$lib/state/Translation.svelte';
	import type { Component } from 'svelte';

	let { options, ts, loading, open = $bindable() } = $props<{
		options: {
			label: string;
			icon: string | Component;
			onClick: () => void;
		}[];
		ts: Translation;
		loading: boolean;
		open: boolean;
	}>();
</script>

<div class="relative">
	<IconButton
		type="plain"
		pulse={loading}
		onclick={() => open = !open}
	>
		<IconImport class="size-4" />
		{ts.get.libraries.import}
		<IconChevronDown class="size-3" />
	</IconButton>
	{#if open}
		<QuickSelectOverlay onClose={() => open = false} class="bottom-full right-0 top-auto mb-1 min-w-max" p={0}>
			{#each options as entry (entry.label)}
				<button
					type="button"
					class="flex w-full cursor-pointer items-center gap-2 rounded px-4 py-2 text-left text-sm hover:bg-c-neutral-1 dark:text-white dark:hover:bg-s-dark-3"
					onclick={() => { open = false; entry.onClick(); }}
				>
					<div class="w-6 flex items-center justify-center">
						{#if typeof entry.icon === 'string'}
							<img src={entry.icon} alt={entry.label} class="size-4" />
						{:else}
							{@const Icon = entry.icon}
							<Icon class="size-4" />
						{/if}
					</div>
					<span>{entry.label}</span>
				</button>
			{/each}
		</QuickSelectOverlay>
	{/if}
</div>