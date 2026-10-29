<script lang="ts">
	import { fade } from 'svelte/transition';
	import IconBot from '@lucide/svelte/icons/bot';
	import IconRotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconButton from '$lib/components/ui/buttons/IconButton.svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import LoadingLogo from '$lib/components/ui/LoadingLogo.svelte';
	import type { LibraryRecommendation, LibraryRecommendationType } from '$lib/types/library';
	import { getAuth } from '$lib/state/Auth.svelte';
	import type { MusicLibrary } from '$lib/state/MusicLibrary.svelte';
	import type { BookLibrary } from '$lib/state/BookLibrary.svelte';
	import Recommendation from '$lib/components/libraries/shared/Recommendation.svelte';
	import { apiRoutes } from '$lib/config/apiRoutes';
	import { urls } from '$lib/config/urls';
	import { resolve } from '$app/paths';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';

	const ts = getTranslation();
	const auth = getAuth();

	let { library }: { library: MusicLibrary | BookLibrary } = $props();

	let modalVisible = $state<boolean>(false);
	let selection = $state<LibraryRecommendationType | null>(null);
	let recommendation = $state<LibraryRecommendation | null>(null);
	let recommendationLoaded = $state<boolean>(false);
	let loadingText = $state<string>('Loading...');

	function toggleChat() {
		if (modalVisible) {
			selection = null;
			recommendation = null;
		}

		modalVisible = !modalVisible;
	}

	async function select(type: LibraryRecommendationType): Promise<void> {
		if (type === 'new') {
			loadingText = ts.get.libraries.recommendations.loading_text_remote;
		} else {
			loadingText = ts.get.libraries.recommendations.loading_text_local;
		}

		recommendationLoaded = false;
		selection = type;

		await loadRecommendation();
	}

	function showsAiPluginHint(): boolean {
		return selection === 'new' && recommendationLoaded && recommendation === null;
	}

	async function loadRecommendation(): Promise<void> {
		recommendationLoaded = false;
		recommendation = await library.recommend(selection!);
		setTimeout(() => {
			recommendationLoaded = true;
		}, 500);

		if (recommendation === null) return;

		if (recommendation.id === null) {
			const apiService = auth.apiService;
			const query = encodeURIComponent(`${recommendation.creator} ${recommendation.title}`);
			const res = await apiService.list(`${apiRoutes.libraries.music.search}/deezer/${query}`);
			if (res !== null && res.data.length > 0) {
				const item = (res.data as Array<{ url: string; cover: string | null }>)[0];
				recommendation.link = item.url;
				recommendation.cover = item.cover;
			}
		}
	}
</script>

<div class="relative">
	<IconButton type="action" onclick={toggleChat}>
		<IconBot />
		<span class="max-md:hidden">{ts.get.libraries.recommend}</span>
	</IconButton>
</div>

{#if modalVisible}
	<ContentModal onClose={toggleChat} title={ts.get.libraries.recommend} transparent={true}>
		<div
			class="flex flex-col items-start gap-2 overflow-x-hidden py-4 max-md:h-full max-md:justify-center md:h-92 md:w-112"
		>
			{#if selection === null}
				{@render recommenderOption('favorite', 'teal')}
				{@render recommenderOption('unrated', 'purple')}
				{@render recommenderOption('random', 'orange')}
				{@render recommenderOption('new', 'red')}
			{:else}
				{#if !recommendationLoaded}
					<div class="mx-2 my-4">
						<LoadingLogo label={loadingText} />
					</div>
				{/if}
				{#if recommendation && recommendationLoaded}
					<Recommendation {library} item={recommendation} />
					<div class="mt-3 flex w-full justify-end gap-2 md:mt-8">
						<button
							class="flex cursor-pointer items-center justify-center gap-3 rounded-lg bg-c-action px-4 py-2 text-c-action-icon drop-shadow-md transition-all hover:bg-c-warning hover:text-c-action-icon-hover hover:shadow-xs hover:drop-shadow-xl"
							in:fade
							onclick={async () => loadRecommendation()}
						>
							<IconRotateCcw />
							{ts.get.libraries.recommendations.not_satisfied}
						</button>
					</div>
				{/if}
				{#if showsAiPluginHint()}
					<div class="mx-2 flex flex-col items-start gap-4" in:fade>
						<p class="text-sm">{ts.get.libraries.recommendations.ai_plugin_hint}</p>
						<TextButton title={ts.get.libraries.recommendations.open_settings} type="primary" href={resolve(urls.settings)} />
					</div>
				{/if}
			{/if}
		</div>
	</ContentModal>
{/if}

{#snippet recommenderOption(type: LibraryRecommendationType, color: string)}
	<button
		type="button"
		class="relative w-full cursor-pointer rounded-lg border-1 border-c-neutral-1 bg-c-bg-surface text-left shadow-sm transition-all hover:bg-c-neutral dark:border-s-dark-2 dark:hover:bg-s-dark-3"
		onclick={() => select(type)}
	>
		<div
			class="w-1 absolute rounded-lg"
			style="background-color: var(--color-s-{color}); height: calc(100% - 16px); top: 8px; left: 12px;"
		></div>
		<div class="ml-4 w-full px-4 py-2">
			{ts.get.libraries.recommendations[type as keyof typeof ts.get.libraries.recommendations]}
		</div>
	</button>
{/snippet}
