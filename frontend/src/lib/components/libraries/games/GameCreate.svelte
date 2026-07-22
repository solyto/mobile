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
	import CreateModalSearchButton from '$lib/components/libraries/shared/CreateModalSearchButton.svelte';
	import CreateModalImport from '$lib/components/libraries/shared/CreateModalImport.svelte';
	import GameSearch from '$lib/components/libraries/games/GameSearch.svelte';
	import SteamIcon from '$lib/assets/services/steam_icon.svg';
	import Dices from '@lucide/svelte/icons/dices';

	const ts = getTranslation();
	const library = getGameLibrary();
	const tags = getTags();
	const auth = getAuth();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

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
		{ label: 'Steam', icon: SteamIcon, onClick: () => importFrom('steam', 'store.steampowered.com', ts.get.libraries.games.steam_import_validation_error) },
		{ label: 'BGG', icon: Dices, onClick: () => importFrom('bgg', 'boardgamegeek.com', ts.get.libraries.games.bgg_import_validation_error, 'boardgame') }
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

	const platformOptions: { label: string; value: string }[] = [
		{ label: ts.get.libraries.games.platform_pc, value: 'pc' },
		{ label: ts.get.libraries.games.platform_playstation, value: 'playstation' },
		{ label: ts.get.libraries.games.platform_xbox, value: 'xbox' },
		{ label: ts.get.libraries.games.platform_nintendo, value: 'nintendo' },
		{ label: ts.get.libraries.games.platform_mobile, value: 'mobile' },
		{ label: ts.get.libraries.games.platform_boardgame, value: 'boardgame' },
		{ label: ts.get.libraries.games.platform_other, value: 'other' }
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

		const request: CreateGameRequest = {
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
			genres: selectedGenres.map((g) => parseInt(g.value)),
			tags: selectedTags.map((t) => parseInt(t.value)),
			rating: selectedRating > 0 ? selectedRating : null,
			cover_path: coverValue != '' ? coverValue : null,
			link: linkValue != '' ? linkValue : null
		};
		const ok = await library.create(request);
		if (ok) {
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
			library.closeCreateModal();
			await library.load();
		}

		loadingIndicator.stop();
	}

	async function update(): Promise<void> {
		loadingIndicator.start();

		const request: UpdateGameRequest = {
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
		}

		loadingIndicator.stop();
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

		for (const genre of game.genres ?? []) {
			const existing = library.genres.find((g) => g.title === genre);
			if (existing) selectedGenres.push({ label: existing.title, value: existing.id.toString() });
		}

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
		const game = await library.importFrom(provider, linkValue);

		if (!game) {
			notifications.error(ts.get.libraries.games.import_error);
			loadingIndicator.stop();
			importLoading = false;
			return;
		}

		titleValue = game.title;
		coverValue = game.cover ?? '';
		developerValue = game.developer ?? '';
		publisherValue = game.publisher ?? '';
		if (platform) platformValue = platform;
		if (game.publication_year) publicationYearValue = game.publication_year;

		for (const genre of game.genres) {
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
		? ts.get.libraries.games.edit_game
		: ts.get.libraries.games.add_game}
	{library}
	existingCover={activeEntry
		? `${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${activeEntry.cover}`
		: null}
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
		<MultiSelect bind:value={selectedGenres} options={genreOptions} allowUserOptions oncreate={onCreateGenre} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.tags}>
		<MultiSelect bind:value={selectedTags} options={tagOptions} allowUserOptions oncreate={onCreateTag} />
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
	<GameSearch {library} {ts} onSelect={onSearchSelect} />
{/if}
