<script lang="ts">
	import { slide } from 'svelte/transition';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import IconButton from '$lib/components/ui/buttons/IconButton.svelte';
	import LibrarySearchResult from '$lib/components/libraries/shared/LibrarySearchResult.svelte';
	import IconSearch from '$lib/icons/lucide/search.svelte';
	import IconLoaderCircle from '$lib/icons/lucide/loader-circle.svelte';
	import { getKeyManager } from '$lib/state/KeyManager.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { NormalizedSearchResult, SearchSource } from '$lib/types/library';

	const ts = getTranslation();
	const keyManager = getKeyManager();

	let {
		sources,
		onClose,
		placeholder,
		resultRow
	}: {
		sources: SearchSource[];
		onClose: () => void;
		placeholder: string;
		resultRow?: Snippet<[NormalizedSearchResult, boolean, () => Promise<void>]>;
	} = $props();

	let query = $state('');
	let queryInput = $state<HTMLInputElement | null>(null);
	let loading = $state(false);
	let results = $state<(NormalizedSearchResult[] | null)[]>([]);
	let searched = $state(false);
	let importingId = $state<string | null>(null);
	let keyHandlers: { Enter: string | null; Escape: string | null } = { Enter: null, Escape: null };

	onMount(async () => {
		await tick();
		queryInput?.focus();
		keyHandlers.Enter = keyManager.registerKeyDown('Enter', search);
		keyHandlers.Escape = keyManager.registerKeyDown('Escape', onClose);
	});

	onDestroy(() => keyManager.unregisterAll(keyHandlers));

	async function search(): Promise<void> {
		if (!query.trim()) return;

		loading = true;
		searched = true;
		results = [];
		try {
			results = await Promise.all(sources.map((source) => source.search(query)));
		} finally {
			loading = false;
		}
	}

	function resultId(source: SearchSource, result: NormalizedSearchResult): string {
		return `${source.label}-${result.id}`;
	}

	async function select(source: SearchSource, result: NormalizedSearchResult): Promise<void> {
		importingId = resultId(source, result);
		try {
			await source.onSelect(result);
		} finally {
			importingId = null;
		}
	}

	const hasResults = $derived(results.some((r) => r && r.length > 0));
	// A source that answered null couldn't search at all (error or provider unreachable).
	const someSourceUnavailable = $derived(results.some((r) => r === null));
</script>

<ContentModal {onClose} title={ts.get.libraries.search} width="2xl" rounded="2xl" p="8" showTitleOnMobile={true}>
	<div class="flex flex-col gap-6">
		<div class="flex gap-2">
			<TextInput bind:value={query} bind:input={queryInput} {placeholder} />
			<IconButton type="action" onclick={search} disabled={loading}>
				{#if loading}
					<IconLoaderCircle class="size-4 animate-spin" />
				{:else}
					<IconSearch class="size-4" />
				{/if}
			</IconButton>
		</div>

		{#if searched && !loading}
			<div in:slide>
				{#if !hasResults}
					<p class="text-center text-sm text-c-neutral-5 dark:text-c-neutral-4">
						{someSourceUnavailable ? ts.get.libraries.search_unavailable : ts.get.libraries.no_results}
					</p>
				{:else}
					<div class="flex max-h-[60vh] flex-col gap-6 overflow-y-auto pr-1">
						{#each sources as source, i (source.label)}
							{#if results[i] && results[i]!.length > 0}
								<div class="flex flex-col gap-1">
									<div class="mb-1 flex items-center gap-2">
										{#if typeof source.icon === 'string'}
											<img src={source.icon} alt={source.label} class="size-4" />
										{:else}
											<source.icon class="size-4" />
										{/if}
										<span class="text-xs font-bold uppercase tracking-widest text-c-neutral-5 dark:text-c-neutral-4">{source.label}</span>
									</div>
									{#each results[i]! as result (result.id)}
										<LibrarySearchResult
											{result}
											importing={importingId === resultId(source, result)}
											disabled={importingId !== null}
											onSelect={() => select(source, result)}
											{resultRow}
										/>
									{/each}
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</ContentModal>
