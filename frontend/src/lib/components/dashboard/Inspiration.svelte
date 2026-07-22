<script lang="ts">
	import type { Link } from '$lib/types/library_link';
	import type { Quote } from '$lib/types/library_quote';
	import type { MusicRelease } from '$lib/types/library_music';
	import type { BookRelease } from '$lib/types/library_book';
	import type { MovieRelease } from '$lib/types/library_movie';
	import type { Note } from '$lib/types/note';
	import { onMount } from 'svelte';
	import { blur } from 'svelte/transition';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import ApiService from '$lib/services/ApiService';
	import { apiRoutes } from '$lib/config/apiRoutes';
	import MusicReleasesWidget from '$lib/components/dashboard/widgets/MusicReleasesWidget.svelte';
	import BookReleasesWidget from '$lib/components/dashboard/widgets/BookReleasesWidget.svelte';
	import MovieReleasesWidget from '$lib/components/dashboard/widgets/MovieReleasesWidget.svelte';
	import NewestNotesWidget from '$lib/components/dashboard/widgets/NewestNotesWidget.svelte';
	import NewestLinksWidget from '$lib/components/dashboard/widgets/NewestLinksWidget.svelte';
	import QuoteWidget from '$lib/components/dashboard/widgets/QuoteWidget.svelte';

	const auth = getAuth();
	const ts = getTranslation();
	const apiService = new ApiService(auth.getToken());

	let quote = $state<Quote | null>(null);
	let musicReleases = $state<MusicRelease[]>([]);
	let bookReleases = $state<BookRelease[]>([]);
	let movieReleases = $state<MovieRelease[]>([]);
	let newestNotes = $state<Note[]>([]);
	let newestLinks = $state<Link[]>([]);
	let loadedCount = $state(0);

	let isEmpty = $derived(
		loadedCount >= 6 &&
			musicReleases.length === 0 &&
			bookReleases.length === 0 &&
			movieReleases.length === 0 &&
			newestNotes.length === 0 &&
			newestLinks.length === 0 &&
			!quote
	);

	onMount(() => {
		apiService.get(apiRoutes.libraries.quotes.getRandom, null).then((res) => {
			if (res) quote = res.data as Quote;
			loadedCount++;
		});
		apiService.list(apiRoutes.libraries.music.releases).then((res) => {
			if (res) musicReleases = (res.data as MusicRelease[]).slice(0, 5);
			loadedCount++;
		});
		apiService.list(apiRoutes.libraries.books.releases).then((res) => {
			if (res) bookReleases = (res.data as BookRelease[]).slice(0, 5);
			loadedCount++;
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
			loadedCount++;
		});
		apiService.list(apiRoutes.libraries.movies.releases).then((res) => {
			if (res) movieReleases = (res.data as MovieRelease[]).slice(0, 5);
			loadedCount++;
		});
		apiService.list(apiRoutes.libraries.links.newest).then((res) => {
			if (res) newestLinks = res.data as Link[];
			loadedCount++;
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

	{#if isEmpty}
		<div class="flex flex-col gap-3" in:blur>
			<p class="text-sm text-c-neutral-4 dark:text-c-neutral-5">{ts.get.home.inspiration_empty_hint}</p>
			<div class="flex flex-wrap gap-3">
				<a
					href="/notes"
					class="text-xs text-c-primary transition-colors hover:text-c-primary/70"
				>
					{ts.get.nav.notes} →
				</a>
				<a
					href="/libraries"
					class="text-xs text-c-primary transition-colors hover:text-c-primary/70"
				>
					{ts.get.nav.libraries} →
				</a>
			</div>
		</div>
	{/if}
</div>
