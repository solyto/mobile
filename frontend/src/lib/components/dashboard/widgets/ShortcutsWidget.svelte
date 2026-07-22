<script lang="ts">
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import ManageShortcuts from '$lib/components/shortcuts/ManageShortcuts.svelte';
	import IconExternalLink from '@lucide/svelte/icons/external-link';
	import IconGlobe from '@lucide/svelte/icons/globe';
	import IconPen from '@lucide/svelte/icons/pen';
	import { onMount } from 'svelte';
	import { getShortcuts } from '$lib/state/Shortcuts.svelte';
	import type { Translation } from '$lib/state/Translation.svelte';

	const shortcuts = getShortcuts();

	let { ts } = $props<{
		ts: Translation;
	}>();

	let manageModalOpen = $state(false);

	onMount(async () => {
		await shortcuts.load();
	});

	function toggleModal(): void {
		manageModalOpen = !manageModalOpen;
	}
</script>

{#if shortcuts.loaded && shortcuts.shortcuts.length > 0}
	<div>
		<div class="mb-2 flex items-center gap-2">
			<IconGlobe size={15} class="text-c-heading dark:text-c-primary" />
			<span class="text-xs font-semibold tracking-wider text-c-heading uppercase dark:text-c-primary">
				{ts.get.widgets.shortcuts}
			</span>
			<button
				class="ml-auto cursor-pointer text-c-neutral-3 transition-colors hover:text-c-neutral-5 dark:text-c-neutral-6 dark:hover:text-c-neutral-4"
				onclick={toggleModal}
			>
				<IconPen size={13} />
			</button>
		</div>
		<div class="flex flex-col gap-1">
			{#each shortcuts.shortcuts as shortcut (shortcut.id)}
				<a
					href={shortcut.url}
					target="_blank"
					rel="external"
					class="group flex items-center gap-2.5 py-0.5 transition-colors"
				>
					<img
						src={grabFaviconFromUrl(shortcut.url)}
						alt="Favicon"
						class="h-4 w-4 shrink-0"
					/>
					<span class="truncate text-sm text-c-neutral-7 transition-colors group-hover:text-c-primary dark:text-c-neutral-3">
						{shortcut.title}
					</span>
					<IconExternalLink
						size={12}
						class="ml-auto shrink-0 text-c-neutral-4 opacity-0 transition-opacity group-hover:opacity-100"
					/>
				</a>
			{/each}
		</div>
	</div>
{/if}

{#if manageModalOpen}
	<ManageShortcuts onClose={toggleModal} />
{/if}
