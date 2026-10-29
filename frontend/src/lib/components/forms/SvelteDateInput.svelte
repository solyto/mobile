<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';

	let {
		input = $bindable(),
		date = $bindable(),
		placeholder,
		onblur,
		oninput
	}: {
		input?: HTMLInputElement | null;
		date: SvelteDate;
		placeholder?: string;
		onblur?: () => void;
		oninput?: () => void;
	} = $props();

	let value = $derived<string>(
		`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
	);

	function update(value: string) {
		const [year, month, day] = value.split('-').map(Number);
		date.setFullYear(year, month - 1, day);
	}

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		if (e.currentTarget.value) update(e.currentTarget.value);
		oninput?.();
	}
</script>

<input
	bind:this={input}
	{value}
	oninput={handleInput}
	{onblur}
	type="date"
	class="w-full rounded-lg border-1 border-c-neutral-2 text-sm shadow-xs transition-all focus:ring-2 focus:ring-d-lightblue focus:outline-none dark:border-s-dark-2 dark:focus:ring-c-primary"
	{placeholder}
/>
