<script lang="ts">
	let {
		input = $bindable(),
		value = $bindable(),
		options,
		onchange
	} = $props<{
		input?: HTMLSelectElement | null;
		value: string;
		options: { label: string; value: string }[];
		onchange?: (value: string) => void;
	}>();
</script>

<select
	class="h-10 w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary"
	bind:this={input}
	bind:value
	onchange={() => onchange?.(value)}
>
	{#each options as option (option.value)}
		<option class="dark:bg-s-dark-3 dark:text-white" value={option.value}>{option.label}</option
		>
	{/each}
</select>
