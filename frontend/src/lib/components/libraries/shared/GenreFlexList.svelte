<script lang="ts">
	import type { MusicGenre } from '$lib/types/library_music';
	import type { BookGenre } from '$lib/types/library_book';

	let { genres } = $props<{
		genres: MusicGenre[] | BookGenre[];
	}>();
</script>

<div class="flex flex-row gap-1">
	{#each genres as genre (genre.id)}
		<div
			class="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold bg-c-neutral"
		>
			{genre.title}
		</div>
	{/each}
</div>
