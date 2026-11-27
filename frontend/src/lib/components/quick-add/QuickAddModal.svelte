<script lang="ts">
	import { getQuickAdd } from '$lib/state/QuickAdd.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import IconLink from '$lib/icons/lucide/link.svelte';
	import IconArrowLeft from '$lib/icons/lucide/arrow-left.svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import BottomSheetModal from '$lib/components/ui/BottomSheetModal.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconBookOpen from '$lib/icons/lucide/book-open.svelte';
	import IconFilm from '$lib/icons/lucide/film.svelte';
	import IconMusic from '$lib/icons/lucide/eighth-notes.svelte';
	import IconGamepad from '$lib/icons/lucide/gamepad-2.svelte';
	import IconChefHat from '$lib/icons/lucide/chef-hat.svelte';
	import IconLeaf from '$lib/icons/lucide/leaf.svelte';
	import IconQuote from '$lib/icons/lucide/quote.svelte';
	import IconListTodo from '$lib/icons/lucide/list-todo.svelte';
	import IconNotebookPen from '$lib/icons/lucide/notebook-pen.svelte';
	import IconRss from '$lib/icons/lucide/rss.svelte';
	import IconClipboard from '$lib/icons/lucide/clipboard.svelte';
	import { type QuickAddContentType } from '$lib/types/quick_add';
	import QuickAddTypeButton from '$lib/components/quick-add/QuickAddTypeButton.svelte';
	import QuickAddDetectedType from '$lib/components/quick-add/QuickAddDetectedType.svelte';

	const quickAdd = getQuickAdd();
	const ts = getTranslation();
	const keyManager = getKeyManager();
	const viewPoint = getViewPoint();

	const FOCUS_AFTER_OPEN_MS = 350;

	let keyHandlers: { [key: string]: string | null } = { Escape: null, Enter: null };
	let contentInput: HTMLInputElement | null = $state(null);
	let isMobile = $state<boolean | null>(null);

	const TYPE_ICONS = {
		links: IconLink,
		books: IconBookOpen,
		movies: IconFilm,
		music: IconMusic,
		games: IconGamepad,
		recipes: IconChefHat,
		plants: IconLeaf,
		quotes: IconQuote,
		todo: IconListTodo,
		note: IconNotebookPen,
		feed: IconRss,
		clipboard: IconClipboard
	} as const;

	const ALL_TYPES: QuickAddContentType[] = [
		'links',
		'books',
		'movies',
		'music',
		'games',
		'recipes',
		'plants',
		'quotes',
		'feed',
		'todo',
		'note',
		'clipboard'
	];

	const TEXT_TYPES: QuickAddContentType[] = ['quotes', 'todo', 'note', 'clipboard'];

	function availableTypes(): QuickAddContentType[] {
		return quickAdd.isUrl ? ALL_TYPES : TEXT_TYPES;
	}

	onMount(() => {
		isMobile = viewPoint.isMobile;
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', close, { priority: 0 });
		keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter, { priority: 0 });
		setTimeout(async () => {
			await tick();
			contentInput?.focus();
		}, FOCUS_AFTER_OPEN_MS);
	});

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	function handleSubmit(): void {
		if (!quickAdd.content.trim() || quickAdd.loading) return;
		quickAdd.detect();
	}

	function handleEnter(): void {
		if (quickAdd.loading) return;
		if (quickAdd.needsConfirmation && quickAdd.detectedType) {
			quickAdd.confirmDetected();
		} else if (!quickAdd.showTypeSelector && !quickAdd.needsConfirmation) {
			handleSubmit();
		}
	}

	function onFormSubmit(event: SubmitEvent): void {
		event.preventDefault();
		handleSubmit();
	}

	function close(): void {
		quickAdd.closeModal();
	}

	function backToConfirmation(): void {
		quickAdd.backToConfirmation();
	}

	function rejectDetection(): void {
		quickAdd.rejectDetection();
	}

	function confirmDetected(): void {
		quickAdd.confirmDetected();
	}

	function confidencePercent(): number {
		return Math.round(quickAdd.confidence * 100);
	}

	function metadataEntries(): [string, string][] {
		const m = quickAdd.metadata;
		if (!m) return [];
		return Object.entries(m).filter(
			(entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0
		);
	}
</script>

{#snippet inner()}
	{#if quickAdd.showTypeSelector}
		<div class="flex flex-col gap-5">
			<button
				class="flex w-fit cursor-pointer items-center gap-1 rounded-md p-1 text-xs text-c-neutral-5 transition-colors hover:text-c-heading dark:hover:text-c-primary"
				onclick={backToConfirmation}
			>
				<IconArrowLeft class="h-3.5 w-3.5" />
				{ts.get.quick_add.back}
			</button>
			<p class="text-lg font-bold">{ts.get.quick_add.select_type}</p>
			<div class="grid grid-cols-3 gap-2 max-md:grid-cols-2">
				{#each availableTypes() as type (type)}
					<QuickAddTypeButton
						label={ts.get.quick_add.content_types[type]}
						icon={TYPE_ICONS[type]}
						onClick={() => quickAdd.selectType(type)}
					/>
				{/each}
			</div>
		</div>
	{:else if quickAdd.needsConfirmation && quickAdd.detectedType}
		<div class="flex flex-col gap-5">
			<QuickAddDetectedType
				label={ts.get.quick_add.content_types[quickAdd.detectedType]}
				icon={TYPE_ICONS[quickAdd.detectedType]}
				confidencePercent={confidencePercent()}
			/>
			{#if metadataEntries().length > 0}
				<div class="flex flex-col gap-2">
					{#each metadataEntries() as [key, value] (key)}
						<ModalFormRow label={key.replace(/_/g, ' ')}>
							<span class="text-sm">{value}</span>
						</ModalFormRow>
					{/each}
				</div>
			{/if}
			{#if quickAdd.error}
				<p class="rounded-lg bg-c-danger/10 px-3 py-2 text-sm text-c-danger">{quickAdd.error}</p>
			{/if}
			<div class="flex justify-end gap-2">
				<TextButton
					title={ts.get.quick_add.choose_different}
					type="slight"
					onclick={rejectDetection}
					disabled={quickAdd.loading}
				/>
				<TextButton
					title={ts.get.quick_add.confirm}
					onclick={confirmDetected}
					disabled={quickAdd.loading}
				/>
			</div>
		</div>
	{:else}
		<form
			onsubmit={onFormSubmit}
			class="flex gap-3"
			class:flex-col={isMobile}
			class:items-center={!isMobile}
		>
			<div class="flex-1">
				<TextInput
					bind:input={contentInput}
					bind:value={quickAdd.content}
					placeholder={ts.get.quick_add.placeholder}
				/>
			</div>
			<TextButton
				title={quickAdd.loading ? ts.get.quick_add.adding : ts.get.quick_add.add}
				disabled={quickAdd.loading || !quickAdd.content.trim()}
				onclick={handleSubmit}
				class={isMobile ? 'mt-5 w-full' : ''}
			/>
		</form>
		{#if quickAdd.error}
			<p class="mt-3 rounded-lg bg-c-danger/10 px-3 py-2 text-sm text-c-danger">{quickAdd.error}</p>
		{/if}
	{/if}
{/snippet}

{#if isMobile === true}
	<BottomSheetModal title={ts.get.quick_add.title} onClose={close}>
		{@render inner()}
	</BottomSheetModal>
{:else if isMobile === false}
	<ContentModal
		title={ts.get.quick_add.title}
		onClose={close}
		rounded="2xl"
		width="[24rem]"
		p="6"
	>
		{@render inner()}
	</ContentModal>
{/if}

<!-- md:w-[24rem] -->