<script lang="ts">
	let {
		value = $bindable(),
		options,
		onchange
	}: {
		value: string | null;
		options: { label: string; value: string }[];
		onchange?: (value: string) => void;
	} = $props();

	function select(optionValue: string): void {
		value = optionValue;
		onchange?.(optionValue);
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	{#each options as option (option.value)}
		<button
			type="button"
			class="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium drop-shadow-sm transition-all"
			class:bg-c-bg-elevated={value !== option.value}
			class:dark:text-white={value !== option.value}
			class:bg-c-btn={value === option.value}
			class:text-white={value === option.value}
			aria-pressed={value === option.value}
			onclick={() => select(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>
