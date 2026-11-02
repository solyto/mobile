<!--suppress CssUnusedSymbol -->
<script lang="ts" module>
	export type MultiSelectEntry = {
		label: string;
		value: string;
	};
</script>

<script lang="ts">
	import MultiSelect from 'svelte-multiselect';

	let {
		value = $bindable(),
		options,
		allowUserOptions = false,
		placeholder = '',
		oncreate
	}: {
		value: MultiSelectEntry[];
		options: MultiSelectEntry[];
		allowUserOptions?: boolean;
		placeholder?: string;
		oncreate?: (data: { option: MultiSelectEntry }) => unknown;
	} = $props();
</script>

<div class="multiselect-field w-full">
	<MultiSelect
		bind:selected={value}
		{options}
		{allowUserOptions}
		{placeholder}
		{oncreate}
		portal={{ active: true }}
		ulOptionsStyle="z-index: 60;"
	/>
</div>

<style>
	.multiselect-field,
	:global(ul.options) {
		--sms-border: 1px solid var(--color-c-neutral-2);
		--sms-options-border: 1px solid var(--color-c-neutral-2);
		--sms-options-border-width: 1px;
		--sms-options-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
		--sms-active-color: var(--color-d-lightblue);
		--sms-selected-bg: var(--color-d-lightblue);
		--sms-options-bg: var(--color-c-bg-surface);
		--multiselect-focus-ring: var(--color-d-lightblue);
	}

	:global(html.dark) .multiselect-field,
	:global(html.dark ul.options) {
		--sms-border: 1px solid var(--color-s-dark-3);
		--sms-options-border: 1px solid var(--color-s-dark-3);
		--sms-text-color: var(--color-white);
		--sms-active-color: var(--color-s-dark-3);
		--sms-selected-bg: var(--color-s-dark-3);
		--multiselect-focus-ring: var(--color-c-primary);
	}

	:global(div.multiselect) {
		height: 40px;
		border-radius: var(--radius-lg) !important;
		margin: 0 !important;
		transition: all 0.1s;
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
	}

	:global(div.multiselect > ul.selected) {
		min-width: 0;
	}

	:global(div.multiselect > ul.selected > input) {
		width: 0;
	}

	:global(div.multiselect:has(input:focus)) {
		outline: none;
		box-shadow: 0 0 0 2px var(--multiselect-focus-ring);
	}

	:global(div.multiselect > ul.selected),
	:global(div.multiselect > ul.selected:focus),
	:global(div.multiselect > ul.selected > input),
	:global(div.multiselect > ul.selected > input:focus) {
		outline: none !important;
		border: none !important;
		box-shadow: none !important;
	}
</style>
