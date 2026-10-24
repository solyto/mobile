<script lang="ts">
	import { scale, blur } from 'svelte/transition';

	let { src, previewSrc = '', alt = '', class: customClass = '' }: {
		src: string;
		previewSrc?: string;
		alt?: string;
		class?: string;
	} = $props();

	let previewLoaded = $state(false);
	let fullLoaded = $state(false);

	$effect(() => {
		previewLoaded = false;
		fullLoaded = false;

		const preview = new Image();
		if (previewSrc) {
			preview.onload = () => (previewLoaded = true);
			preview.src = previewSrc;
		}

		const full = new Image();
		full.onload = () => (fullLoaded = true);
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
