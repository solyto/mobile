<script lang="ts">
	import CoverImage from '$lib/components/libraries/shared/CoverImage.svelte';
	import { setLoadedCovers } from '$lib/state/LoadedCovers.svelte';

	setLoadedCovers();

	let props: { src: string; alt?: string } = $props();
</script>

<CoverImage {...props} />
