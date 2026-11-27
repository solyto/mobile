<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { createdEntryValue, genreEntries, selectedIds, tagEntries } from '$lib/helpers/MultiSelectHelper';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import DateInput from '$lib/components/forms/DateInput.svelte';
	import MultiSelect, { type MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { libraryCoverUrl } from '$lib/helpers/LibraryCoverHelper';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import type { CreateMovieRequest, Movie, MovieRelease, UpdateMovieRequest } from '$lib/types/library_movie';
	import CreateModal from '$lib/components/libraries/shared/CreateModal.svelte';
	import { getMovieLibrary } from '$lib/state/MovieLibrary.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import CreateModalSearchButton from '$lib/components/libraries/shared/CreateModalSearchButton.svelte';
	import CreateModalImport from '$lib/components/libraries/shared/CreateModalImport.svelte';
	import MovieSearch from '$lib/components/libraries/movies/MovieSearch.svelte';
	import ImdbIcon from '$lib/assets/services/imdb_icon.svg';
	import TmdbIcon from '$lib/assets/services/tmdb_icon.svg';
	import { getIntegrations } from '$lib/state/Integrations.svelte';

	const ts = getTranslation();
	const notifications = getUiNotifications();
	const integrations = getIntegrations();
	const library = getMovieLibrary();
	const tags = getTags();
	const loadingIndicator = getLoadingIndicator();
	const saving = new SaveAction(() => (activeEntry ? ts.get.libraries.movies.update_error : ts.get.libraries.movies.create_error));

	let activeEntry = $state<Movie | null>(library.activeEntry);

	let titleValue = $state<string>(activeEntry ? activeEntry.title : '');
	let coverValue = $state<string>('');
	let linkValue = $state<string>(activeEntry?.link ?? '');
	let publicationYearValue = $state<number | null>(activeEntry?.publication_year ?? null);
	let startedAtValue = $state<string>(activeEntry?.started_at?.substring(0, 10) ?? '');
	let finishedAtValue = $state<string>(activeEntry?.finished_at?.substring(0, 10) ?? '');
	let categoryValue = $state<string>(activeEntry ? activeEntry.category : 'movie');
	let selectedGenres = $state<MultiSelectEntry[]>(genreEntries(activeEntry?.genres ?? []));
	let selectedTags = $state<MultiSelectEntry[]>(tagEntries(activeEntry?.tags ?? []));
	let selectedRating = $state(activeEntry?.rating ?? 0);
	let isWishlist = $state<boolean>(activeEntry ? activeEntry.wishlist : false);
	let linkInput = $state<HTMLInputElement | null>(null);
	let importLoading = $state<boolean>(false);
	let importDropdownOpen = $state<boolean>(false);

	const imdbImport = { label: 'IMDb', icon: ImdbIcon, onClick: () => importFrom('imdb', 'imdb.com', ts.get.libraries.movies.imdb_import_validation_error) };
	const tmdbImport = { label: 'TMDB', icon: TmdbIcon, onClick: () => importFrom('tmdb', 'themoviedb.org', ts.get.libraries.movies.tmdb_import_validation_error) };
	const importOptions = integrations.isConfigured('tmdb') ? [imdbImport, tmdbImport] : [imdbImport];

	function onCreateGenre(label: string): Promise<string | null> {
		return createdEntryValue(library.createGenre(label), () => notifications.error(ts.get.libraries.genre_error));
	}

	function onCreateTag(label: string): Promise<string | null> {
		return createdEntryValue(tags.create(label), () => notifications.error(ts.get.libraries.tag_error));
	}

	const categoryOptions: { label: string; value: string }[] = [
		{ label: ts.get.libraries.movies.category_movie, value: 'movie' },
		{ label: ts.get.libraries.movies.category_series, value: 'series' }
	];

	function createRequest(): CreateMovieRequest {
		return {
			title: titleValue,
			category: categoryValue,
			publication_year: publicationYearValue,
			started_at: startedAtValue !== '' ? startedAtValue : null,
			finished_at: finishedAtValue !== '' ? finishedAtValue : null,
			wishlist: isWishlist,
			genres: selectedIds(selectedGenres),
			tags: selectedIds(selectedTags),
			rating: selectedRating > 0 ? selectedRating : null,
			cover_path: coverValue != '' ? coverValue : null,
			link: linkValue != '' ? linkValue : null
		};
	}

	function updateRequest(): UpdateMovieRequest {
		return {
			title: titleValue,
			category: categoryValue,
			publication_year: publicationYearValue,
			started_at: startedAtValue !== '' ? startedAtValue : null,
			finished_at: finishedAtValue !== '' ? finishedAtValue : null,
			wishlist: isWishlist,
			genres: selectedIds(selectedGenres),
			tags: selectedIds(selectedTags),
			rating: selectedRating > 0 ? selectedRating : null,
			...(coverValue !== '' ? { cover_path: coverValue } : {}),
			link: linkValue != '' ? linkValue : null
		};
	}

	function resetForm(): void {
		titleValue = '';
		categoryValue = '';
		startedAtValue = '';
		finishedAtValue = '';
		coverValue = '';
		linkValue = '';
		selectedGenres = [];
		isWishlist = false;
	}

	async function onsubmit(): Promise<void> {
		const ok = await saving.run(() => (activeEntry ? library.update(activeEntry, updateRequest()) : library.create(createRequest())));
		if (!ok) return;
		if (!activeEntry) resetForm();
		library.closeCreateModal();
	}

	function onSearchSelect(movie: MovieRelease): void {
		titleValue = movie.title;
		if (movie.release_year) publicationYearValue = movie.release_year;
		if (movie.cover) coverValue = movie.cover;
	}

	async function importFrom(provider: string, domain: string, validationError: string): Promise<void> {
		if (linkValue === '') {
			linkInput?.focus();
			return;
		}

		if (!linkValue.includes(domain)) {
			notifications.error(validationError);
			return;
		}

		importLoading = true;
		loadingIndicator.start();
		try {
			const movie = await library.importFrom(provider, linkValue);
			if (!movie) {
				notifications.error(ts.get.libraries.movies.import_error);
				return;
			}

			titleValue = movie.title;
			coverValue = movie.cover ?? '';
			publicationYearValue = movie.release_year;

			if (movie.type === 'tv' || movie.type === 'tvSeries') categoryValue = 'series';
			else if (movie.type === 'movie') categoryValue = 'movie';

			for (const genre of movie.genres) {
				const existing = library.genres.find((g) => g.title === genre);
				if (existing) selectedGenres.push(...genreEntries([existing]));
			}
			importDropdownOpen = false;
		} finally {
			loadingIndicator.stop();
			importLoading = false;
		}
	}

	function modalTitle(): string {
		return activeEntry !== null ? ts.get.libraries.movies.edit_movie : ts.get.libraries.movies.add_movie;
	}

	function existingCover(): string | null {
		return activeEntry ? libraryCoverUrl(library, String(activeEntry.cover)) : null;
	}
</script>

<CreateModal
	title={modalTitle()}
	{library}
	existingCover={existingCover()}
	newCover={coverValue}
	bind:selectedRating
	bind:isWishlist
>
	<ModalFormRow label={ts.get.libraries.books.title}>
		<TextInput bind:value={titleValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.movies.category}>
		<Select bind:value={categoryValue} options={categoryOptions} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.genres}>
		<MultiSelect bind:value={selectedGenres} options={genreEntries(library.genres)} allowUserOptions oncreate={onCreateGenre} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.tags}>
		<MultiSelect bind:value={selectedTags} options={tagEntries(tags.tags)} allowUserOptions oncreate={onCreateTag} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.publication_year}>
		<NumberInput bind:value={publicationYearValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.books.started_at}>
		<DateInput bind:value={startedAtValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.books.finished_at}>
		<DateInput bind:value={finishedAtValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.movies.cover}>
		<TextInput bind:value={coverValue} placeholder="https://" />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.movies.link}>
		<TextInput bind:value={linkValue} bind:input={linkInput} placeholder="https://" />
	</ModalFormRow>
	<div class="mt-8 flex w-full flex-row items-center justify-end gap-3">
		{#if !activeEntry}
			{#if integrations.isConfigured('tmdb')}
				<CreateModalSearchButton {library} {ts} />
			{/if}
			<CreateModalImport options={importOptions} {ts} loading={importLoading} bind:open={importDropdownOpen} />
		{/if}
		<TextButton title={ts.get.layout.save} onclick={onsubmit} />
	</div>
</CreateModal>

{#if library.externalSearchModalVisible}
	<MovieSearch {library} {ts} onSelect={onSearchSelect} />
{/if}
