<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		onclick,
		label,
		disabled = false,
		color = 'text-c-neutral-4',
		danger = false,
		class: customClass = '',
		children
	}: {
		onclick: (event: MouseEvent) => void;
		label: string;
		disabled?: boolean;
		color?: string;
		danger?: boolean;
		class?: string;
		children: Snippet;
	} = $props();
</script>

<button
	type="button"
	class={[
		'flex cursor-pointer items-center justify-center rounded-full p-2 transition-colors hover:bg-c-neutral-1 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-s-dark-3',
		danger ? 'text-c-danger' : [color, 'hover:text-c-primary'],
		customClass
	]}
	title={label}
	aria-label={label}
	{disabled}
	{onclick}
>
	{@render children()}
</button>
