<script lang="ts">
	import { scale, blur } from 'svelte/transition';
	import { getLoadedCovers } from '$lib/state/LoadedCovers.svelte';

	const loadedCovers = getLoadedCovers();

	let { src, previewSrc = '', alt = '', class: customClass = '' }: {
		src: string;
		previewSrc?: string;
		alt?: string;
		class?: string;
	} = $props();

	let previewLoaded = $state(false);
	// Already loaded once: render right away, so the image shows without waiting and without the intro transition.
	let fullLoaded = $state(loadedCovers.has(src));

	$effect(() => {
		if (loadedCovers.has(src)) {
			fullLoaded = true;
			return;
		}

		previewLoaded = false;
		fullLoaded = false;

		const preview = new Image();
		if (previewSrc) {
			preview.onload = () => (previewLoaded = true);
			preview.src = previewSrc;
		}

		const full = new Image();
		full.onload = () => {
			loadedCovers.add(src);
			fullLoaded = true;
		};
		full.src = src;

		return () => {
			preview.onload = null;
			full.onload = null;
		};
	});
</script>

{#if previewLoaded}
	<img src={previewSrc} {alt} class={customClass} in:scale />
{/if}
{#if fullLoaded}
	<img {src} {alt} class="{previewLoaded ? 'absolute inset-0 ' : ''}{customClass}" in:blur={{ amount: 12, duration: 400 }} />
{/if}
