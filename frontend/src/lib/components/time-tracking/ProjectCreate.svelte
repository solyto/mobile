<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getReadableTextColor } from '$lib/helpers/ColorHelper';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();

	let { onClose, projectId = null }: {
		onClose: () => void;
		projectId?: string | null;
	} = $props();

	const existingProject = projectId ? tt.projects.find((p) => p.id === projectId) : null;

	let title = $state<string>(existingProject?.title ?? '');
	let description = $state<string>(existingProject?.description ?? '');
	let selectedCategoryIds = $state<number[]>(
		existingProject?.categories.map((c) => c.id) ?? []
	);
	let showCategoryDropdown = $state<boolean>(false);

	let availableCategories = $derived(
		tt.categories.filter((c) => !selectedCategoryIds.includes(c.id))
	);

	let selectedCategories = $derived(
		tt.categories.filter((c) => selectedCategoryIds.includes(c.id))
	);

	function addCategory(id: number): void {
		selectedCategoryIds = [...selectedCategoryIds, id];
		showCategoryDropdown = false;
	}

	function removeCategory(id: number): void {
		selectedCategoryIds = selectedCategoryIds.filter((cid) => cid !== id);
	}

	let isValid = $derived(title.trim().length > 0);

	async function onSave(): Promise<void> {
		if (!isValid) return;

		loadingIndicator.start();

		if (existingProject) {
			await tt.updateProject(existingProject.id, {
				title: title.trim(),
				description: description.trim() || null,
				category_ids: selectedCategoryIds
			});
		} else {
			await tt.createProject({
				title: title.trim(),
				description: description.trim() || null,
				category_ids: selectedCategoryIds
			});
		}

		loadingIndicator.stop();
		onClose();
	}
</script>

<ContentModal
	title={existingProject ? ts.get.timeTracking.edit_project : ts.get.timeTracking.add_project}
	rounded="2xl"
	p="8"
	{onClose}
>
	<div class="flex flex-col gap-3">
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.timeTracking.title}
			</span>
			<TextInput bind:value={title} placeholder={ts.get.timeTracking.title} />
		</label>
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4">
				{ts.get.timeTracking.description}
			</span>
			<TextInput bind:value={description} placeholder={ts.get.timeTracking.description} />
		</label>
		<div class="flex flex-col gap-1">
			<span class="text-sm font-medium text-c-neutral-5 dark:text-c-neutral-4"
				>{ts.get.timeTracking.categories}</span
			>
			<div class="flex flex-row flex-wrap items-center gap-1.5">
				{#each selectedCategories as cat (cat.id)}
					<span
						class="flex flex-row items-center gap-1 rounded-md px-2 py-1 text-xs"
						style="background-color: {cat.color ?? 'var(--color-c-neutral-4)'}; color: {getReadableTextColor(cat.color ?? 'var(--color-c-neutral-4)')}"
					>
						{cat.title}
						<button
							aria-label={ts.get.layout.remove}
							class="cursor-pointer opacity-80 hover:opacity-100"
							onclick={() => removeCategory(cat.id)}
						>
							&times;
						</button>
					</span>
				{/each}
				{#if availableCategories.length > 0}
					<div class="relative">
						<button
							aria-label={ts.get.timeTracking.add_category}
							class="cursor-pointer rounded-md border-1 border-dashed border-c-neutral-3 px-2 py-1 text-xs text-c-neutral-5 transition-all hover:border-c-primary hover:text-c-primary dark:border-s-dark-3 dark:text-c-neutral-4"
							onclick={() => (showCategoryDropdown = !showCategoryDropdown)}
						>
							+
						</button>
						{#if showCategoryDropdown}
							<div class="absolute top-8 left-0 z-10 max-h-40 min-w-36 overflow-y-auto rounded-md border-1 border-c-neutral-2 bg-c-bg-modal shadow-md dark:border-s-dark-3">
								{#each availableCategories as cat (cat.id)}
									<button
										class="flex w-full cursor-pointer flex-row items-center gap-2 px-3 py-2 text-left text-sm transition-all hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
										onclick={() => addCategory(cat.id)}
									>
										{#if cat.color}
											<div
												class="h-2.5 w-2.5 rounded-full"
												style="background-color: {cat.color}"
											></div>
										{/if}
										{cat.title}
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
		<div class="mt-4 flex w-full justify-end">
			<TextButton title={ts.get.layout.save} onclick={onSave} disabled={!isValid} />
		</div>
	</div>
</ContentModal>
