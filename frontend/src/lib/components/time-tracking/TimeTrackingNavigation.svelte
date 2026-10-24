<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { tick } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import IconLayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import IconList from '@lucide/svelte/icons/list';
	import IconChartPie from '@lucide/svelte/icons/chart-pie';
	import IconPlus from '@lucide/svelte/icons/plus';
	import IconPen from '@lucide/svelte/icons/pen';
	import IconTrash from '@lucide/svelte/icons/trash-2';
	import ColorPicker from 'svelte-awesome-color-picker';
	import { getTimeTracking } from '$lib/state/TimeTracking.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { onDestroy } from 'svelte';
	import { clickOutside } from '$lib/helpers/ClickHelper';
	import { urls } from '$lib/config/urls';
	import CloseButton from '$lib/components/ui/buttons/CloseButton.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import SaveButton from '$lib/components/ui/buttons/SaveButton.svelte';
	import HamburgerButton from '$lib/components/ui/buttons/HamburgerButton.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';

	const tt = getTimeTracking();
	const ts = getTranslation();
	const loadingIndicator = getLoadingIndicator();
	const keyManager = getKeyManager();

	let activeTab = $derived.by(() => {
		const tab = page.url.searchParams.get('tab');
		if (tab === 'entries' || tab === 'statistics') return tab;
		return 'dashboard';
	});

	let {
		onCreateProject,
		onEditProject,
		activeProjectId = null
	}: {
		onCreateProject: () => void;
		onEditProject: (id: string) => void;
		activeProjectId?: string | null;
	} = $props();

	let open = $state<boolean>(false);
	let confirmDeleteProjectId = $state<string | null>(null);
	let confirmDeleteCategoryId = $state<number | null>(null);
	let addingCategory = $state<boolean>(false);

	// Concrete hex default for the colour picker swatch (the picker needs a
	// hex value); styling fallbacks use theme variables instead.
	const DEFAULT_CATEGORY_COLOR = '#1dbda5';
	let newCategoryTitle = $state<string>('');
	let addCategoryInput = $state<HTMLInputElement | null>(null);
	let editingCategoryId = $state<number | null>(null);
	let editingCategoryTitle = $state<string>('');
	let editingInput = $state<HTMLInputElement | null>(null);
	let addKeyHandlers = $state<Record<string, string | null>>({ Enter: null, Escape: null });
	let editKeyHandlers = $state<Record<string, string | null>>({ Enter: null, Escape: null });
	let categoryColors = $state<Record<number, string>>({});

	function getCategoryHex(id: number, fallback: string | null): string {
		return categoryColors[id] ?? fallback ?? DEFAULT_CATEGORY_COLOR;
	}

	function setCategoryHex(id: number, hex: string): void {
		categoryColors[id] = hex;
	}

	function handleNavigation(): void {
		open = false;
	}

	async function addCategory(): Promise<void> {
		if (!newCategoryTitle.trim()) return;
		keyManager.unregisterAll(addKeyHandlers);
		loadingIndicator.start();
		await tt.createCategory({ title: newCategoryTitle.trim() });
		newCategoryTitle = '';
		addingCategory = false;
		loadingIndicator.stop();
	}

	function startAddCategory(): void {
		if (addingCategory) return;
		addingCategory = true;
		addKeyHandlers.Enter = keyManager.registerKeyDown('Enter', () => addCategory(), { priority: 2 });
		addKeyHandlers.Escape = keyManager.registerKeyDown('Escape', () => {
			keyManager.unregisterAll(addKeyHandlers);
			addingCategory = false;
			newCategoryTitle = '';
		});
	}

	async function startEditCategory(id: number, title: string): Promise<void> {
		keyManager.unregisterAll(editKeyHandlers);
		editingCategoryId = id;
		editingCategoryTitle = title;
		editKeyHandlers.Enter = keyManager.registerKeyDown('Enter', () => saveEditCategory(), { priority: 2 });
		editKeyHandlers.Escape = keyManager.registerKeyDown('Escape', () => cancelEditCategory());
		await tick();
		editingInput?.focus();
	}

	async function saveEditCategory(): Promise<void> {
		if (editingCategoryId === null || !editingCategoryTitle.trim()) return;
		keyManager.unregisterAll(editKeyHandlers);
		loadingIndicator.start();
		await tt.updateCategory(editingCategoryId, { title: editingCategoryTitle.trim() });
		editingCategoryId = null;
		editingCategoryTitle = '';
		loadingIndicator.stop();
	}

	function cancelEditCategory(): void {
		keyManager.unregisterAll(editKeyHandlers);
		editingCategoryId = null;
		editingCategoryTitle = '';
	}

	async function handleColorChange(id: number): Promise<void> {
		const category = tt.categories.find((c) => c.id === id);
		const newColor = categoryColors[id];
		if (!newColor || !category || newColor === (category.color ?? DEFAULT_CATEGORY_COLOR)) return;
		await tt.updateCategory(id, { color: newColor });
	}

	onDestroy(() => {
		keyManager.unregisterAll(addKeyHandlers);
		keyManager.unregisterAll(editKeyHandlers);
	});
</script>

{#snippet sidebar()}
	<div class="flex items-center justify-between border-b border-c-neutral-2 p-4 mb-4 lg:hidden dark:border-s-dark-3">
		<span class="text-2xl font-bold 2xl:font-normal">
			{ts.get.timeTracking.time_tracking}
		</span>
		<CloseButton onClick={handleNavigation} inModal={false} />
	</div>

	<div class="p-4 lg:p-0">
		<div class="flex flex-col gap-0.5">
			<a
				href={resolve(urls.timeTracking)}
				class="-mx-2 flex w-[calc(100%+1rem)] flex-row items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-all hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
				class:bg-c-neutral-1={!activeProjectId && activeTab === 'dashboard'}
				class:dark:bg-s-dark-3={!activeProjectId && activeTab === 'dashboard'}
				onclick={handleNavigation}
			>
				<IconLayoutDashboard class="size-4" />
				{ts.get.timeTracking.dashboard}
			</a>
			<a
				href="{resolve(urls.timeTracking)}?tab=entries"
				class="-mx-2 flex w-[calc(100%+1rem)] flex-row items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-all hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
				class:bg-c-neutral-1={!activeProjectId && activeTab === 'entries'}
				class:dark:bg-s-dark-3={!activeProjectId && activeTab === 'entries'}
				onclick={handleNavigation}
			>
				<IconList class="size-4" />
				{ts.get.timeTracking.entries}
			</a>
			<a
				href="{resolve(urls.timeTracking)}?tab=statistics"
				class="-mx-2 flex w-[calc(100%+1rem)] flex-row items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-all hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
				class:bg-c-neutral-1={!activeProjectId && activeTab === 'statistics'}
				class:dark:bg-s-dark-3={!activeProjectId && activeTab === 'statistics'}
				onclick={handleNavigation}
			>
				<IconChartPie class="size-4" />
				{ts.get.timeTracking.statistics}
			</a>
		</div>

		<div class="flex flex-col gap-1">
			<div class="flex flex-row items-center justify-between">
				<span class="mb-1 mt-2 text-base font-bold 2xl:text-2xl 2xl:font-normal">
					{ts.get.timeTracking.projects}
				</span>
				<button
					aria-label={ts.get.timeTracking.add_project}
					class="cursor-pointer rounded-full p-1.5 text-c-neutral-4 transition-colors hover:bg-c-neutral-1 hover:text-c-primary dark:hover:bg-s-dark-3"
					onclick={() => {
						onCreateProject();
						handleNavigation();
					}}
				>
					<IconPlus class="size-4" />
				</button>
			</div>
			{#each tt.projects as project (project.id)}
				<div
					class="-mx-2 flex w-[calc(100%+1rem)] flex-row items-center justify-between rounded-md px-2 py-1.5 transition-all hover:bg-c-neutral-1 dark:hover:bg-s-dark-3"
					class:bg-c-neutral-1={activeProjectId === project.id}
					class:dark:bg-s-dark-3={activeProjectId === project.id}
				>
					<a
						href={resolve(urls.timeTrackingProject, { id: project.id })}
						class="flex min-w-0 flex-1 flex-col text-left text-sm"
						onclick={() => handleNavigation()}
					>
						<span class="truncate font-medium">{project.title}</span>
						<span class="text-xs text-c-neutral-4 dark:text-c-neutral-5">
							{tt.formatDuration(project.total_duration ?? 0)}
						</span>
					</a>
					<div class="flex flex-row items-center gap-0.5">
						<button
							aria-label={ts.get.timeTracking.edit_project}
							class="cursor-pointer rounded-full p-1.5 text-c-neutral-4 transition-colors hover:bg-c-neutral-2 hover:text-c-primary dark:hover:bg-s-dark-2"
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onEditProject(project.id);
								handleNavigation();
							}}
						>
							<IconPen class="size-3.5" />
						</button>
						<button
							aria-label={ts.get.timeTracking.deletion_title}
							class="cursor-pointer rounded-full p-1.5 text-c-neutral-4 transition-colors hover:bg-c-neutral-2 hover:text-c-danger dark:hover:bg-s-dark-2"
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								confirmDeleteProjectId = project.id;
							}}
						>
							<IconTrash class="size-3.5" />
						</button>
					</div>
				</div>
			{/each}
		</div>

		<div class="flex flex-col gap-1">
			<div class="flex flex-row items-center justify-between">
				<span class="mb-1 mt-2 text-base font-bold 2xl:text-2xl 2xl:font-normal">
					{ts.get.timeTracking.categories}
				</span>
				<button
					aria-label={ts.get.timeTracking.add_category}
					class="cursor-pointer rounded-full p-1.5 text-c-neutral-4 transition-colors hover:bg-c-neutral-1 hover:text-c-primary dark:hover:bg-s-dark-3"
					onclick={async () => {
						startAddCategory();
						await tick();
						addCategoryInput?.focus();
					}}
				>
					<IconPlus class="size-4" />
				</button>
			</div>
			{#if addingCategory}
				<div class="flex flex-row items-center space-x-2">
					<TextInput
						bind:input={addCategoryInput}
						bind:value={newCategoryTitle}
						onblur={() => {
							keyManager.unregisterAll(addKeyHandlers);
							addingCategory = false;
							newCategoryTitle = '';
						}}
						placeholder={ts.get.timeTracking.title}
					/>
					<SaveButton onClick={addCategory} />
				</div>
			{/if}
			{#each tt.categories as category (category.id)}
				<div class="flex flex-row items-center justify-between py-1">
					<div class="flex flex-row items-center gap-2">
						<div use:clickOutside={() => handleColorChange(category.id)}>
							<ColorPicker
								hex={getCategoryHex(category.id, category.color)}
								onInput={(e) => { if (e.hex) setCategoryHex(category.id, e.hex); }}
								position="responsive"
								nullable={false}
								label=""
								isTextInput={false}
								--cp-border-color="var(--color-c-neutral-2)"
							/>
						</div>
						{#if editingCategoryId === category.id}
							<TextInput bind:input={editingInput} bind:value={editingCategoryTitle} onblur={saveEditCategory} />
						{:else}
							<span class="text-sm">{category.title}</span>
						{/if}
					</div>
					<div class="flex flex-row items-center gap-0.5">
						{#if editingCategoryId !== category.id}
							<button
								aria-label={ts.get.timeTracking.edit_category}
								class="cursor-pointer rounded-full p-1.5 text-c-neutral-4 transition-colors hover:bg-c-neutral-2 hover:text-c-primary dark:hover:bg-s-dark-2"
								onclick={() => startEditCategory(category.id, category.title)}
							>
								<IconPen class="size-3.5" />
							</button>
						{/if}
						<button
							aria-label={ts.get.timeTracking.category_deletion_title}
							class="cursor-pointer rounded-full p-1.5 text-c-neutral-4 transition-colors hover:bg-c-neutral-2 hover:text-c-danger dark:hover:bg-s-dark-2"
							onclick={() => (confirmDeleteCategoryId = category.id)}
						>
							<IconTrash class="size-3.5" />
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/snippet}

<HamburgerButton onclick={() => (open = true)} top={6} />

<div
	class="secondary-nav-mobile-container relative hidden h-full max-h-screen w-64 shrink-0 flex-col gap-4 overflow-y-auto bg-c-bg p-4 drop-shadow-xl lg:flex dark:border-r-1 dark:border-s-dark-2 dark:drop-shadow-sm dark:drop-shadow-s-dark-shadow"
	in:fade
>
	{@render sidebar()}
</div>

{#if open}
	<div
		class="secondary-nav-mobile-container fixed inset-x-0 top-0 bottom-16 z-50 flex w-full flex-col overflow-y-auto bg-c-bg lg:hidden dark:bg-s-dark-1"
		transition:fly={{ x: -400, duration: 200 }}
	>
		{@render sidebar()}
	</div>
{/if}

{#if confirmDeleteProjectId}
	<ConfirmationModal
		title={ts.get.timeTracking.deletion_title}
		description={ts.get.timeTracking.deletion_description}
		type="confirm-delete"
		onConfirm={async () => {
			await tt.deleteProject(confirmDeleteProjectId!);
			confirmDeleteProjectId = null;
		}}
		onCancel={() => (confirmDeleteProjectId = null)}
	/>
{/if}

{#if confirmDeleteCategoryId !== null}
	<ConfirmationModal
		title={ts.get.timeTracking.category_deletion_title}
		description={ts.get.timeTracking.category_deletion_description}
		type="confirm-delete"
		onConfirm={async () => {
			await tt.deleteCategory(confirmDeleteCategoryId!);
			confirmDeleteCategoryId = null;
		}}
		onCancel={() => (confirmDeleteCategoryId = null)}
	/>
{/if}
