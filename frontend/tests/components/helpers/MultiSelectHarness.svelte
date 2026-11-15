<script lang="ts">
	import MultiSelect, { type MultiSelectEntry } from '$lib/components/forms/MultiSelect.svelte';

	let {
		options,
		oncreate
	}: {
		options: MultiSelectEntry[];
		oncreate: (label: string) => Promise<string | null>;
	} = $props();

	let value = $state<MultiSelectEntry[]>([]);
</script>

<MultiSelect bind:value {options} allowUserOptions {oncreate} />
<span data-testid="value">{JSON.stringify(value)}</span>
