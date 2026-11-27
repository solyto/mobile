<script lang="ts">
	import type { TodoCategory } from '$lib/types/todo';
	import { fade } from 'svelte/transition';
	import { onDestroy } from 'svelte';
	import IconPen from '$lib/icons/lucide/pen.svelte';
	import { getTodos } from '$lib/state/Todos.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import DeleteButton from '$lib/components/ui/buttons/DeleteButton.svelte';
	import ConfirmationModal from '$lib/components/ui/ConfirmationModal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import { InlineRename } from '$lib/helpers/InlineRename.svelte';

	const todos = getTodos();
	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();

	let { category }: { category: TodoCategory } = $props();

	let deleteModalOpen = $state<boolean>(false);
	const rename = new InlineRename(currentTitle, saveTitle);

	function openDeleteModal(): void {
		deleteModalOpen = true;
	}

	function closeDeleteModal(): void {
		deleteModalOpen = false;
	}

	async function onDelete(): Promise<void> {
		deleteModalOpen = false;
		loadingIndicator.start();
		try {
			await todos.deleteCategory(category);
		} finally {
			loadingIndicator.stop();
		}
	}

	function currentTitle(): string {
		return category.title;
	}

	function saveTitle(title: string): Promise<boolean> {
		return todos.updateCategory(category, { title });
	}

	onDestroy(() => rename.destroy());
</script>

<div
	class="group flex min-h-11 break-inside-avoid items-center gap-2 px-2 text-base md:mb-2 md:min-h-0 md:w-fit md:max-w-full md:gap-0 md:bg-c-neutral-1 md:py-1 md:text-sm md:dark:bg-c-neutral-7 md:dark:text-white"
	in:fade
>
	{#if rename.editing}
		<div class="w-full py-1 md:w-48 md:py-0">
			<TextInput
				bind:input={rename.input}
				bind:value={rename.title}
				onblur={rename.finish}
				placeholder={ts.get.todos.rename_category}
			/>
		</div>
	{:else}
		<span class="flex-1 truncate md:flex-none">/{category.title}</span>
		<div class="flex items-center gap-5 overflow-hidden transition-all md:gap-1 pointer-fine:w-0 pointer-fine:opacity-0 pointer-fine:group-hover:ml-2 pointer-fine:group-hover:w-9 pointer-fine:group-hover:opacity-100">
			<button
				class="flex shrink-0 cursor-pointer items-center justify-center rounded-full text-c-neutral-3 transition-all hover:text-c-heading"
				title={ts.get.todos.rename_category}
				onclick={rename.start}
			>
				<IconPen class="size-5 md:size-4" />
			</button>
			<DeleteButton onClick={openDeleteModal} inModal={false} buttonStyle="minimal" iconClass="size-5 md:size-4" />
		</div>
	{/if}
</div>

{#if deleteModalOpen}
	<ConfirmationModal
		title={ts.get.todos.category_deletion_title}
		description={ts.get.todos.category_deletion_description}
		type="confirm-delete"
		onConfirm={onDelete}
		onCancel={closeDeleteModal}
	/>
{/if}
