<script lang="ts">
	import { setBookLibrary, type BookLibrary } from '$lib/state/BookLibrary.svelte';
	import { setMusicLibrary, type MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import Recommender from '$lib/components/libraries/shared/Recommender.svelte';

	let { type, onReady }: { type: 'books' | 'music'; onReady: (library: BookLibrary | MusicLibrary) => void } = $props();

	// svelte-ignore state_referenced_locally
	const library = type === 'books' ? setBookLibrary() : setMusicLibrary();
	// svelte-ignore state_referenced_locally
	onReady(library);
</script>

<Recommender {library} />
