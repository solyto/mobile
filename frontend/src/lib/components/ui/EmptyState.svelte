<script lang="ts">
	import { blur } from 'svelte/transition';

	const PADDING_Y = { 0: 'py-0', 2: 'py-2', 4: 'py-4', 6: 'py-6' } as const;

	let { title, description = null, py = 0, titleSize = 'text-xl', align = 'center' }: {
		title: string;
		description?: string | null;
		py?: keyof typeof PADDING_Y;
		titleSize?: 'text-lg' | 'text-xl';
		align?: 'center' | 'left';
	} = $props();
</script>

<div
	class="flex w-full flex-col {PADDING_Y[py]}"
	class:items-center={align === 'center'}
	in:blur={{ duration: 200 }}
>
	<div
		class="tracking-wide text-c-heading dark:text-c-primary {titleSize}"
		class:text-center={align === 'center'}
	>{title}</div>
	{#if description !== null}
		<p
			class="mt-2 max-w-sm text-sm leading-relaxed text-c-neutral-5 dark:text-c-neutral-4"
			class:text-center={align === 'center'}
		>
			{description}
		</p>
	{/if}
</div>
