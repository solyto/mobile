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

	let loadedPreview = $state<string | null>(null);
	let previewLoaded = $derived(previewSrc !== '' && loadedPreview === previewSrc);
	let fullLoaded = $derived(loadedCovers.has(src));
</script>

{#if previewSrc && !previewLoaded && !fullLoaded}
	<img src={previewSrc} alt="" hidden onload={() => (loadedPreview = previewSrc)} />
{/if}
{#if !fullLoaded}
	<img {src} alt="" hidden onload={() => loadedCovers.add(src)} />
{/if}

{#if previewLoaded}
	<img src={previewSrc} {alt} class={customClass} in:scale />
{/if}
{#if fullLoaded}
	<img {src} {alt} class={[previewLoaded && 'absolute inset-0', customClass]} in:blur={{ amount: 12, duration: 400 }} />
{/if}
