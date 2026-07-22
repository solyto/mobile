<script lang="ts">
	import { scale, blur } from 'svelte/transition';

	let { src, previewSrc = '', alt = '', class: customClass = '' } = $props<{
		src: string;
		previewSrc?: string;
		alt?: string;
		class?: string;
	}>();

	let previewLoaded = $state(false);
	let fullLoaded = $state(false);

	$effect(() => {
		previewLoaded = false;
		fullLoaded = false;

		if (previewSrc) {
			const preview = new Image();
			preview.onload = () => (previewLoaded = true);
			preview.src = previewSrc;
		}

		const full = new Image();
		full.onload = () => (fullLoaded = true);
		full.src = src;
	});
</script>

{#if previewLoaded}
	<img src={previewSrc} {alt} class={customClass} in:scale />
{/if}
{#if fullLoaded}
	<img {src} {alt} class="{previewLoaded ? 'absolute inset-0 ' : ''}{customClass}" in:blur={{ amount: 12, duration: 400 }} />
{/if}
