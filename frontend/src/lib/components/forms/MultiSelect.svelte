<!--suppress CssUnusedSymbol -->
<script lang="ts">
	import MultiSelect from 'svelte-multiselect';

	export interface MultiSelectEntry {
		label: string;
		value: string;
	}

	let {
		value = $bindable(),
		options,
		allowUserOptions = false,
		placeholder = '',
		oncreate
	} = $props<{
		value: MultiSelectEntry[];
		options: MultiSelectEntry[];
		allowUserOptions?: boolean;
		placeholder?: string;
		oncreate?: (data: { option: MultiSelectEntry }) => unknown;
	}>();
</script>

<div class="w-full">
	<MultiSelect
		bind:selected={value}
		{options}
		{allowUserOptions}
		{placeholder}
		{oncreate}
		--sms-active-color="#eaf2fc"
	/>
</div>

<style>
	@media (prefers-color-scheme: dark) {
		:global(div.multiselect) {
			background: inherit;
			color: #ffffff;
			border: 1px solid #2f3741 !important;
		}

		:global(div.multiselect > ul > li) {
			background-color: #36363a !important;
		}

		:global(div.multiselect > ul > li:hover) {
			background-color: #2f3741 !important;
		}

		:global(div.multiselect > ul.selected > li) {
			background-color: #36363a !important;
		}
	}

	@media (prefers-color-scheme: light) {
		:global(div.multiselect) {
			background: #ffffff;
			color: #000000;
			border: 1px solid #efe7eb !important;
		}

		:global(div.multiselect > ul.selected > li) {
			background-color: #eaf2fc !important;
		}
	}

	:global(div.multiselect) {
		height: 40px;
		border-radius: 8px !important;
		margin: 0 !important;
		transition: all 0.1s;
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
	}

	:global(div.multiselect:has(input:focus)) {
		outline: none;
		box-shadow: 0 0 0 2px #eaf2fc;
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
