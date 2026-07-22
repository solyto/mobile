<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import DateInput from '$lib/components/forms/DateInput.svelte';
	import MultiSelect, { type MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import type { CreateMovieRequest, Movie, MovieRelease, UpdateMovieRequest } from '$lib/types/library_movie';
	import CreateModal from '$lib/components/libraries/shared/CreateModal.svelte';
	import { getMovieLibrary } from '$lib/state/MovieLibrary.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import CreateModalSearchButton from '$lib/components/libraries/shared/CreateModalSearchButton.svelte';
	import CreateModalImport from '$lib/components/libraries/shared/CreateModalImport.svelte';
	import MovieSearch from '$lib/components/libraries/movies/MovieSearch.svelte';
	import ImdbIcon from '$lib/assets/services/imdb_icon.svg';
	import TmdbIcon from '$lib/assets/services/tmdb_icon.svg';

	const ts = getTranslation();
	const notifications = getUiNotifications();
	const library = getMovieLibrary();
	const tags = getTags();
	const auth = getAuth();
	const loadingIndicator = getLoadingIndicator();

	let activeEntry = $state<Movie | null>(library.activeEntry);

	let titleValue = $state<string>(activeEntry ? activeEntry.title : '');
	let coverValue = $state<string>('');
	let linkValue = $state<string>(activeEntry?.link ?? '');
	let publicationYearValue = $state<number | null>(activeEntry?.publication_year ?? null);
	let startedAtValue = $state<string>(activeEntry?.started_at?.substring(0, 10) ?? '');
	let finishedAtValue = $state<string>(activeEntry?.finished_at?.substring(0, 10) ?? '');
	let categoryValue = $state<string>(activeEntry ? activeEntry.category : 'movie');
	let selectedGenres = $state<{ label: string; value: string }[]>(
		activeEntry ? activeEntry.genres.map((g) => ({ label: g.title, value: g.id.toString() })) : []
	);
	let selectedTags = $state<{ label: string; value: string }[]>(
		activeEntry ? activeEntry.tags.map((t) => ({ label: t.name, value: t.id.toString() })) : []
	);
	let selectedRating = $state(activeEntry?.rating ?? 0);
	let isWishlist = $state<boolean>(activeEntry ? activeEntry.wishlist : false);
	let linkInput = $state<HTMLInputElement | null>(null);
	let importLoading = $state<boolean>(false);
	let importDropdownOpen = $state<boolean>(false);

	const importOptions = [
		{ label: 'IMDb', icon: ImdbIcon, onClick: () => importFrom('imdb', 'imdb.com', ts.get.libraries.movies.imdb_import_validation_error) },
		{ label: 'TMDB', icon: TmdbIcon, onClick: () => importFrom('tmdb', 'themoviedb.org', ts.get.libraries.movies.tmdb_import_validation_error) }
	];

	let genreOptions: { label: string; value: string }[] = $derived(
		library.genres.map((genre) => ({ label: genre.title, value: genre.id.toString() }))
	);

	let tagOptions: { label: string; value: string }[] = $derived(
		tags.tags.map((tag) => ({ label: tag.name, value: tag.id.toString() }))
	);

	async function onCreateGenre(data: { option: MultiSelectEntry }): Promise<void> {
		const created = await library.createGenre(data.option.label.toString());
		if (!created) {
			notifications.error(ts.get.libraries.genre_error);
			return;
		}
		data.option.value = created.id.toString();
	}

	async function onCreateTag(data: { option: MultiSelectEntry }): Promise<void> {
		const created = await tags.create(data.option.label.toString());
		if (!created) {
			notifications.error(ts.get.libraries.tag_error);
			return;
		}
		data.option.value = created.id.toString();
	}

	const categoryOptions: { label: string; value: string }[] = [
		{ label: ts.get.libraries.movies.category_movie, value: 'movie' },
		{ label: ts.get.libraries.movies.category_series, value: 'series' }
	];

	async function onsubmit(): Promise<void> {
		if (activeEntry) {
			return await update();
		} else {
			return await create();
		}
	}

	async function create(): Promise<void> {
		loadingIndicator.start();

		const request: CreateMovieRequest = {
			title: titleValue,
			category: categoryValue,
			publication_year: publicationYearValue,
			started_at: startedAtValue !== '' ? startedAtValue : null,
			finished_at: finishedAtValue !== '' ? finishedAtValue : null,
			wishlist: isWishlist,
			genres: selectedGenres.map((g) => parseInt(g.value)),
			tags: selectedTags.map((t) => parseInt(t.value)),
			rating: selectedRating > 0 ? selectedRating : null,
			cover_path: coverValue != '' ? coverValue : null,
			link: linkValue != '' ? linkValue : null
		};
		const ok = await library.create(request);
		if (ok) {
			titleValue = '';
			categoryValue = '';
			startedAtValue = '';
			finishedAtValue = '';
			coverValue = '';
			linkValue = '';
			selectedGenres = [];
			isWishlist = false;
			library.closeCreateModal();
			await library.load();
		} else {
			notifications.error(ts.get.libraries.movies.create_error);
		}

		loadingIndicator.stop();
	}

	async function update(): Promise<void> {
		loadingIndicator.start();

		const request: UpdateMovieRequest = {
			title: titleValue,
			category: categoryValue,
			publication_year: publicationYearValue,
			started_at: startedAtValue !== '' ? startedAtValue : null,
			finished_at: finishedAtValue !== '' ? finishedAtValue : null,
			wishlist: isWishlist,
			genres: selectedGenres.map((g) => parseInt(g.value)),
			tags: selectedTags.map((t) => parseInt(t.value)),
			rating: selectedRating > 0 ? selectedRating : null,
			...(coverValue !== '' ? { cover_path: coverValue } : {}),
			link: linkValue != '' ? linkValue : null
		};
		const ok = await library.update(activeEntry!, request);
		if (ok) {
			library.closeCreateModal();
			await library.load();
		} else {
			notifications.error(ts.get.libraries.movies.update_error);
		}

		loadingIndicator.stop();
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
		const movie = await library.importFrom(provider, linkValue);

		if (!movie) {
			notifications.error(ts.get.libraries.movies.import_error);
			loadingIndicator.stop();
			importLoading = false;
			return;
		}

		titleValue = movie.title;
		coverValue = movie.cover ?? '';
		publicationYearValue = movie.release_year;

		if (movie.type === 'tv' || movie.type === 'tvSeries') categoryValue = 'series';
		else if (movie.type === 'movie') categoryValue = 'movie';

		for (const genre of movie.genres) {
			const existing = library.genres.find((g) => g.title === genre);
			if (existing) selectedGenres.push({ label: existing.title, value: existing.id.toString() });
		}

		loadingIndicator.stop();
		importLoading = false;
		importDropdownOpen = false;
	}
</script>

<CreateModal
	title={activeEntry !== null
		? ts.get.libraries.movies.edit_movie
		: ts.get.libraries.movies.add_movie}
	{library}
	existingCover={activeEntry
		? `${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${activeEntry.cover}`
		: null}
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
		<MultiSelect bind:value={selectedGenres} options={genreOptions} allowUserOptions oncreate={onCreateGenre} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.tags}>
		<MultiSelect bind:value={selectedTags} options={tagOptions} allowUserOptions oncreate={onCreateTag} />
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
			<CreateModalSearchButton {library} {ts} />
			<CreateModalImport options={importOptions} {ts} loading={importLoading} bind:open={importDropdownOpen} />
		{/if}
		<TextButton title={ts.get.layout.save} onclick={onsubmit} />
	</div>
</CreateModal>

{#if library.externalSearchModalVisible}
	<MovieSearch {library} {ts} onSelect={onSearchSelect} />
{/if}
