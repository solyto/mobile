<script lang="ts">
	import type { VersionParts } from '$lib/types/version';
	import NumberInput from '$lib/components/forms/NumberInput.svelte';

	let { value = $bindable(), label }: {
		value: VersionParts;
		label?: string;
	} = $props();

	const PART = 'w-14 shrink-0';
</script>

<div class="flex flex-row items-center justify-between gap-2 text-sm dark:text-white">
	{#if label}
		<span class="whitespace-nowrap">{label}</span>
	{/if}
	<div class="ml-auto flex flex-row items-center gap-1">
		<span>v</span>
		<div class={PART}><NumberInput bind:value={value.major} min={0} step={1} /></div>
		<span>.</span>
		<div class={PART}><NumberInput bind:value={value.minor} min={0} step={1} /></div>
		<span>.</span>
		<div class={PART}><NumberInput bind:value={value.patch} min={0} step={1} /></div>
	</div>
</div>
