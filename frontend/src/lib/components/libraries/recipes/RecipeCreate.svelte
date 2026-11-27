<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { libraryCoverUrl } from '$lib/helpers/LibraryCoverHelper';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';
	import type {
		CreateRecipeRequest,
		Ingredient,
		Recipe,
		RecipeType,
		UpdateRecipeRequest
	} from '$lib/types/library_recipe';
	import Select from '$lib/components/forms/Select.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import CreateModal from '$lib/components/libraries/shared/CreateModal.svelte';
	import { getRecipeLibrary } from '$lib/state/RecipeLibrary.svelte';
	import { getUiNotifications } from '$lib/state/UiNotifications.svelte';
	import { SaveAction } from '$lib/helpers/SaveAction.svelte';
	import CreateModalImport from '$lib/components/libraries/shared/CreateModalImport.svelte';
	import AddButton from '$lib/components/ui/buttons/AddButton.svelte';
	import InlineDeleteButton from '$lib/components/ui/buttons/InlineDeleteButton.svelte';
	import ChefkochIcon from '$lib/assets/services/chefkoch_icon.ico';
	import { fade } from 'svelte/transition';

	const ts = getTranslation();
	const library = getRecipeLibrary();
	const loadingIndicator = getLoadingIndicator();
	const notifications = getUiNotifications();
	const saving = new SaveAction(() => (activeEntry ? ts.get.libraries.recipes.update_error : ts.get.libraries.recipes.create_error));

	let activeEntry = $state<Recipe | null>(library.activeEntry);

	let titleValue = $state<string>(activeEntry ? activeEntry.title : '');
	let descriptionValue = $state<string>(activeEntry?.description ?? '');
	let caloriesValue = $state<number | null>(activeEntry?.calories ?? null);
	let timeToMakeValue = $state<number | null>(activeEntry?.time_to_make ?? null);
	let servingsValue = $state<number | null>(activeEntry?.servings ?? null);
	type IngredientForm = { name: string; amount: number | null; unit: string };

	let ingredients = $state<IngredientForm[]>(activeEntry ? activeEntry.ingredients.map(toForm) : []);
	let steps = $state<string[]>(activeEntry ? [...activeEntry.steps] : []);
	let coverValue = $state<string>('');
	let linkValue = $state<string>(activeEntry?.link ?? '');
	let typeValue = $state<string>(activeEntry?.type ?? '');
	let selectedRating = $state(activeEntry?.rating ?? 0);
	let linkInput = $state<HTMLInputElement | null>(null);
	let importLoading = $state<boolean>(false);
	let importDropdownOpen = $state<boolean>(false);

	const importOptions = [
		{
			label: 'Chefkoch',
			icon: ChefkochIcon,
			onClick: () =>
				importFrom(
					'chefkoch',
					'chefkoch.de',
					ts.get.libraries.recipes.chefkoch_import_validation_error
				)
		}
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

	function toForm(ingredient: Ingredient): IngredientForm {
		return { name: ingredient.name, amount: ingredient.amount, unit: ingredient.unit ?? '' };
	}

	function addIngredient(): void {
		ingredients.push({ name: '', amount: null, unit: '' });
	}

	function removeIngredient(index: number): void {
		ingredients.splice(index, 1);
	}

	function addStep(): void {
		steps.push('');
	}

	function removeStep(index: number): void {
		steps.splice(index, 1);
	}

	function cleanedIngredients(): Ingredient[] {
		return ingredients
			.map((ingredient) => ({
				name: ingredient.name.trim(),
				amount: ingredient.amount,
				unit: ingredient.unit.trim() !== '' ? ingredient.unit.trim() : null
			}))
			.filter((ingredient) => ingredient.name !== '');
	}

	function cleanedSteps(): string[] {
		return steps.map((step) => step.trim()).filter((step) => step !== '');
	}

	function createRequest(): CreateRecipeRequest {
		return {
			title: titleValue,
			description: descriptionValue != '' ? descriptionValue : null,
			type: typeValue != '' ? (typeValue as RecipeType) : null,
			calories: caloriesValue,
			time_to_make: timeToMakeValue,
			servings: servingsValue,
			ingredients: cleanedIngredients(),
			steps: cleanedSteps(),
			rating: selectedRating > 0 ? selectedRating : null,
			cover_path: coverValue != '' ? coverValue : null,
			link: linkValue != '' ? linkValue : null
		};
	}

	function updateRequest(): UpdateRecipeRequest {
		return {
			title: titleValue,
			description: descriptionValue != '' ? descriptionValue : null,
			type: typeValue != '' ? (typeValue as RecipeType) : null,
			calories: caloriesValue,
			time_to_make: timeToMakeValue,
			servings: servingsValue,
			ingredients: cleanedIngredients(),
			steps: cleanedSteps(),
			rating: selectedRating > 0 ? selectedRating : null,
			...(coverValue !== '' ? { cover_path: coverValue } : {}),
			link: linkValue != '' ? linkValue : null
		};
	}

	function resetForm(): void {
		titleValue = '';
		descriptionValue = '';
		caloriesValue = null;
		timeToMakeValue = null;
		servingsValue = null;
		ingredients = [];
		steps = [];
		typeValue = '';
		coverValue = '';
		linkValue = '';
	}

	async function onsubmit(): Promise<void> {
		const ok = await saving.run(() => (activeEntry ? library.update(activeEntry, updateRequest()) : library.create(createRequest())));
		if (!ok) return;
		if (!activeEntry) resetForm();
		library.closeCreateModal();
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
			const recipe = await library.importFrom(provider, linkValue);
			if (!recipe) {
				notifications.error(ts.get.libraries.recipes.import_error);
				return;
			}

			titleValue = recipe.title;
			coverValue = recipe.cover ?? '';
			ingredients = recipe.ingredients.map(toForm);
			steps = [...recipe.steps];
			descriptionValue = recipe.description ?? '';
			timeToMakeValue = recipe.time_to_make;
			servingsValue = recipe.servings;
			importDropdownOpen = false;
		} finally {
			loadingIndicator.stop();
			importLoading = false;
		}
	}

	function modalTitle(): string {
		return activeEntry !== null ? ts.get.libraries.recipes.edit_recipe : ts.get.libraries.recipes.add_recipe;
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
>
	<ModalFormRow label={ts.get.libraries.recipes.title}>
		<TextInput bind:value={titleValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.recipes.type}>
		<Select bind:value={typeValue} options={typeOptions} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.recipes.servings}>
		<NumberInput bind:value={servingsValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.recipes.time_to_make}>
		<NumberInput bind:value={timeToMakeValue} />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.recipes.calories}>
		<NumberInput bind:value={caloriesValue} />
	</ModalFormRow>

	<div class="flex w-full flex-col gap-2">
		<div class="flex justify-between items-center">
			<span class="text-sm font-bold">{ts.get.libraries.recipes.ingredients}</span>
			<AddButton colorOnHover={true} onClick={addIngredient} />
		</div>
		{#if ingredients?.length > 0}
			<div
				class="flex flex-col gap-2 rounded-lg border border-c-neutral-2 p-3 dark:border-s-dark-3 shadow-xs"
				in:fade
			>
				{#each ingredients as ingredient, index (index)}
					<div class="flex items-center gap-2" in:fade>
						<div class="w-20 shrink-0">
							<NumberInput
								bind:value={ingredient.amount}
								placeholder={ts.get.libraries.recipes.amount}
							/>
						</div>
						<div class="w-16 shrink-0">
							<TextInput
								bind:value={ingredient.unit}
								placeholder={ts.get.libraries.recipes.unit}
							/>
						</div>
						<div class="min-w-0">
							<TextInput
								bind:value={ingredient.name}
								placeholder={ts.get.libraries.recipes.ingredient_name}
							/>
						</div>
						<InlineDeleteButton onClick={() => removeIngredient(index)} />
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<div class="mb-2 flex w-full flex-col gap-2">
		<div class="flex justify-between items-center">
			<span class="text-sm font-bold">{ts.get.libraries.recipes.steps}</span>
			<AddButton colorOnHover={true} onClick={addStep} />
		</div>
		{#if steps?.length > 0}
			<div
				class="flex flex-col gap-2 rounded-lg border border-c-neutral-2 p-3 dark:border-s-dark-3 shadow-xs"
				in:fade
			>
				{#each steps as step, index (index)}
					<div class="flex items-start gap-2" in:fade>
						<span class="pt-[9px] text-sm font-bold text-c-neutral-4">{index + 1}.</span>
						<div class="min-w-0 flex-1">
							<TextInput bind:value={steps[index]} multiLine={true} height={60} />
						</div>
						<InlineDeleteButton onClick={() => removeStep(index)} />
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<ModalFormRow label={ts.get.libraries.recipes.cover}>
		<TextInput bind:value={coverValue} placeholder="https://" />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.recipes.link}>
		<TextInput bind:value={linkValue} bind:input={linkInput} placeholder="https://" />
	</ModalFormRow>
	<ModalFormRow label={ts.get.libraries.recipes.description}>
		<TextInput bind:value={descriptionValue} multiLine={true} height={100} />
	</ModalFormRow>
	<div class="mt-8 flex w-full flex-row items-center justify-end gap-3">
		{#if !activeEntry}
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
