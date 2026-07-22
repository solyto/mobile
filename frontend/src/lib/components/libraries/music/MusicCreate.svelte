<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import MultiSelect, { type MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import DeezerIcon from '$lib/assets/services/deezer_icon.svg';
	import DiscogsIcon from '$lib/assets/services/discogs_icon.png';
	import type {
		CreateMusicRequest,
		MusicRelease,
		Music,
		UpdateMusicRequest
	} from '$lib/types/library_music';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import { getMusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import CreateModal from '$lib/components/libraries/shared/CreateModal.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import CreateModalImport from '$lib/components/libraries/shared/CreateModalImport.svelte';
	import CreateModalSearchButton from '$lib/components/libraries/shared/CreateModalSearchButton.svelte';
	import MusicSearch from '$lib/components/libraries/music/MusicSearch.svelte';

	const ts = getTranslation();
	const library = getMusicLibrary();
	const auth = getAuth();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let activeEntry = $state<Music | null>(library.activeEntry);

	let titleValue = $state<string>(activeEntry ? activeEntry.title : '');
	let artistValue = $state<string>(activeEntry ? activeEntry.artist : '');
	let publicationYearValue = $state<number | null>(activeEntry?.publication_year ?? null);
	let acquiredWhereValue = $state<string>(activeEntry?.acquired_where ?? '');
	let additionalInfoValue = $state<string>(activeEntry?.additional_info ?? '');
	let coverValue = $state<string>('');
	let linkValue = $state<string>(activeEntry?.link ?? '');
	let typeValue = $state<string>(activeEntry?.type ?? '');
	let formatValue = $state<string>(activeEntry?.format ?? '');
	let conditionValue = $state<string>(activeEntry?.condition ?? '');
	let selectedGenres = $state<{ label: string; value: string }[]>(
		activeEntry ? activeEntry.genres.map((g) => ({ label: g.title, value: g.id.toString() })) : []
	);
	let selectedRating = $state(activeEntry?.rating ?? 0);
	let isWishlist = $state<boolean>(activeEntry ? activeEntry.wishlist : false);
	let linkInput = $state<HTMLInputElement | null>(null);
	let importLoading = $state<boolean>(false);
	let importDropdownOpen = $state<boolean>(false);

	const typeOptions: { label: string; value: string }[] = [
		{ label: 'CD', value: 'cd' },
		{ label: 'Vinyl', value: 'vinyl' },
		{ label: 'Digital', value: 'digital' }
	];

	const formatOptions: { label: string; value: string }[] = [
		{ label: 'Album', value: 'album' },
		{ label: 'Single', value: 'single' },
		{ label: 'Compilation', value: 'compilation' }
	];

	const conditionOptions: { label: string; value: string }[] = [
		{ label: 'Mint', value: 'mint' },
		{ label: 'Very Good', value: 'very-good' },
		{ label: 'Good', value: 'good' },
		{ label: 'Medium', value: 'medium' },
		{ label: 'Poor', value: 'poor' },
		{ label: 'Very Poor', value: 'very-poor' }
	];

	let genreOptions: { label: string; value: string }[] = $derived(
		library.genres.map((genre) => ({ label: genre.title, value: genre.id.toString() }))
	);

	async function onCreateGenre(data: { option: MultiSelectEntry }): Promise<void> {
		const created = await library.createGenre(data.option.label.toString());
		if (!created) {
			notifications.error(ts.get.libraries.genre_error);
			return;
		}
		data.option.value = created.id.toString();
	}

	const importOptions: { label: string; icon: any; onClick: () => void; }[] = [
		{ label: 'Deezer', icon: DeezerIcon, onClick: () => importFrom('deezer', 'deezer.com', ts.get.libraries.music.deezer_import_validation_error) },
		{ label: 'Discogs', icon: DiscogsIcon, onClick: () => importFrom('discogs', 'discogs.com', ts.get.libraries.music.discogs_import_validation_error) }
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

		const request: CreateMusicRequest = {
			title: titleValue,
			artist: artistValue,
			genres: selectedGenres.map((g) => parseInt(g.value)),
			type: typeValue !== '' ? typeValue : null,
			format: formatValue !== '' ? formatValue : null,
			condition: conditionValue != '' ? conditionValue : null,
			publication_year: publicationYearValue,
			acquired_where: acquiredWhereValue != '' ? acquiredWhereValue : null,
			additional_info: additionalInfoValue != '' ? additionalInfoValue : null,
			wishlist: isWishlist,
			rating: selectedRating > 0 ? selectedRating : null,
			cover_path: coverValue != '' ? coverValue : null,
			link: linkValue != '' ? linkValue : null
		};
		const ok = await library.create(request);
		if (ok) {
			titleValue = '';
			artistValue = '';
			selectedGenres = [];
			typeValue = '';
			formatValue = '';
			conditionValue = '';
			acquiredWhereValue = '';
			additionalInfoValue = '';
			coverValue = '';
			linkValue = '';
			isWishlist = false;
			library.closeCreateModal();
			await library.load();
		} else {
			notifications.error(ts.get.libraries.music.create_error);
		}

		loadingIndicator.stop();
	}

	async function update(): Promise<void> {
		loadingIndicator.start();

		const request: UpdateMusicRequest = {
			title: titleValue,
			artist: artistValue,
			genres: selectedGenres.map((g) => parseInt(g.value)),
			type: typeValue !== '' ? typeValue : null,
			format: formatValue !== '' ? formatValue : null,
			condition: conditionValue != '' ? conditionValue : null,
			publication_year: publicationYearValue,
			acquired_where: acquiredWhereValue != '' ? acquiredWhereValue : null,
			additional_info: additionalInfoValue != '' ? additionalInfoValue : null,
			wishlist: isWishlist,
			rating: selectedRating > 0 ? selectedRating : null,
			...(coverValue !== '' ? { cover_path: coverValue } : {}),
			link: linkValue != '' ? linkValue : null
		};
		const ok = await library.update(activeEntry!, request);
		if (ok) {
			library.closeCreateModal();
			await library.load();
		} else {
			notifications.error(ts.get.libraries.music.update_error);
		}

		loadingIndicator.stop();
	}

	async function importFrom(provider: string, domain: string, validationError: string): Promise<void> {
		if (!linkValue) { linkInput?.focus(); return; }

		if (!linkValue.includes(domain)) {
			notifications.error(validationError);
			return;
		}

		importLoading = true;
		loadingIndicator.start();

		const album = await library.importFrom(provider, linkValue);

		if (!album) {
			notifications.error(ts.get.libraries.music.import_error);
		} else {
			artistValue = album.artist;
			titleValue = album.title;
			coverValue = album.cover;
			linkValue = album.url;
			if (album.release_date) publicationYearValue = parseInt(album.release_date.slice(0, 4));
			if (album.record_type) formatValue = album.record_type;
			for (const genre of album.genres ?? []) {
				const existing = library.genres.find((g) => g.title === genre);
				if (existing) selectedGenres.push({ label: existing.title, value: existing.id.toString() });
			}
		}

		loadingIndicator.stop();
		importLoading = false;
		importDropdownOpen = false;
	}

	function onSearchSelect(entry: MusicRelease): void {
		artistValue = entry.artist;
		titleValue = entry.title;
		coverValue = entry.cover;
		linkValue = entry.url;
		if (entry.release_date) publicationYearValue = parseInt(entry.release_date.slice(0, 4));
		if (entry.record_type) formatValue = entry.record_type;
		for (const genre of entry.genres ?? []) {
			const existing = library.genres.find((g) => g.title === genre);
			if (existing) selectedGenres.push({ label: existing.title, value: existing.id.toString() });
		}
		library.closeExternalSearchModal();
	}
</script>

<CreateModal
	title={activeEntry !== null ? ts.get.libraries.music.edit_album : ts.get.libraries.music.add_album}
	{library}
	existingCover={activeEntry && activeEntry.cover ? `${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${activeEntry.cover}` : null}
	newCover={coverValue}
	bind:selectedRating
	bind:isWishlist
>
	<ModalFormRow label={ts.get.libraries.music.title}>
		<TextInput bind:value={titleValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.music.artist}>
		<TextInput bind:value={artistValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.genres}>
		<MultiSelect bind:value={selectedGenres} options={genreOptions} allowUserOptions oncreate={onCreateGenre} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.music.type}>
		<Select bind:value={typeValue} options={typeOptions} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.music.format}>
		<Select bind:value={formatValue} options={formatOptions} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.music.condition}>
		<Select bind:value={conditionValue} options={conditionOptions} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.publication_year}>
		<NumberInput bind:value={publicationYearValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.music.acquired_where}>
		<TextInput bind:value={acquiredWhereValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.music.additional_info}>
		<TextInput bind:value={additionalInfoValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.music.cover}>
		<TextInput bind:value={coverValue} placeholder="https://" />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.music.link}>
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
	<MusicSearch {library} {ts} onSelect={onSearchSelect} />
{/if}
