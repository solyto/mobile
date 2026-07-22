<script lang="ts">
	import { scale } from 'svelte/transition';
	import type { MusicRelease } from '$lib/types/library_music';

	let { release } = $props<{ release: MusicRelease }>();
</script>

<iframe
	title="deezer-widget"
	src="https://widget.deezer.com/widget/auto/album/{release.id}"
	width="100%"
	height="300"
	frameborder="0"
	allowtransparency={true}
	allow="encrypted-media; clipboard-write"
	class="rounded-lg shadow-sm"
	in:scale
></iframe>
