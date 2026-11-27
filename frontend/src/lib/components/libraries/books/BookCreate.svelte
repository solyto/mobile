<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import DateInput from '$lib/components/forms/DateInput.svelte';
	import MultiSelect, { type MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import type {
		Book,
		BookRelease,
		CreateBookRequest,
		UpdateBookRequest
	} from '$lib/types/library_book';
	import { libraryCoverUrl } from '$lib/helpers/LibraryCoverHelper';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTags } from '$lib/state/Tags.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import { getBookLibrary } from '$lib/state/BookLibrary.svelte';
	import CreateModal from '$lib/components/libraries/shared/CreateModal.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import CreateModalSearchButton from '$lib/components/libraries/shared/CreateModalSearchButton.svelte';
	import CreateModalImport from '$lib/components/libraries/shared/CreateModalImport.svelte';
	import BookSearch from '$lib/components/libraries/books/BookSearch.svelte';
	import IconHardcover from '$lib/components/ui/icons/IconHardcover.svelte';
	import GoodreadsIcon from '$lib/assets/services/goodreads_icon.svg';
	import { getIntegrations } from '$lib/state/Integrations.svelte';
	import { createdEntryValue, genreEntries, selectedIds, tagEntries } from '$lib/helpers/MultiSelectHelper';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';

	const ts = getTranslation();
	const library = getBookLibrary();
	const tags = getTags();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const integrations = getIntegrations();
	const saving = new SaveAction(() => (activeEntry ? ts.get.libraries.books.update_error : ts.get.libraries.books.create_error));

	let activeEntry = $state<Book | null>(library.activeEntry);

	let titleInput = $state<HTMLInputElement | null>(null);
	let titleValue = $state<string>(activeEntry ? activeEntry.title : '');
	let authorValue = $state<string>(activeEntry ? activeEntry.author : '');
	let seriesValue = $state<string>(activeEntry?.series ?? '');
	let volumeValue = $state<number | null>(activeEntry?.volume ?? null);
	let coverValue = $state<string>('');
	let linkValue = $state<string>(activeEntry?.link ?? '');
	let publicationYearValue = $state<number | null>(activeEntry?.publication_year ?? null);
	let pagesValue = $state<number | null>(activeEntry?.pages ?? null);
	let currentPageValue = $state<number | null>(activeEntry?.current_page ?? null);
	let lentToValue = $state<string>(activeEntry?.lent_to ?? '');
	let isWhereValue = $state<string>(activeEntry?.is_where ?? '');
	let startedAtValue = $state<string>(activeEntry?.started_at?.substring(0, 10) ?? '');
	let finishedAtValue = $state<string>(activeEntry?.finished_at?.substring(0, 10) ?? '');
	let selectedGenres = $state<MultiSelectEntry[]>(genreEntries(activeEntry?.genres ?? []));
	let selectedTags = $state<MultiSelectEntry[]>(tagEntries(activeEntry?.tags ?? []));
	let selectedRating = $state(activeEntry?.rating ?? 0);
	let isWishlist = $state<boolean>(activeEntry ? activeEntry.wishlist : false);
	let summaryValue = $state<string>(activeEntry?.summary ?? '');
	let linkInput = $state<HTMLInputElement | null>(null);
	let importLoading = $state<boolean>(false);
	let importDropdownOpen = $state<boolean>(false);

	const hardcoverImport = {
		label: 'Hardcover',
		icon: IconHardcover,
		onClick: () =>
			importFrom(
				'hardcover',
				'hardcover.app',
				ts.get.libraries.books.hardcover_import_validation_error
			)
	};

	const goodreadsImport = {
		label: 'Goodreads',
		icon: GoodreadsIcon,
		onClick: () =>
			importFrom(
				'goodreads',
				'goodreads.com',
				ts.get.libraries.books.goodreads_import_validation_error
			)
	};

	const importOptions = integrations.isConfigured('hardcover')
		? [hardcoverImport, goodreadsImport]
		: [goodreadsImport];


	function onCreateGenre(label: string): Promise<string | null> {
		return createdEntryValue(library.createGenre(label), () => notifications.error(ts.get.libraries.genre_error));
	}

	function onCreateTag(label: string): Promise<string | null> {
		return createdEntryValue(tags.create(label), () => notifications.error(ts.get.libraries.tag_error));
	}

	function buildRequestFields() {
		return {
			title: titleValue,
			author: authorValue,
			series: seriesValue !== '' ? seriesValue : null,
			volume: volumeValue,
			pages: pagesValue,
			current_page: currentPageValue,
			publication_year: publicationYearValue,
			lent_to: lentToValue !== '' ? lentToValue : null,
			is_where: isWhereValue !== '' ? isWhereValue : null,
			started_at: startedAtValue !== '' ? startedAtValue : null,
			finished_at: finishedAtValue !== '' ? finishedAtValue : null,
			wishlist: isWishlist,
			summary: summaryValue !== '' ? summaryValue : null,
			genres: selectedIds(selectedGenres),
			tags: selectedIds(selectedTags),
			rating: selectedRating > 0 ? selectedRating : null,
			link: linkValue !== '' ? linkValue : null
		};
	}

	function updateRequest(): UpdateBookRequest {
		return { ...buildRequestFields(), ...(coverValue !== '' ? { cover_path: coverValue } : {}) };
	}

	function createRequest(): CreateBookRequest {
		return { ...buildRequestFields(), cover_path: coverValue !== '' ? coverValue : null };
	}

	function resetForm(): void {
		titleValue = '';
		authorValue = '';
		seriesValue = '';
		volumeValue = null;
		pagesValue = null;
		currentPageValue = null;
		lentToValue = '';
		isWhereValue = '';
		startedAtValue = '';
		finishedAtValue = '';
		coverValue = '';
		linkValue = '';
		selectedGenres = [];
		isWishlist = false;
		summaryValue = '';
	}

	async function onsubmit(): Promise<void> {
		const ok = await saving.run(() => (activeEntry ? library.update(activeEntry, updateRequest()) : library.create(createRequest())));
		if (!ok) return;
		if (!activeEntry) resetForm();
		library.closeCreateModal();
	}

	function onSearchSelect(book: BookRelease): void {
		authorValue = book.author;
		titleValue = book.title;
		coverValue = book.cover ?? '';
		linkValue = book.url ?? '';
		if (book.release_date) publicationYearValue = parseInt(book.release_date.slice(0, 4));
		if (book.page_count) pagesValue = book.page_count;
		library.closeExternalSearchModal();
	}

	async function importFrom(
		provider: string,
		domain: string,
		validationError: string
	): Promise<void> {
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
			const book = await library.importFrom(provider, linkValue);
			if (!book) {
				notifications.error(ts.get.libraries.books.import_error);
				return;
			}

			authorValue = book.author;
			titleValue = book.title;
			coverValue = book.cover ?? '';
			publicationYearValue = book.release_date ? parseInt(book.release_date.slice(0, 4)) : null;
			pagesValue = book.page_count ?? null;
			importDropdownOpen = false;
		} finally {
			importLoading = false;
			loadingIndicator.stop();
		}
	}

	function modalTitle(): string {
		return activeEntry !== null ? ts.get.libraries.books.edit_book : ts.get.libraries.books.add_book;
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
		<TextInput bind:input={titleInput} bind:value={titleValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.books.author}>
		<TextInput bind:value={authorValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.books.series}>
		<div class="flex w-full gap-2">
			<TextInput bind:value={seriesValue} />
			<NumberInput bind:value={volumeValue} />
		</div>
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
	<ModalFormRow label={ts.get.libraries.books.pages}>
		<NumberInput bind:value={pagesValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.books.current_page}>
		<NumberInput bind:value={currentPageValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.books.lent_to}>
		<TextInput bind:value={lentToValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.books.is_where}>
		<TextInput bind:value={isWhereValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.books.started_at}>
		<DateInput bind:value={startedAtValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.books.finished_at}>
		<DateInput bind:value={finishedAtValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.books.cover}>
		<TextInput bind:value={coverValue} placeholder="https://" />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.books.link}>
		<TextInput bind:value={linkValue} bind:input={linkInput} placeholder="https://" />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.books.summary}>
		<TextInput multiLine={true} height={80} bind:value={summaryValue} />
	</ModalFormRow>
	<div class="mt-8 flex w-full flex-row items-center justify-end gap-3">
		{#if !activeEntry}
			{#if integrations.isConfigured('hardcover')}
				<CreateModalSearchButton {library} {ts} />
			{/if}
			<CreateModalImport
				options={importOptions}
				{ts}
				loading={importLoading}
				bind:open={importDropdownOpen}
			/>
		{/if}
		<TextButton title={ts.get.layout.save} onclick={onsubmit} />
	</div>
</CreateModal>

{#if library.externalSearchModalVisible}
	<BookSearch {library} {ts} onSelect={onSearchSelect} />
{/if}
