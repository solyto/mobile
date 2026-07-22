<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';

	let {
		input = $bindable(),
		date = $bindable(),
		placeholder,
		onblur,
		oninput
	} = $props<{
		input?: HTMLInputElement | null;
		date: SvelteDate;
		placeholder?: string;
		onblur?: () => void;
		oninput?: () => void;
	}>();

	let value = $derived<string>(
		`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
	);

	function update(value: string) {
		const [year, month, day] = value.split('-').map(Number);
		date.setFullYear(year, month - 1, day);
	}
</script>

<input
	bind:this={input}
	bind:value
	onchange={(e) => update(e.currentTarget.value)}
	{onblur}
	{oninput}
	type="date"
	class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-2 dark:focus:ring-c-primary"
	{placeholder}
/>
