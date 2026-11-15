<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		input = $bindable(),
		value = $bindable(),
		placeholder,
		onblur,
		oninput,
		onkeydown,
		multiLine = false,
		height = null,
		tabindex = null,
		id,
		inputmode,
		autocapitalize,
		autocorrect,
		spellcheck,
		autocomplete,
		ariaDescribedby,
		class: customClass = ''
	}: {
		input?: HTMLInputElement | HTMLTextAreaElement | null;
		value: string;
		placeholder?: string;
		onblur?: () => void;
		oninput?: () => void;
		onkeydown?: (event: KeyboardEvent) => void;
		multiLine?: boolean;
		height?: number | null;
		tabindex?: number | null;
		id?: string;
		inputmode?: HTMLInputAttributes['inputmode'];
		autocapitalize?: HTMLInputAttributes['autocapitalize'];
		autocorrect?: HTMLInputAttributes['autocorrect'];
		spellcheck?: boolean;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		ariaDescribedby?: string;
		class?: string;
	} = $props();
</script>

{#if !multiLine}
	<input
		bind:this={input}
		bind:value
		{onblur}
		{oninput}
		{onkeydown}
		type="text"
		class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary {customClass}"
		{placeholder}
		{tabindex}
		{id}
		{inputmode}
		{autocapitalize}
		{autocorrect}
		{spellcheck}
		{autocomplete}
		aria-describedby={ariaDescribedby}
	/>
{:else}
	<textarea
		bind:this={input}
		bind:value
		{onblur}
		{oninput}
		{onkeydown}
		class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-3 dark:bg-inherit dark:text-white dark:focus:ring-c-primary {customClass}"
		style="height: {height}px;"
		{placeholder}
		{tabindex}
		{id}
		{inputmode}
		{autocapitalize}
		{spellcheck}
		{autocomplete}
		aria-describedby={ariaDescribedby}
	></textarea>
{/if}
