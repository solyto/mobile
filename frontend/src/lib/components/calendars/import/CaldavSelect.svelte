<script lang="ts">
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { calendars, busy, onsubmit }: {
		calendars: string[];
		busy: boolean;
		onsubmit: (selected: string[]) => void;
	} = $props();

	const ts = getTranslation();
	const uid = $props.id();

	let selected = $state<string[]>([]);

	function toggle(calendar: string): void {
		selected = selected.includes(calendar) ? selected.filter((c) => c !== calendar) : [...selected, calendar];
	}

	function submit(): void {
		onsubmit(selected);
	}
</script>

<div class="flex flex-col gap-2">
	{#each calendars as calendar, i (calendar)}
		<div class="flex w-full items-center justify-between gap-2">
			<label for="{uid}-{i}" class="cursor-pointer">{calendar}</label>
			<Checkbox id="{uid}-{i}" isChecked={selected.includes(calendar)} onchange={() => toggle(calendar)} />
		</div>
	{/each}
	<TextButton type="primary" title={ts.get.calendar.import_submit} disabled={busy || selected.length === 0} onclick={submit} class="mt-4" />
</div>
