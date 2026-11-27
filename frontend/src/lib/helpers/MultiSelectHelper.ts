import type { MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';
import type { Tag } from '$lib/types/tag';

export function tagEntries(tags: Tag[]): MultiSelectEntry[] {
	return tags.map((tag) => ({ label: tag.name, value: tag.id.toString() }));
}

export function genreEntries(genres: { id: number; title: string }[]): MultiSelectEntry[] {
	return genres.map((genre) => ({ label: genre.title, value: genre.id.toString() }));
}

export function selectedIds(entries: MultiSelectEntry[]): number[] {
	return entries.filter((entry) => entry.value).map((entry) => Number(entry.value));
}

export async function createdEntryValue(created: Promise<{ id: number } | null>, onFailure: () => void): Promise<string | null> {
	const entry = await created;
	if (!entry) {
		onFailure();
		return null;
	}
	return entry.id.toString();
}
