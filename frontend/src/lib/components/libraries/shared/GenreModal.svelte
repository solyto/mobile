<script lang="ts">
	import ContentModal from '$lib/components/ui/ContentModal.svelte';
	import IconX from '$lib/icons/lucide/x.svelte';
	import { getLoadingIndicator } from '$lib/state/LoadingIndicator.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';
	import CreateEntry from '$lib/components/settings/CreateEntry.svelte';
	import type { MusicGenre } from '$lib/types/library_music';
	import Heading from '$lib/components/ui/Heading.svelte';
	import type { GenreLibrary } from '$lib/types/library';

	const loadingIndicator = getLoadingIndicator();
	const ts = getTranslation();

	let { library }: { library: GenreLibrary } = $props();

	async function createGenre(title: string): Promise<void> {
		loadingIndicator.start();
		try {
			await library.createGenre(title);
		} finally {
			loadingIndicator.stop();
		}
	}

	async function deleteGenre(genre: MusicGenre): Promise<void> {
		loadingIndicator.start();
		try {
			await library.deleteGenre(genre);
		} finally {
			loadingIndicator.stop();
		}
	}

	function addGenre(title: string): void {
		createGenre(title);
	}

	function closeModal(): void {
		library.closeGenreModal();
	}
</script>

<ContentModal rounded="2xl" p="4" small={true} width="96" onClose={closeModal}>
	<div class="flex flex-col gap-4">
		<Heading title={ts.get.libraries.genres} my={2} />
		<div class="flex flex-col gap-2">
			{#each library.genres as genre (genre.id)}
				<div class="flex items-center gap-2">
					<div class="flex-1">{genre.title}</div>
					<button class="cursor-pointer" onclick={() => deleteGenre(genre)}>
						<IconX class="text-c-danger" />
					</button>
				</div>
			{/each}
		</div>
		<CreateEntry label={ts.get.libraries.new_genre} create={addGenre} buttonType="slight" />
	</div>
</ContentModal>
