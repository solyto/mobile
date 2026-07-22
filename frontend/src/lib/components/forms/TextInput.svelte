<script lang="ts">
	let {
		input = $bindable(),
		value = $bindable(),
		placeholder,
		onblur,
		oninput,
		multiLine = false,
		height = null,
		tabindex = null
	} = $props<{
		input?: HTMLInputElement | HTMLTextAreaElement | null;
		value: string;
		placeholder?: string;
		onblur?: () => void;
		oninput?: () => void;
		multiLine?: boolean;
		height?: number | null;
		tabindex?: number | null;
	}>();
</script>

{#if !multiLine}
	<input
		bind:this={input}
		bind:value
		{onblur}
		{oninput}
		type="text"
		class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary"
		{placeholder}
		{tabindex}
	/>
{:else}
	<textarea
		bind:this={input}
		bind:value
		{onblur}
		{oninput}
		class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary"
		style="height: {height}px;"
		{placeholder}
		{tabindex}
	></textarea>
{/if}
