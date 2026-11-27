<script lang="ts">
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import TextButton from '$lib/components/ui/buttons/TextButton.svelte';
	import { getTranslation } from '$lib/state/Translation.svelte';

	let { addressBooks, busy, onsubmit }: {
		addressBooks: string[];
		busy: boolean;
		onsubmit: (selected: string[]) => void;
	} = $props();

	const ts = getTranslation();
	const uid = $props.id();

	let selected = $state<string[]>([]);

	function toggle(addressBook: string): void {
		selected = selected.includes(addressBook) ? selected.filter((a) => a !== addressBook) : [...selected, addressBook];
	}

	function submit(): void {
		onsubmit(selected);
	}
</script>

<div class="flex flex-col gap-2">
	{#each addressBooks as addressBook, i (addressBook)}
		<div class="flex w-full items-center justify-between gap-2">
			<label for="{uid}-{i}" class="cursor-pointer">{addressBook}</label>
			<Checkbox id="{uid}-{i}" isChecked={selected.includes(addressBook)} onchange={() => toggle(addressBook)} />
		</div>
	{/each}
	<TextButton type="primary" title={ts.get.contacts.import} disabled={busy || selected.length === 0} onclick={submit} class="mt-4" />
</div>
