<script lang="ts">
	import { getNavigation } from '$lib/state/Navigation.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getNotes } from '$lib/state/Notes.svelte';
	import { getMusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import { getBookLibrary } from '$lib/state/BookLibrary.svelte';
	import { getLinkLibrary } from '$lib/state/LinkLibrary.svelte';
	import { getQuoteLibrary } from '$lib/state/QuoteLibrary.svelte';
	import MusicReleasesWidget from '$lib/components/dashboard/widgets/MusicReleasesWidget.svelte';
	import BookReleasesWidget from '$lib/components/dashboard/widgets/BookReleasesWidget.svelte';
	import NewestNotesWidget from '$lib/components/dashboard/widgets/NewestNotesWidget.svelte';
	import NewestLinksWidget from '$lib/components/dashboard/widgets/NewestLinksWidget.svelte';
	import QuoteWidget from '$lib/components/dashboard/widgets/QuoteWidget.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';

	const MAX_RELEASES = 5;

	const nav = getNavigation();
	const ts = getTranslation();
	const notes = getNotes();
	const music = getMusicLibrary();
	const books = getBookLibrary();
	const links = getLinkLibrary();
	const quotes = getQuoteLibrary();

	let musicReleases = $derived(music.releases.slice(0, MAX_RELEASES));
	let bookReleases = $derived(books.releases.slice(0, MAX_RELEASES));

	function notesLoaded(): boolean {
		return notes.recentNotesLoaded || !nav.features.notes;
	}

	function isEmpty(): boolean {
		return musicReleases.length === 0 && bookReleases.length === 0 && notes.recentNotes.length === 0 && links.newestEntries.length === 0 && !quotes.randomQuote;
	}
</script>

<div class="flex flex-col gap-12">
	{#if musicReleases.length > 0}
		<MusicReleasesWidget {musicReleases} {ts} />
	{/if}

	{#if bookReleases.length > 0}
		<BookReleasesWidget {bookReleases} {ts} />
	{/if}

	{#if notes.recentNotes.length > 0}
		<NewestNotesWidget newestNotes={notes.recentNotes} {ts} />
	{/if}

	{#if links.newestEntries.length > 0}
		<NewestLinksWidget newestLinks={links.newestEntries} {ts} />
	{/if}

	{#if quotes.randomQuote}
		<QuoteWidget quote={quotes.randomQuote} />
	{/if}

	{#if notesLoaded() && isEmpty()}
		<EmptyState title={ts.get.home.more_to_come} description={ts.get.home.more_to_come_desc} titleSize="text-lg" />
	{/if}
</div>
