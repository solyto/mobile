<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import IconImageOff from '@lucide/svelte/icons/image-off';
	import { getClipboard } from '$lib/state/Clipboard.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import type { ClipboardEntry } from '$lib/types/clipboard';

	let { entry }: { entry: ClipboardEntry } = $props();

	const clipboard = getClipboard();
	const ts = getTranslation();

	let src = $state<string | null>(null);
	let failed = $state<boolean>(false);
	let destroyed = false;

	onMount(async () => {
		// A failed request (missing file, offline) shows the error placeholder; network errors still reach the global handler.
		let blob: Blob | null = null;
		try {
			blob = await clipboard.getImage(entry);
		} finally {
			if (!blob && !destroyed) failed = true;
		}
		if (!blob || destroyed) return;
		src = URL.createObjectURL(blob);
	});

	onDestroy(() => {
		destroyed = true;
		if (src) URL.revokeObjectURL(src);
	});
</script>

{#if src}
	<img {src} alt="Clipboard" class="block max-h-64 rounded-md" />
{:else if failed}
	<div
		class="flex h-32 w-48 items-center justify-center rounded-md bg-c-neutral-2 text-c-neutral-5 dark:bg-s-dark-2"
		role="img"
		aria-label={ts.get.clipboard.image_load_error}
		title={ts.get.clipboard.image_load_error}
	>
		<IconImageOff size={24} />
	</div>
{:else}
	<div class="h-32 w-48 rounded-md bg-c-neutral-2 dark:bg-s-dark-2"></div>
{/if}
