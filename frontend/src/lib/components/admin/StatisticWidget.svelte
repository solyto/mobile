<script lang="ts">
	import { scale } from 'svelte/transition';
	import { humanReadableNumber } from '$lib/helpers/NumberHelper.js';

	let {
		label,
		number,
		loadDelay,
		icon,
		color = 'teal'
	} = $props<{
		label: string;
		number: number;
		loadDelay?: number;
		icon?: any;
		color?: 'teal' | 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';
	}>();

	const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
		teal: { bg: 'bg-c-primary/10 dark:bg-c-primary/20', text: 'text-c-primary', border: 'border-c-primary/40' },
		blue: { bg: 'bg-c-btn/10 dark:bg-c-btn/20', text: 'text-c-btn', border: 'border-c-btn/40' },
		green: { bg: 'bg-c-success/10 dark:bg-c-success/20', text: 'text-c-success', border: 'border-c-success/40' },
		purple: { bg: 'bg-c-heading/10 dark:bg-c-heading/20', text: 'text-c-heading', border: 'border-c-heading/40' },
		orange: { bg: 'bg-c-action/10 dark:bg-c-action/20', text: 'text-c-action', border: 'border-c-action/40' },
		red: { bg: 'bg-c-danger/10 dark:bg-c-danger/20', text: 'text-c-danger', border: 'border-c-danger/40' },
		yellow: { bg: 'bg-c-warning/10 dark:bg-c-warning/20', text: 'text-c-warning', border: 'border-c-warning/40' }
	};

	const colors = colorClasses[color];
</script>

<div
	class="flex items-center gap-4 rounded-xl border border-c-neutral-1 bg-c-bg-surface p-4 shadow-sm transition-shadow hover:shadow-md dark:border-s-dark-3"
	in:scale={{ delay: loadDelay ?? 0, duration: 200 }}
>
	<div class="rounded-lg p-3 {colors.bg}">
		<span class={colors.text}>{@render icon?.({ class: 'w-6 h-6' })}</span>
	</div>
	<div class="flex flex-col">
		<span class="text-sm text-c-neutral-5 dark:text-c-neutral-4">{label}</span>
		<span class="text-2xl font-semibold text-c-neutral-9 dark:text-white"
			>{humanReadableNumber(number)}</span
		>
	</div>
</div>
