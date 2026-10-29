<script lang="ts">
	import type { Link } from '$lib/types/library_link';
	import type { Quote } from '$lib/types/library_quote';
	import type { MusicRelease } from '$lib/types/library_music';
	import type { BookRelease } from '$lib/types/library_book';
	import type { Note } from '$lib/types/note';
	import { onMount } from 'svelte';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { apiRoutes } from '$lib/config/apiRoutes';
	import MusicReleasesWidget from '$lib/components/dashboard/widgets/MusicReleasesWidget.svelte';
	import BookReleasesWidget from '$lib/components/dashboard/widgets/BookReleasesWidget.svelte';
	import NewestNotesWidget from '$lib/components/dashboard/widgets/NewestNotesWidget.svelte';
	import NewestLinksWidget from '$lib/components/dashboard/widgets/NewestLinksWidget.svelte';
	import QuoteWidget from '$lib/components/dashboard/widgets/QuoteWidget.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	const auth = getAuth();
	const ts = getTranslation();
	const apiService = auth.apiService;

	let quote = $state<Quote | null>(null);
	let musicReleases = $state<MusicRelease[]>([]);
	let bookReleases = $state<BookRelease[]>([]);
	let newestNotes = $state<Note[]>([]);
	let newestLinks = $state<Link[]>([]);
	let notesLoaded = $state<boolean>(false);

	onMount(() => {
		apiService.get(apiRoutes.libraries.quotes.getRandom, null).then((res) => {
			if (res) quote = res.data as Quote;
		});
		apiService.list(apiRoutes.libraries.music.releases).then((res) => {
			if (res) musicReleases = (res.data as MusicRelease[]).slice(0, 5);
		});
		apiService.list(apiRoutes.libraries.books.releases).then((res) => {
			if (res) bookReleases = (res.data as BookRelease[]).slice(0, 5);
		});
		apiService.list(apiRoutes.notes.list).then((res) => {
			if (res) {
				newestNotes = (res.data as Note[])
					.sort((a, b) => {
						const aTime = Math.max(new Date(a.created_at).getTime(), new Date(a.updated_at).getTime());
						const bTime = Math.max(new Date(b.created_at).getTime(), new Date(b.updated_at).getTime());
						return bTime - aTime;
					})
					.slice(0, 5);
			}
			notesLoaded = true;
		});
		apiService.list(apiRoutes.libraries.links.newest).then((res) => {
			if (res) newestLinks = res.data as Link[];
		});
	});
</script>

<div class="flex flex-col gap-12">
	{#if musicReleases.length > 0}
		<MusicReleasesWidget {musicReleases} {ts} />
	{/if}

	{#if bookReleases.length > 0}
		<BookReleasesWidget {bookReleases} {ts} />
	{/if}

	{#if newestNotes.length > 0}
		<NewestNotesWidget {newestNotes} {ts} />
	{/if}

	{#if newestLinks.length > 0}
		<NewestLinksWidget {newestLinks} {ts} />
	{/if}

	{#if quote}
		<QuoteWidget {quote} />
	{/if}

	{#if notesLoaded && musicReleases.length === 0 && bookReleases.length === 0 && newestNotes.length === 0 && newestLinks.length === 0 && !quote}
		<EmptyState title={ts.get.home.more_to_come} description={ts.get.home.more_to_come_desc} smallerTitle={true} />
	{/if}
</div>
