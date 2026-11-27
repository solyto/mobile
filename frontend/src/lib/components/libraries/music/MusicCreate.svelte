<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { createdEntryValue, genreEntries, selectedIds } from '$lib/helpers/MultiSelectHelper';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';
	import MultiSelect, { type MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import DeezerIcon from '$lib/assets/services/deezer_icon.svg';
	import DiscogsIcon from '$lib/assets/services/discogs_icon.svg';
	import SpotifyIcon from '$lib/assets/services/spotify_icon.svg';
	import type {
		CreateMusicRequest,
		MusicRelease,
		Music,
		UpdateMusicRequest
	} from '$lib/types/library_music';
	import { libraryCoverUrl } from '$lib/helpers/LibraryCoverHelper';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import { getMusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import CreateModal from '$lib/components/libraries/shared/CreateModal.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import CreateModalImport from '$lib/components/libraries/shared/CreateModalImport.svelte';
	import CreateModalSearchButton from '$lib/components/libraries/shared/CreateModalSearchButton.svelte';
	import MusicSearch from '$lib/components/libraries/music/MusicSearch.svelte';

	const ts = getTranslation();
	const library = getMusicLibrary();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const saving = new SaveAction(() => (activeEntry ? ts.get.libraries.music.update_error : ts.get.libraries.music.create_error));

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
	let selectedGenres = $state<MultiSelectEntry[]>(genreEntries(activeEntry?.genres ?? []));
	let selectedRating = $state(activeEntry?.rating ?? 0);
	let isWishlist = $state<boolean>(activeEntry ? activeEntry.wishlist : false);
	let linkInput = $state<HTMLInputElement | null>(null);
	let importLoading = $state<boolean>(false);
	let importDropdownOpen = $state<boolean>(false);

	const typeOptions: { label: string; value: string }[] = [
		{ label: ts.get.libraries.music.type_cd, value: 'cd' },
		{ label: ts.get.libraries.music.type_vinyl, value: 'vinyl' },
		{ label: ts.get.libraries.music.type_digital, value: 'digital' }
	];

	const formatOptions: { label: string; value: string }[] = [
		{ label: ts.get.libraries.music.format_album, value: 'album' },
		{ label: ts.get.libraries.music.format_single, value: 'single' },
		{ label: ts.get.libraries.music.format_compilation, value: 'compilation' }
	];

	const conditionOptions: { label: string; value: string }[] = [
		{ label: ts.get.libraries.music.condition_short_mint, value: 'mint' },
		{ label: ts.get.libraries.music.condition_short_verygood, value: 'very-good' },
		{ label: ts.get.libraries.music.condition_short_good, value: 'good' },
		{ label: ts.get.libraries.music.condition_short_medium, value: 'medium' },
		{ label: ts.get.libraries.music.condition_short_poor, value: 'poor' },
		{ label: ts.get.libraries.music.condition_short_verypoor, value: 'very-poor' }
	];

	function onCreateGenre(label: string): Promise<string | null> {
		return createdEntryValue(library.createGenre(label), () => notifications.error(ts.get.libraries.genre_error));
	}

	const importDefs: Record<
		string,
		{ label: string; icon: string; domain: string; validationError: string }
	> = {
		deezer: {
			label: 'Deezer',
			icon: DeezerIcon,
			domain: 'deezer.com',
			validationError: ts.get.libraries.music.deezer_import_validation_error
		},
		discogs: {
			label: 'Discogs',
			icon: DiscogsIcon,
			domain: 'discogs.com',
			validationError: ts.get.libraries.music.discogs_import_validation_error
		},
		spotify: {
			label: 'Spotify',
			icon: SpotifyIcon,
			domain: 'open.spotify.com',
			validationError: ts.get.libraries.music.spotify_import_validation_error
		}
	};

	const importOptions: { label: string; icon: string; onClick: () => Promise<void> }[] = $derived(
		library.integrations
			.map((provider) => {
				const def = importDefs[provider];
				if (!def) return null;
				return {
					label: def.label,
					icon: def.icon,
					onClick: () => importFrom(provider, def.domain, def.validationError)
				};
			})
			.filter(
				(option): option is { label: string; icon: string; onClick: () => Promise<void> } =>
					option !== null
			)
	);

	function createRequest(): CreateMusicRequest {
		return {
			title: titleValue,
			artist: artistValue,
			genres: selectedIds(selectedGenres),
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
	}

	function updateRequest(): UpdateMusicRequest {
		return {
			title: titleValue,
			artist: artistValue,
			genres: selectedIds(selectedGenres),
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
	}

	function resetForm(): void {
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
	}

	async function onsubmit(): Promise<void> {
		const ok = await saving.run(() => (activeEntry ? library.update(activeEntry, updateRequest()) : library.create(createRequest())));
		if (!ok) return;
		if (!activeEntry) resetForm();
		library.closeCreateModal();
	}

	async function importFrom(provider: string, domain: string, validationError: string): Promise<void> {
		if (!linkValue) {
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
			const album = await library.importFrom(provider, linkValue);
			if (album) applyRelease(album);
			else notifications.error(ts.get.libraries.music.import_error);
		} finally {
			loadingIndicator.stop();
			importLoading = false;
		}
		importDropdownOpen = false;
	}

	function onSearchSelect(entry: MusicRelease): void {
		applyRelease(entry);
		library.closeExternalSearchModal();
	}

	function applyRelease(release: MusicRelease): void {
		artistValue = release.artist;
		titleValue = release.title;
		coverValue = release.cover;
		linkValue = release.url;
		if (release.release_date) publicationYearValue = parseInt(release.release_date.slice(0, 4));
		if (release.record_type) formatValue = release.record_type;
		selectKnownGenres(release.genres ?? []);
	}
	function selectKnownGenres(titles: string[]): void {
		for (const title of titles) {
			const existing = library.genres.find((genre) => genre.title === title);
			if (existing) selectedGenres.push(...genreEntries([existing]));
		}
	}

</script>

<CreateModal
	title={activeEntry !== null ? ts.get.libraries.music.edit_album : ts.get.libraries.music.add_album}
	{library}
	existingCover={activeEntry && activeEntry.cover ? libraryCoverUrl(library, activeEntry.cover) : null}
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
		<MultiSelect bind:value={selectedGenres} options={genreEntries(library.genres)} allowUserOptions oncreate={onCreateGenre} />
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
