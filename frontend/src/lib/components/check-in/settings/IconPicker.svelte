<script lang="ts">
	import { getTranslation } from '$lib/state/Translation.svelte';
	import IconPickerService, { ICON_PICKER_CATEGORIES } from '$lib/services/IconPickerService';
	import type { IconPickerData } from '$lib/services/IconPickerService';
	import TrackerIcon from '$lib/components/check-in/TrackerIcon.svelte';
	import TextInput from '$lib/components/forms/TextInput.svelte';
	import Select from '$lib/components/forms/Select.svelte';

	let { selected, onSelect }: { selected: string | null; onSelect: (name: string) => void } = $props();

	const ts = getTranslation();
	const service = new IconPickerService();
	let data = $state<IconPickerData | null>(null);
	let query = $state<string>('');
	let category = $state<string>(ICON_PICKER_CATEGORIES[0]);

	const names = $derived(data ? service.filter(data, category, query) : []);

	// Loaded only when the picker opens: Lucide's categories and search terms.
	import('$lib/icons/lucide/picker-data.json').then((module) => (data = module.default as unknown as IconPickerData));

	function categoryOptions(): { label: string; value: string }[] {
		return ICON_PICKER_CATEGORIES.map((id) => ({ label: ts.get.checkIn.icon_categories[id] ?? id, value: id }));
	}
</script>

<div class="flex w-full flex-col gap-3">
	<TextInput bind:value={query} placeholder={ts.get.checkIn.icon_search} />
	{#if query.trim() === ''}
		<Select value={category} options={categoryOptions()} onchange={(value) => (category = value)} ariaLabel={ts.get.checkIn.choose_icon} />
	{/if}

	{#if data === null}
		<div class="h-72"></div>
	{:else if names.length === 0}
		<p class="h-72 py-8 text-center text-sm text-c-neutral-5 dark:text-c-neutral-4">{ts.get.checkIn.icon_none}</p>
	{:else}
		<div class="grid h-72 grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] content-start gap-1 overflow-y-auto p-1">
			{#each names as name (name)}
				<button
					type="button"
					class="flex aspect-square cursor-pointer items-center justify-center rounded-lg transition-all hover:bg-c-neutral dark:hover:bg-s-dark-3"
					class:bg-c-primary={selected === name}
					class:text-white={selected === name}
					title={name}
					aria-label={name}
					aria-pressed={selected === name}
					onclick={() => onSelect(name)}
				>
					<TrackerIcon {name} class="size-6" />
				</button>
			{/each}
		</div>
	{/if}
</div>
