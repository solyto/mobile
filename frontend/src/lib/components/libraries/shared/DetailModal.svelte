<script lang="ts">
	import type { Snippet } from 'svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import Rating from '$lib/components/libraries/shared/Rating.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import type { LibraryConfig, LibraryEntry } from '$lib/types/library';
	import type { Quote } from '$lib/types/library_quote';
	import ExternalLink from '$lib/components/libraries/shared/ExternalLink.svelte';
	import Cover from '$lib/components/libraries/shared/Cover.svelte';
	import type { Auth } from '$lib/state/Auth.svelte';

	const loadingIndicator = getLoadingIndicator();
	let { entry, library, children }: {
		entry: LibraryEntry;
		library: {
			auth: Auth;
			config: LibraryConfig;
			closeDetailModal(): void;
			openCreateModal(entry?: LibraryEntry): void;
			delete(entry: LibraryEntry): Promise<boolean>;
			updateRating?(entry: LibraryEntry, rating: number): Promise<boolean>;
		};
		children: Snippet;
	} = $props();

	async function changeRating(rating: number): Promise<void> {
		loadingIndicator.start();
		try {
			await library.updateRating?.(entry, rating);
		} finally {
			loadingIndicator.stop();
		}
	}

	function closeDetail(): void {
		library.closeDetailModal();
	}

	function editEntry(): void {
		library.closeDetailModal();
		library.openCreateModal(entry);
	}

	async function deleteEntry(): Promise<void> {
		await library.delete(entry);
		library.closeDetailModal();
	}
</script>

<ContentModal
	rounded="2xl"
	p="4"
	onClose={closeDetail}
	onEdit={editEntry}
	onDelete={deleteEntry}
	forcePopup={true}
>
	{#if entry}
		<div class="mr-4 flex flex-col gap-4 max-md:min-w-72 md:min-h-32 md:min-w-128 md:max-w-3xl md:flex-row">
			{#if library.config.hasCovers || library.config.hasRatings || library.config.hasExternalLinks}
				<div class="flex flex-col items-center gap-2">
					{#if library.config.hasCovers}
						<Cover entry={entry as Exclude<LibraryEntry, Quote>} {library} />
					{/if}
					{#if library.config.hasRatings}
						<div class="flex w-full justify-center">
							<Rating startRating={'rating' in entry ? (entry.rating ?? 0) : 0} onchange={changeRating} />
						</div>
					{/if}
					{#if library.config.hasExternalLinks}
						<ExternalLink entry={entry as Exclude<LibraryEntry, Quote>} />
					{/if}
				</div>
			{/if}
			<div class="flex flex-col gap-1">
				{@render children()}
			</div>
		</div>
	{/if}
</ContentModal>
