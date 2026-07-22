<script lang="ts">
	import { fade } from 'svelte/transition';
	import MissingCover from '$lib/components/libraries/shared/MissingCover.svelte';
	import Rating from '$lib/components/libraries/shared/Rating.svelte';
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import type { Library } from '$lib/types/library';
	import { getTranslation } from '$lib/state/Translation.svelte';

	const ts = getTranslation();

	let {
		title,
		library,
		children,
		existingCover,
		newCover,
		onCoverClick,
		onCoverRemove,
		selectedRating = $bindable(),
		isWishlist = $bindable()
	} = $props<{
		title: string;
		library: Library;
		children: any;
		existingCover?: string | null;
		newCover?: string;
		onCoverClick?: () => void;
		onCoverRemove?: () => void;
		selectedRating?: number | null;
		isWishlist?: boolean;
	}>();
</script>

<ContentModal rounded="2xl" p="8" onClose={() => library.closeCreateModal()} {title}>
	<div class="flex flex-col gap-8 overflow-x-hidden md:flex-row">
		{#if library.config.hasCovers || library.config.hasRatings || library.config.hasWishlist}
			<div class="flex flex-col items-center gap-2">
				{#if library.config.hasCovers}
					<div class="aspect-ratio max-w-48">
						{#if existingCover}
							<div
								role="button"
								tabindex="0"
								onclick={onCoverClick}
								class="group relative flex size-48 items-center justify-center rounded-lg bg-c-neutral-2 dark:bg-c-neutral-5 {onCoverClick ? 'cursor-pointer' : 'cursor-default'}"
							>
								<img
									src={existingCover}
									alt="Cover"
									class="max-h-full max-w-full rounded-lg object-contain"
									in:fade={{ duration: 200 }}
								/>
								{#if onCoverClick}
									<div class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-all group-hover:bg-black/30">
										<svg class="size-8 text-white opacity-0 transition-opacity group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
										</svg>
									</div>
								{/if}
								{#if onCoverRemove}
									<button
										type="button"
										aria-label="Remove cover"
										onclick={(e) => { e.stopPropagation(); onCoverRemove!(); }}
										class="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
									>
										<svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								{/if}
							</div>
						{:else if newCover}
							<div
								role="button"
								tabindex="0"
								onclick={onCoverClick}
								class="group relative flex size-48 items-center justify-center rounded-lg {onCoverClick ? 'cursor-pointer' : 'cursor-default'}"
							>
								<img
									src={newCover}
									alt="cover"
									class="max-h-full max-w-full rounded-lg object-contain"
									transition:fade={{ duration: 200 }}
								/>
								{#if onCoverClick}
									<div class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-all group-hover:bg-black/30">
										<svg class="size-8 text-white opacity-0 transition-opacity group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
										</svg>
									</div>
								{/if}
								{#if onCoverRemove}
									<button
										type="button"
										aria-label="Remove cover"
										onclick={(e) => { e.stopPropagation(); onCoverRemove!(); }}
										class="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
									>
										<svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								{/if}
							</div>
						{:else}
							<button
								type="button"
								onclick={onCoverClick}
								class="relative flex size-48 items-center justify-center rounded-lg bg-c-neutral-1 text-xs text-c-neutral-5 {onCoverClick ? 'cursor-pointer hover:bg-c-neutral-2 dark:hover:bg-c-neutral-4' : 'cursor-default'} transition-colors"
							>
								<MissingCover {library} />
								{#if onCoverClick}
									<div class="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg opacity-0 transition-opacity hover:opacity-100">
										<svg class="size-6 text-c-neutral-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
										</svg>
									</div>
								{/if}
							</button>
						{/if}
					</div>
				{/if}
				{#if library.config.hasRatings}
					<Rating
						startRating={selectedRating}
						onchange={(rating: number) => {
							selectedRating = rating;
						}}
					/>
				{/if}
				{#if library.config.hasWishlist}
					<div class="mt-4 flex w-8/10 flex-row items-center gap-2">
						<span class="w-48 text-sm font-bold">{ts.get.libraries.wishlist}</span>
						<Checkbox
							isChecked={isWishlist}
							onchange={() => {
								isWishlist = !isWishlist;
							}}
						/>
					</div>
				{/if}
			</div>
		{/if}
		<div class="flex flex-1 flex-col gap-2 md:min-w-96">
			{@render children()}
		</div>
	</div>
</ContentModal>
