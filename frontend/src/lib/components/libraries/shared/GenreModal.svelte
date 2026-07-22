<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import IconX from '@lucide/svelte/icons/x';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import CreateEntry from '$lib/components/settings/CreateEntry.svelte';
	import type { MusicGenre } from '$lib/types/library_music';
	import Heading from '$lib/components/ui/Heading.svelte';
	import type { Library } from '$lib/types/library';

	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();

	let { library } = $props<{ library: Library }>();

	async function createGenre(title: string): Promise<void> {
		loadingIndicator.start();
		await library.createGenre(title);
		loadingIndicator.stop();
	}

	async function deleteGenre(genre: MusicGenre): Promise<void> {
		loadingIndicator.start();
		await library.deleteGenre(genre);
		loadingIndicator.stop();
	}
</script>

<ContentModal rounded="2xl" p="4" small={true} width="96" onClose={() => library.closeGenreModal()}>
	<div class="flex flex-col gap-4">
		<Heading title={ts.get.libraries.genres} my={2} />
		<div class="flex flex-col gap-2">
			{#each library.genres as genre (genre.id)}
				<div class="flex items-center gap-2">
					<div class="flex-1">{genre.title}</div>
					<button
						class="cursor-pointer"
						onclick={() => {
							deleteGenre(genre);
						}}
					>
						<IconX class="text-c-danger" />
					</button>
				</div>
			{/each}
		</div>
		<CreateEntry
			label="New Genre"
			create={(title: string) => {
				createGenre(title);
			}}
			buttonType="slight"
		/>
	</div>
</ContentModal>
