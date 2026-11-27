<script lang="ts">
	import { grabFaviconFromUrl } from '$lib/helpers/ImageHelper';
	import ManageShortcuts from '$lib/components/shortcuts/ManageShortcuts.svelte';
	import IconExternalLink from '$lib/icons/lucide/external-link.svelte';
	import IconGlobe from '$lib/icons/lucide/globe.svelte';
	import IconPen from '$lib/icons/lucide/pen.svelte';
	import { getShortcuts } from '$lib/state/Shortcuts.svelte';
	import type { Translation } from '$lib/state/Translation.svelte';
	import { safeHref } from '$lib/helpers/UrlHelper';

	const shortcuts = getShortcuts();

	let { ts }: {
		ts: Translation;
	} = $props();

	let manageModalOpen = $state(false);

	function toggleModal(): void {
		manageModalOpen = !manageModalOpen;
	}
</script>

{#if shortcuts.loaded}
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
				<svelte:element
					this={safeHref(shortcut.url) ? 'a' : 'div'}
					href={safeHref(shortcut.url)}
					target="_blank"
					rel="external"
					class="group flex items-center gap-2.5 py-0.5 transition-colors"
				>
					<img
						src={grabFaviconFromUrl(shortcut.url)}
						alt={ts.get.widgets.favicon_alt}
						class="h-4 w-4 shrink-0"
					/>
					<span class="truncate text-sm text-c-neutral-7 transition-colors group-hover:text-c-primary dark:text-c-neutral-3">
						{shortcut.title}
					</span>
					<IconExternalLink
						size={12}
						class="ml-auto shrink-0 text-c-neutral-4 opacity-0 transition-opacity group-hover:opacity-100"
					/>
				</svelte:element>
			{:else}
				<span class="text-xs text-c-neutral-4 dark:text-c-neutral-5">
					{ts.get.widgets.no_shortcuts_hint}
				</span>
			{/each}
		</div>
	</div>
{/if}

{#if manageModalOpen}
	<ManageShortcuts onClose={toggleModal} />
{/if}
