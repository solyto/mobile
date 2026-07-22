<script lang="ts">
	import { getQuickAdd } from '$lib/state/QuickAdd.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { getKeyManager } from '$lib/KeyManager.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import IconLink from '@lucide/svelte/icons/link';
	import IconArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import BottomSheetModal from '$lib/components/ui/BottomSheetModal.svelte';
	import { getViewPoint } from '$lib/state/Viewpoint.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import ModalFormRow from '$lib/components/ui/ModalFormRow.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import IconBookOpen from '@lucide/svelte/icons/book-open';
	import IconFilm from '@lucide/svelte/icons/film';
	import IconMusic from '@lucide/svelte/icons/music';
	import IconGamepad from '@lucide/svelte/icons/gamepad-2';
	import IconChefHat from '@lucide/svelte/icons/chef-hat';
	import IconLeaf from '@lucide/svelte/icons/leaf';
	import IconQuote from '@lucide/svelte/icons/quote';
	import IconListTodo from '@lucide/svelte/icons/list-todo';
	import IconNotebookPen from '@lucide/svelte/icons/notebook-pen';
	import IconRss from '@lucide/svelte/icons/rss';
	import IconClipboard from '@lucide/svelte/icons/clipboard';
	import { type QuickAddContentType } from '$lib/types/quick_add';

	const quickAdd = getQuickAdd();
	const ts = getTranslation();
	const keyManager = getKeyManager();
	const viewPoint = getViewPoint();

	let keyHandlers = $state<{ [key: string]: string | null }>({ Escape: null, Enter: null });
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

	onMount(async () => {
		isMobile = viewPoint.isMobile;
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', () => quickAdd.closeModal(), { priority: 0 });
		keyHandlers.Enter = keyManager.registerKeyDown('Enter', handleEnter, { priority: 0 });
		setTimeout(async () => {
			await tick();
			contentInput?.focus();
		}, 350);
	});

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	function handleSubmit(): void {
		if (!quickAdd.content.trim() || quickAdd.loading) return;
		quickAdd.detect();
	}

	function handleEnter(): void {
		if (quickAdd.loading) return;
		if (quickAdd.needsConfirmation && quickAdd.detectedType) {
			quickAdd.confirm(quickAdd.detectedType);
		} else if (!quickAdd.showTypeSelector && !quickAdd.needsConfirmation) {
			handleSubmit();
		}
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
				onclick={() => quickAdd.backToConfirmation()}
			>
				<IconArrowLeft class="h-3.5 w-3.5" />
				{ts.get.quick_add.back}
			</button>
			<p class="text-lg font-bold">{ts.get.quick_add.select_type}</p>
			<div class="grid grid-cols-3 gap-2 max-md:grid-cols-2">
				{#each availableTypes() as type}
					{@const Icon = TYPE_ICONS[type]}
					<button
						class="group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-1 border-c-neutral-2 bg-c-bg-elevated px-3 py-3.5 text-c-heading transition-colors hover:border-c-btn hover:shadow-sm dark:border-s-dark-3 dark:text-c-primary"
						onclick={() => quickAdd.selectType(type)}
					>
						<Icon class="size-6 text-c-neutral-5 transition-colors group-hover:text-c-btn" />
						<span class="text-sm font-bold">{ts.get.quick_add.content_types[type]}</span>
					</button>
				{/each}
			</div>
		</div>
	{:else if quickAdd.needsConfirmation && quickAdd.detectedType}
		{@const DetectedIcon = TYPE_ICONS[quickAdd.detectedType]}
		<div class="flex flex-col gap-5">
			<div class="flex w-full items-center gap-4 rounded-xl border-1 border-c-neutral-2 p-4 dark:border-s-dark-3">
				<DetectedIcon class="h-8 w-8 shrink-0 text-c-neutral-5" />
				<div class="flex flex-1 flex-col gap-1.5">
					<span class="text-lg font-bold">{ts.get.quick_add.content_types[quickAdd.detectedType]}</span>
					<div class="flex items-center gap-2">
						<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-c-neutral-2 dark:bg-s-dark-3">
							<div class="h-full rounded-full bg-c-btn transition-all" style="width: {confidencePercent()}%"></div>
						</div>
						<span class="text-xs text-c-neutral-5">{confidencePercent()}%</span>
					</div>
				</div>
			</div>
			{#if metadataEntries().length > 0}
				<div class="flex flex-col gap-2">
					{#each metadataEntries() as [key, value]}
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
					onclick={() => quickAdd.rejectDetection()}
					disabled={quickAdd.loading}
				/>
				<TextButton
					title={ts.get.quick_add.confirm}
					onclick={() => quickAdd.confirm(quickAdd.detectedType!)}
					disabled={quickAdd.loading}
				/>
			</div>
		</div>
	{:else}
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="flex items-center gap-3">
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
			/>
		</form>
		{#if quickAdd.error}
			<p class="mt-3 rounded-lg bg-c-danger/10 px-3 py-2 text-sm text-c-danger">{quickAdd.error}</p>
		{/if}
	{/if}
{/snippet}

{#if isMobile === true}
	<BottomSheetModal title={ts.get.quick_add.title} onClose={() => quickAdd.closeModal()}>
		{@render inner()}
	</BottomSheetModal>
{:else if isMobile === false}
	<ContentModal
		title={ts.get.quick_add.title}
		onClose={() => quickAdd.closeModal()}
		rounded="2xl"
		width="[24rem]"
		p="6"
	>
		{@render inner()}
	</ContentModal>
{/if}

<!-- md:w-[24rem] -->