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
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import type {
		CreateGameRequest,
		Game,
		GameRelease,
		UpdateGameRequest
	} from '$lib/types/library_game';
	import CreateModal from '$lib/components/libraries/shared/CreateModal.svelte';
	import { getGameLibrary } from '$lib/state/GameLibrary.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import CreateModalSearchButton from '$lib/components/libraries/shared/CreateModalSearchButton.svelte';
	import CreateModalImport from '$lib/components/libraries/shared/CreateModalImport.svelte';
	import GameSearch from '$lib/components/libraries/games/GameSearch.svelte';
	import SteamIcon from '$lib/assets/services/steam_icon.svg';
	import Dices from '$lib/icons/lucide/dices.svelte';
	import { getIntegrations } from '$lib/state/Integrations.svelte';

	const ts = getTranslation();
	const library = getGameLibrary();
	const tags = getTags();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const integrations = getIntegrations();
	const updating = new SaveAction(() => ts.get.libraries.games.update_error);

	let activeEntry = $state<Game | null>(library.activeEntry);

	let titleValue = $state<string>(activeEntry ? activeEntry.title : '');
	let coverValue = $state<string>('');
	let linkValue = $state<string>(activeEntry?.link ?? '');
	let publicationYearValue = $state<number | null>(activeEntry?.publication_year ?? null);
	let startedAtValue = $state<string>(activeEntry?.started_at?.substring(0, 10) ?? '');
	let finishedAtValue = $state<string>(activeEntry?.finished_at?.substring(0, 10) ?? '');
	let platformValue = $state<string>(activeEntry?.platform ?? 'pc');
	let developerValue = $state<string>(activeEntry?.developer ?? '');
	let publisherValue = $state<string>(activeEntry?.publisher ?? '');
	let playtimeHoursValue = $state<number | null>(activeEntry?.playtime_hours ?? null);
	let completedValue = $state<boolean>(activeEntry ? activeEntry.completed : false);
	let selectedGenres = $state<MultiSelectEntry[]>(genreEntries(activeEntry?.genres ?? []));
	let selectedTags = $state<MultiSelectEntry[]>(tagEntries(activeEntry?.tags ?? []));
	let selectedRating = $state(activeEntry?.rating ?? 0);
	let isWishlist = $state<boolean>(activeEntry ? activeEntry.wishlist : false);
	let linkInput = $state<HTMLInputElement | null>(null);
	let importLoading = $state<boolean>(false);
	let importDropdownOpen = $state<boolean>(false);

	const steamImport = { label: 'Steam', icon: SteamIcon, onClick: () => importFrom('steam', 'store.steampowered.com', ts.get.libraries.games.steam_import_validation_error) };
	const bggImport = { label: 'BGG', icon: Dices, onClick: () => importFrom('bgg', 'boardgamegeek.com', ts.get.libraries.games.bgg_import_validation_error, 'boardgame') };
	const importOptions = integrations.isConfigured('bgg') ? [steamImport, bggImport] : [steamImport];

	function onCreateGenre(label: string): Promise<string | null> {
		return createdEntryValue(library.createGenre(label), () => notifications.error(ts.get.libraries.genre_error));
	}

	function onCreateTag(label: string): Promise<string | null> {
		return createdEntryValue(tags.create(label), () => notifications.error(ts.get.libraries.tag_error));
	}

	const platformOptions: { label: string; value: string }[] = [
		{ label: ts.get.libraries.games.platform_pc, value: 'pc' },
		{ label: ts.get.libraries.games.platform_playstation, value: 'playstation' },
		{ label: ts.get.libraries.games.platform_xbox, value: 'xbox' },
		{ label: ts.get.libraries.games.platform_nintendo, value: 'nintendo' },
		{ label: ts.get.libraries.games.platform_mobile, value: 'mobile' },
		{ label: ts.get.libraries.games.platform_boardgame, value: 'boardgame' },
		{ label: ts.get.libraries.games.platform_other, value: 'other' }
	];

	function createRequest(): CreateGameRequest {
		return {
			title: titleValue,
			platform: platformValue,
			developer: developerValue !== '' ? developerValue : null,
			publisher: publisherValue !== '' ? publisherValue : null,
			publication_year: publicationYearValue,
			playtime_hours: playtimeHoursValue,
			completed: completedValue,
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

	function updateRequest(): UpdateGameRequest {
		return {
			title: titleValue,
			platform: platformValue,
			developer: developerValue !== '' ? developerValue : null,
			publisher: publisherValue !== '' ? publisherValue : null,
			publication_year: publicationYearValue,
			playtime_hours: playtimeHoursValue,
			completed: completedValue,
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
		platformValue = 'pc';
		developerValue = '';
		publisherValue = '';
		playtimeHoursValue = null;
		publicationYearValue = null;
		completedValue = false;
		startedAtValue = '';
		finishedAtValue = '';
		coverValue = '';
		linkValue = '';
		selectedGenres = [];
		selectedTags = [];
		isWishlist = false;
	}

	async function onsubmit(): Promise<void> {
		if (activeEntry) return update(activeEntry);
		loadingIndicator.start();
		try {
			if (!(await library.create(createRequest()))) return;
		} finally {
			loadingIndicator.stop();
		}
		resetForm();
		library.closeCreateModal();
	}

	async function update(entry: Game): Promise<void> {
		if (await updating.run(() => library.update(entry, updateRequest()))) library.closeCreateModal();
	}

	function onSearchSelect(game: GameRelease): void {
		titleValue = game.title;
		coverValue = game.cover ?? '';
		linkValue = game.url ?? '';
		developerValue = game.developer ?? '';
		publisherValue = game.publisher ?? '';

		if (game.provider === 'bgg') {
			platformValue = 'boardgame';
		}

		if (game.publication_year) publicationYearValue = game.publication_year;

		selectKnownGenres(game.genres ?? []);

		library.closeExternalSearchModal();
	}

	async function importFrom(provider: string, domain: string, validationError: string, platform?: string): Promise<void> {
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
			const game = await library.importFrom(provider, linkValue);
			if (!game) {
				notifications.error(ts.get.libraries.games.import_error);
				return;
			}

			titleValue = game.title;
			coverValue = game.cover ?? '';
			developerValue = game.developer ?? '';
			publisherValue = game.publisher ?? '';
			if (platform) platformValue = platform;
			if (game.publication_year) publicationYearValue = game.publication_year;
			selectKnownGenres(game.genres);
			importDropdownOpen = false;
		} finally {
			loadingIndicator.stop();
			importLoading = false;
		}
	}
	function selectKnownGenres(titles: string[]): void {
		for (const title of titles) {
			const existing = library.genres.find((genre) => genre.title === title);
			if (existing) selectedGenres.push(...genreEntries([existing]));
		}
	}

	function modalTitle(): string {
		return activeEntry !== null ? ts.get.libraries.games.edit_game : ts.get.libraries.games.add_game;
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
	<ModalFormRow label={ts.get.libraries.games.title}>
		<TextInput bind:value={titleValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.games.platform}>
		<Select bind:value={platformValue} options={platformOptions} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.games.creator}>
		<TextInput bind:value={developerValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.games.publisher}>
		<TextInput bind:value={publisherValue} />
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
	<ModalFormRow label={ts.get.libraries.games.playtime_hours}>
		<NumberInput bind:value={playtimeHoursValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.games.completed}>
		<Checkbox isChecked={completedValue} onchange={() => (completedValue = !completedValue)} class="pt-[9px]" />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.games.started_at}>
		<DateInput bind:value={startedAtValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.games.finished_at}>
		<DateInput bind:value={finishedAtValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.games.cover}>
		<TextInput bind:value={coverValue} placeholder="https://" />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.games.link}>
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
	<GameSearch {library} {ts} showBgg={integrations.isConfigured('bgg')} onSelect={onSearchSelect} />
{/if}
