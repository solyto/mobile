<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { API_USER_STORAGE_URL } from '$lib/config/apiRoutes';
	import { getAuth } from '$lib/state/Auth.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import type {
		CreateRecipeRequest,
		Recipe,
		RecipeType,
		UpdateRecipeRequest
	} from '$lib/types/library_recipe';
	import Select from '$lib/components/forms/Select.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import CreateModal from '$lib/components/libraries/shared/CreateModal.svelte';
	import { getRecipeLibrary } from '$lib/state/RecipeLibrary.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import CreateModalImport from '$lib/components/libraries/shared/CreateModalImport.svelte';
	import ChefkochIcon from '$lib/assets/services/chefkoch_icon.png';

	const ts = getTranslation();
	const library = getRecipeLibrary();
	const auth = getAuth();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();

	let activeEntry = $state<Recipe | null>(library.activeEntry);

	let titleValue = $state<string>(activeEntry ? activeEntry.title : '');
	let descriptionValue = $state<string>(activeEntry?.description ?? '');
	let timeToMakeValue = $state<number | null>(activeEntry?.time_to_make ?? null);
	let ingredientsValue = $state<string>(activeEntry?.ingredients ?? '');
	let coverValue = $state<string>('');
	let linkValue = $state<string>(activeEntry?.link ?? '');
	let typeValue = $state<string>(activeEntry?.type ?? '');
	let selectedRating = $state(activeEntry?.rating ?? 0);
	let linkInput = $state<HTMLInputElement | null>(null);
	let importLoading = $state<boolean>(false);
	let importDropdownOpen = $state<boolean>(false);

	const importOptions = [
		{ label: 'Chefkoch', icon: ChefkochIcon, onClick: () => importFrom('chefkoch', 'chefkoch.de', ts.get.libraries.recipes.chefkoch_import_validation_error) }
	];

	const typeOptions: { label: string; value: string }[] = [
		{ label: ts.get.libraries.recipes.type_breakfast, value: 'breakfast' },
		{ label: ts.get.libraries.recipes.type_lunch, value: 'lunch' },
		{ label: ts.get.libraries.recipes.type_dinner, value: 'dinner' },
		{ label: ts.get.libraries.recipes.type_snack, value: 'snack' },
		{ label: ts.get.libraries.recipes.type_dessert, value: 'dessert' },
		{ label: ts.get.libraries.recipes.type_drink, value: 'drink' },
		{ label: ts.get.libraries.recipes.type_other, value: 'other' }
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

		const request: CreateRecipeRequest = {
			title: titleValue,
			description: descriptionValue != '' ? descriptionValue : null,
			type: typeValue != '' ? (typeValue as RecipeType) : null,
			time_to_make: timeToMakeValue,
			ingredients: ingredientsValue !== '' ? ingredientsValue : null,
			rating: selectedRating > 0 ? selectedRating : null,
			cover_path: coverValue != '' ? coverValue : null,
			link: linkValue != '' ? linkValue : null
		};
		const ok = await library.create(request);
		if (ok) {
			titleValue = '';
			descriptionValue = '';
			timeToMakeValue = null;
			ingredientsValue = '';
			typeValue = '';
			coverValue = '';
			linkValue = '';
			library.closeCreateModal();
			await library.load();
		} else {
			notifications.error(ts.get.libraries.recipes.create_error);
		}

		loadingIndicator.stop();
	}

	async function update(): Promise<void> {
		loadingIndicator.start();

		const request: UpdateRecipeRequest = {
			title: titleValue,
			description: descriptionValue != '' ? descriptionValue : null,
			type: typeValue != '' ? (typeValue as RecipeType) : null,
			time_to_make: timeToMakeValue,
			ingredients: ingredientsValue !== '' ? ingredientsValue : null,
			rating: selectedRating > 0 ? selectedRating : null,
			...(coverValue !== '' ? { cover_path: coverValue } : {}),
			link: linkValue != '' ? linkValue : null
		};
		const ok = await library.update(activeEntry!, request);
		if (ok) {
			library.closeCreateModal();
			await library.load();
		} else {
			notifications.error(ts.get.libraries.recipes.update_error);
		}

		loadingIndicator.stop();
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
		const recipe = await library.importFrom(provider, linkValue);

		if (!recipe) {
			notifications.error(ts.get.libraries.recipes.import_error);
			loadingIndicator.stop();
			importLoading = false;
			return;
		}

		titleValue = recipe.title;
		coverValue = recipe.cover ?? '';
		ingredientsValue = recipe.ingredients ?? '';
		descriptionValue = recipe.description ?? '';
		timeToMakeValue = recipe.time_to_make;

		loadingIndicator.stop();
		importLoading = false;
		importDropdownOpen = false;
	}
</script>

<CreateModal
	title={activeEntry !== null
		? ts.get.libraries.recipes.edit_recipe
		: ts.get.libraries.recipes.add_recipe}
	{library}
	existingCover={activeEntry
		? `${API_USER_STORAGE_URL}/${auth.user?.id}/${library.config.type}/${activeEntry.cover}`
		: null}
	newCover={coverValue}
	bind:selectedRating
>
	<ModalFormRow label={ts.get.libraries.recipes.title}>
		<TextInput bind:value={titleValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.recipes.type}>
		<Select bind:value={typeValue} options={typeOptions} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.recipes.ingredients}>
		<TextInput bind:value={ingredientsValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.recipes.time_to_make}>
		<NumberInput bind:value={timeToMakeValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.recipes.cover}>
		<TextInput bind:value={coverValue} placeholder="https://" />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.recipes.link}>
		<TextInput bind:value={linkValue} bind:input={linkInput} placeholder="https://" />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.recipes.description}>
		<TextInput bind:value={descriptionValue} multiLine={true} height={150} />
	</ModalFormRow>
	<div class="mt-8 flex w-full flex-row items-center justify-end gap-3">
		{#if !activeEntry}
			<CreateModalImport options={importOptions} {ts} loading={importLoading} bind:open={importDropdownOpen} />
		{/if}
		<TextButton title={ts.get.layout.save} onclick={onsubmit} />
	</div>
</CreateModal>
