<script lang="ts">
	let {
		input = $bindable(),
		value = $bindable(),
		placeholder,
		onblur,
		oninput,
		min,
		max,
		step
	}: {
		input?: HTMLInputElement | HTMLTextAreaElement | null;
		value: number | null;
		placeholder?: string;
		onblur?: () => void;
		oninput?: () => void;
		min?: number;
		max?: number;
		step?: number | 'any';
	} = $props();
</script>

<input
	bind:this={input}
	bind:value
	{onblur}
	{oninput}
	{min}
	{max}
	{step}
	type="number"
	class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary"
	{placeholder}
/>
